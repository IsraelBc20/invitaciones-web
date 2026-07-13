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
