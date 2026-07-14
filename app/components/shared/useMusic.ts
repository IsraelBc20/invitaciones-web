"use client";

import { useEffect, useSyncExternalStore } from "react";

// Reproductor único a nivel de módulo, con "grupos" por diseño: la invitación,
// su galería y las rutas de clientes del mismo diseño comparten grupo (p. ej.
// "oliva" para /oliva, /oliva/galeria y /oliva/<cliente>). Mientras la
// navegación client-side (<Link>, nunca <a>) se mueva entre rutas del mismo
// grupo, la canción sigue sonando; cuando se desmonta la última ruta del grupo
// (ir al catálogo o a otro diseño) el audio se detiene y rebobina. Cambiar de
// diseño nunca arranca la canción del otro sola: solo el botón de ingresar.

let audio: HTMLAudioElement | null = null;
let audioGroup: string | null = null;
// grupo -> cantidad de componentes montados que usan música de ese grupo
const mountedByGroup = new Map<string, number>();
let stopCheckTimer: number | null = null;

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const resolve = (src: string) => new URL(src, window.location.href).href;

const isPlaying = (src: string) =>
  audio !== null && audio.src === resolve(src) && !audio.paused;

function stopAudio() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  emit();
}

// Tras un desmontaje se espera un tick antes de decidir: en una navegación
// dentro del mismo grupo la ruta nueva se monta enseguida y el conteo vuelve
// a ser > 0, así el audio no se corta entre invitación y galería.
function scheduleStopCheck() {
  if (stopCheckTimer !== null) window.clearTimeout(stopCheckTimer);
  stopCheckTimer = window.setTimeout(() => {
    stopCheckTimer = null;
    if (audioGroup && (mountedByGroup.get(audioGroup) ?? 0) === 0) stopAudio();
  }, 200);
}

function getAudio(src: string, group: string) {
  const href = resolve(src);
  if (audio?.src === href) {
    audioGroup = group;
    return audio;
  }
  audio?.pause();
  audio = new Audio(href);
  audioGroup = group;
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.5;
  emit();
  return audio;
}

export function useMusic(src: string, group: string) {
  // Al montar lee el estado real del singleton: si se llega a la galería con
  // la canción sonando, el FAB debe aparecer en "reproduciendo".
  const playing = useSyncExternalStore(
    subscribe,
    () => isPlaying(src),
    () => false
  );

  useEffect(() => {
    mountedByGroup.set(group, (mountedByGroup.get(group) ?? 0) + 1);
    // Si quedó sonando la canción de otro diseño sin rutas montadas
    // (p. ej. /oliva → /playa), se corta de inmediato.
    if (audioGroup && audioGroup !== group && (mountedByGroup.get(audioGroup) ?? 0) === 0) {
      stopAudio();
    }
    return () => {
      mountedByGroup.set(group, Math.max(0, (mountedByGroup.get(group) ?? 0) - 1));
      scheduleStopCheck();
    };
  }, [group]);

  const play = () => {
    getAudio(src, group)
      .play()
      .then(emit)
      .catch(() => {});
  };

  const toggle = () => {
    const a = getAudio(src, group);
    if (a.paused) {
      a.play()
        .then(emit)
        .catch(() => {});
    } else {
      a.pause();
      emit();
    }
  };

  return { playing, play, toggle };
}
