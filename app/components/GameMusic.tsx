'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CuckGuessr.module.css';

/**
 * Background music for CuckGuessr ("RXDXVIL - SUBWAY SURFERS PHONK").
 *
 * Contract: nothing plays on page load. The YouTube IFrame API is loaded at
 * idle and the hidden player is created *cued* (autoplay 0) so its handshake
 * is already done before the visitor acts. Playback starts only when
 * `requested` flips true — the render pass right after the "Start the game"
 * click — or when the visitor presses the audio chip themselves. It then
 * loops for the whole visit and stops when the game page unmounts.
 */

const VIDEO_ID = 'wBv7ZczMqi8';
const VOLUME = 40;

/** The few YT.PlayerState ids the chip logic needs. */
const PLAYER_STATE = { ENDED: 0, BUFFERING: 3, PLAYING: 1 };

type YTPlayer = {
  playVideo(): void;
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getPlayerState(): number;
  isMuted(): boolean;
  getCurrentTime(): number;
  destroy(): void;
};

type YTPlayerOptions = {
  videoId: string;
  host: string;
  playerVars: Record<string, string | number>;
  events: {
    onReady: () => void;
    onStateChange: (event: { data: number }) => void;
    onError: () => void;
  };
};

type YTNamespace = {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number };
};

/** Read-only probe for verify/MCP passes (and human debugging). */
type AudioProbe = {
  state: () => string;
  time: () => number;
  muted: () => boolean;
};

declare global {
  interface Window {
    YT?: Partial<YTNamespace>;
    onYouTubeIframeAPIReady?: () => void;
    __cuckGuessrAudio?: AudioProbe;
  }
}

type AudioState = 'loading' | 'cued' | 'playing' | 'muted' | 'tap' | 'unavailable';

let youtubeApi: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  const loaded = window.YT;
  if (loaded?.Player && loaded?.PlayerState) return Promise.resolve(loaded as YTNamespace);
  if (youtubeApi) return youtubeApi;

  youtubeApi = new Promise<YTNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      const yt = window.YT;
      if (yt?.Player && yt?.PlayerState) resolve(yt as YTNamespace);
      else reject(new Error('YouTube API namespace incomplete'));
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => reject(new Error('YouTube API script failed'));
    document.head.appendChild(script);
    // An unreachable YouTube must never hold the game hostage: give up and
    // let the chip report the feature as unavailable.
    window.setTimeout(() => {
      const yt = window.YT;
      if (!yt?.Player) reject(new Error('YouTube API timed out'));
    }, 10000);
  });
  return youtubeApi;
}

export default function GameMusic({ requested }: { requested: boolean }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const destroyedRef = useRef(false);
  const startedRef = useRef(false);
  const pendingRef = useRef(false);
  const stateRef = useRef<AudioState>('loading');
  const [audio, setAudioState] = useState<AudioState>('loading');

  function setAudio(next: AudioState) {
    stateRef.current = next;
    setAudioState(next);
  }

  /** Start (or recover) audible playback; safe to call repeatedly. */
  function attemptStart() {
    if (destroyedRef.current) return;
    if (startedRef.current && stateRef.current !== 'tap') return;
    if (!readyRef.current || !playerRef.current) {
      pendingRef.current = true;
      return;
    }
    pendingRef.current = false;
    try {
      playerRef.current.seekTo(0, true);
      playerRef.current.setVolume(VOLUME);
      playerRef.current.unMute();
      playerRef.current.playVideo();
      startedRef.current = true;
      setAudio('playing');
      // Browser autoplay policies can swallow an unmuted start. Detect it
      // once and surface the manual fallback instead of retrying forever.
      window.setTimeout(() => {
        const player = playerRef.current;
        if (destroyedRef.current || !player || !startedRef.current) return;
        if (stateRef.current !== 'playing') return;
        const state = player.getPlayerState();
        if (state !== PLAYER_STATE.PLAYING && state !== PLAYER_STATE.BUFFERING) {
          setAudio('tap');
        }
      }, 700);
    } catch {
      setAudio('tap');
    }
  }

  function onChipClick() {
    const player = playerRef.current;
    if (audio === 'loading' || audio === 'unavailable' || !readyRef.current || !player) return;
    if (!startedRef.current || stateRef.current === 'tap') {
      attemptStart();
      return;
    }
    if (player.isMuted()) {
      player.unMute();
      setAudio('playing');
    } else {
      player.mute();
      setAudio('muted');
    }
  }

  // Pre-arm, once per mount: after paint, load the API and create the cued
  // hidden player so a game-start click can play within the gesture window.
  useEffect(() => {
    destroyedRef.current = false;
    const timer = window.setTimeout(() => {
      loadYouTubeApi()
        .then((YT) => {
          if (destroyedRef.current || !stageRef.current || playerRef.current) return;
          playerRef.current = new YT.Player(stageRef.current, {
            videoId: VIDEO_ID,
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              loop: 1,
              playlist: VIDEO_ID,
            },
            events: {
              onReady: () => {
                if (destroyedRef.current) return;
                readyRef.current = true;
                setAudio('cued');
                if (pendingRef.current) attemptStart();
              },
              onStateChange: (event) => {
                // Belt-and-braces loop: relaunch on end even if YouTube
                // ignores the loop/playlist playerVars.
                if (destroyedRef.current || !startedRef.current) return;
                if (event.data !== YT.PlayerState.ENDED) return;
                playerRef.current?.seekTo(0, true);
                playerRef.current?.playVideo();
              },
              onError: () => {
                if (!destroyedRef.current) setAudio('unavailable');
              },
            },
          });
        })
        .catch(() => {
          if (!destroyedRef.current) setAudio('unavailable');
        });
    }, 120);

    return () => {
      destroyedRef.current = true;
      window.clearTimeout(timer);
      try {
        playerRef.current?.destroy();
      } catch {
        // Player already gone; nothing to unwind.
      }
      playerRef.current = null;
      readyRef.current = false;
      startedRef.current = false;
      pendingRef.current = false;
    };
  }, []);

  // The game-start click lands here: `requested` flips in the same render
  // pass, so the activation window from the click is still open.
  useEffect(() => {
    if (requested) attemptStart();
  }, [requested]);

  // Read-only test hook for verify/MCP passes.
  useEffect(() => {
    window.__cuckGuessrAudio = {
      state: () => stateRef.current,
      time: () => playerRef.current?.getCurrentTime() ?? -1,
      muted: () => playerRef.current?.isMuted() ?? true,
    };
    return () => {
      delete window.__cuckGuessrAudio;
    };
  }, []);

  const chipText =
    audio === 'loading'
      ? '♪ Music…'
      : audio === 'cued'
        ? '♪ Audio'
        : audio === 'playing'
          ? '♪ Audio on'
          : audio === 'muted'
            ? '♪ Muted'
            : audio === 'tap'
              ? 'Tap for sound'
              : '♪ Unavailable';
  const chipClass =
    audio === 'playing'
      ? styles.audioChipOn
      : audio === 'muted'
        ? styles.audioChipMuted
        : audio === 'tap'
          ? styles.audioChipTap
          : '';

  return (
    <>
      <button
        type="button"
        className={`${styles.audioChip} ${chipClass}`}
        onClick={onChipClick}
        disabled={audio === 'loading' || audio === 'unavailable'}
        aria-label={`Game music: ${chipText}`}
        title="Music starts with the game. Click to mute or unmute."
      >
        {chipText}
      </button>
      <div className={styles.musicStage} aria-hidden="true">
        <div ref={stageRef} />
      </div>
    </>
  );
}
