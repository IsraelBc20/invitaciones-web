"use client";

import { useSyncExternalStore } from "react";

// Reproductor único a nivel de módulo: el <audio> no vive en el árbol de React,
// así la canción sigue sonando al navegar client-side entre la invitación y su
// galería. Requiere que esos enlaces sean <Link> de next/link (un <a> normal
// recarga la página y mata el audio). Solo se detiene cuando el usuario pausa
// o cuando otro diseño carga una canción distinta.

let audio: HTMLAudioElement | null = null;
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

function getAudio(src: string) {
  const href = resolve(src);
  if (audio?.src === href) return audio;
  audio?.pause();
  audio = new Audio(href);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.5;
  emit();
  return audio;
}

export function useMusic(src: string) {
  // Al montar lee el estado real del singleton: si se llega a la galería con
  // la canción sonando, el FAB debe aparecer en "reproduciendo".
  const playing = useSyncExternalStore(
    subscribe,
    () => isPlaying(src),
    () => false
  );

  const play = () => {
    getAudio(src)
      .play()
      .then(emit)
      .catch(() => {});
  };

  const toggle = () => {
    const a = getAudio(src);
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
