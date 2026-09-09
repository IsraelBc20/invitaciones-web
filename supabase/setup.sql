-- Tabla de fotos subidas por los invitados
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  uploader_name text not null,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

-- Los invitados (anon) pueden ver e insertar fotos
create policy "Anyone can view photos"
  on public.photos for select
  to anon, authenticated
  using (true);

create policy "Anyone can insert photos"
  on public.photos for insert
  to anon, authenticated
  with check (true);

-- Bucket público para las fotos
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do update set public = true;

-- Los invitados pueden subir al bucket; lectura pública
create policy "Anyone can upload wedding photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'wedding-photos');

create policy "Public read wedding photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'wedding-photos');

-- ─── Migración: multi-diseño (catálogo) ──────────────────────────────────────
-- Cada foto pertenece a un diseño ('oliva', 'playa', ...). Las fotos existentes
-- quedan en 'oliva'. Los archivos nuevos se guardan en subcarpetas del bucket
-- (oliva/archivo.jpg). EJECUTAR EN EL SQL EDITOR DEL DASHBOARD.

alter table public.photos
add column if not exists design text not null default 'oliva';

create index if not exists photos_design_idx on public.photos(design);

-- ─── Migración: fotos y videos ───────────────────────────────────────────────
-- Cada item registra si es foto o video y su tamaño en bytes. Las filas
-- existentes (todas .png) quedan como 'photo'. EJECUTAR EN EL SQL EDITOR.
-- Nota: el límite real de tamaño por archivo lo impone el "Upload file size
-- limit" del proyecto (Dashboard → Storage → Settings); para videos de hasta
-- 500MB hay que subirlo ahí también.

alter table public.photos
add column if not exists file_type text not null default 'photo';

alter table public.photos
add column if not exists file_size bigint;

alter table public.photos
drop constraint if exists photos_file_type_check;

alter table public.photos
add constraint photos_file_type_check check (file_type in ('photo', 'video'));

-- ─── Migración: expiración (15 días) + índice por invitado ───────────────────
-- expires_at marca cuándo puede eliminarse el archivo (la subida nueva lo pone
-- a +15 días desde lib/media.ts). El índice acelera la consulta del límite de
-- 500MB por invitado (uploader_name + design). EJECUTAR EN EL SQL EDITOR.

alter table public.photos
add column if not exists expires_at timestamptz;

create index if not exists photos_uploader_design_idx
on public.photos(uploader_name, design);

-- Fotos ya subidas de la boda de Israel & Marisol (tortuga-tropical):
-- se conservan hasta el 27 de septiembre de 2026.
update public.photos
set expires_at = '2026-09-27 23:59:59+00'
where design = 'tortuga-tropical';

-- ─── Migración: separar galerías por cliente (invitation) ────────────────────
-- Hasta ahora `photos` solo tenía `design`, así que la galería del demo y la de
-- cada cliente del mismo diseño mostraban LAS MISMAS fotos. `invitation` es el
-- slug de la invitación ('demo' o 'israel-y-marisol'), igual que la columna que
-- ya usa `song_requests`. EJECUTAR EN EL SQL EDITOR.

alter table public.photos
add column if not exists invitation text not null default 'demo';

-- La galería consulta siempre por design + invitation.
create index if not exists photos_design_invitation_idx
on public.photos(design, invitation);

-- El límite de 500MB por invitado se calcula por invitado + diseño + invitación.
drop index if exists photos_uploader_design_idx;
create index if not exists photos_uploader_design_invitation_idx
on public.photos(uploader_name, design, invitation);

-- Filas anteriores a esta migración: la URL del bucket solo guarda el diseño
-- (wedding-photos/<design>/foto-*.jpg), no el cliente, así que no hay forma de
-- deducir a qué invitación pertenecían. Quedan como 'demo' (el default), que es
-- donde se subieron mientras las rutas de clientes estaban bloqueadas.
update public.photos
set invitation = 'demo'
where invitation is null;
