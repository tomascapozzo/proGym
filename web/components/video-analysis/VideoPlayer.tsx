"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import type { TagConfig } from "@/types";

function fmt(s: number): string {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

interface Props {
  src: string;
  tagConfigs: TagConfig[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onTag: (tagKey: number, timestamp: number) => void;
  onTimeUpdate: (t: number) => void;
  onDurationChange: (d: number) => void;
}

export default function VideoPlayer({
  src,
  tagConfigs,
  videoRef,
  onTag,
  onTimeUpdate,
  onDurationChange,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [flash, setFlash] = useState<{ key: number; label: string; color: string } | null>(null);

  const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for callbacks to avoid stale closures in the keydown handler
  const onTagRef = useRef(onTag);
  const tagConfigsRef = useRef(tagConfigs);
  useEffect(() => { onTagRef.current = onTag; }, [onTag]);
  useEffect(() => { tagConfigsRef.current = tagConfigs; }, [tagConfigs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = parseInt(e.key, 10);
      if (!isNaN(key) && key >= 0 && key <= 9) {
        e.preventDefault();
        const video = videoRef.current;
        if (!video) return;
        const config = tagConfigsRef.current.find((c) => c.key === key);
        if (!config) return;
        onTagRef.current(key, video.currentTime);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        setFlash({ key, label: config.label, color: config.color });
        flashTimer.current = setTimeout(() => setFlash(null), 1400);
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        const v = videoRef.current;
        if (!v) return;
        v.paused ? v.play() : v.pause();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const v = videoRef.current;
        if (v) v.currentTime = Math.max(0, v.currentTime - 5);
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const v = videoRef.current;
        if (v) v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [videoRef]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    onTimeUpdate(v.currentTime);
  };

  const handleDurationChange = () => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    setDuration(v.duration);
    onDurationChange(v.duration);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = parseFloat(e.target.value);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseFloat(e.target.value);
    const v = videoRef.current;
    if (v) v.playbackRate = val;
    setSpeed(val);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const v = videoRef.current;
    if (v) {
      v.volume = val;
      v.muted = val === 0;
    }
    setVolume(val);
    setMuted(val === 0);
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#000",
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid var(--pg-border)",
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        src={src}
        style={{ width: "100%", display: "block", maxHeight: 460 }}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Flash tag indicator */}
      {flash && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: flash.color + "20",
            border: `1px solid ${flash.color}55`,
            borderRadius: 9,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: flash.color + "25",
              border: `1px solid ${flash.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: flash.color,
              flexShrink: 0,
            }}
          >
            {flash.key}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: flash.color }}>
            {flash.label}
          </span>
        </div>
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          padding: "28px 14px 12px",
        }}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          value={currentTime}
          step={0.1}
          onChange={seek}
          className="pg-seek"
          style={{ width: "100%", marginBottom: 8, cursor: "pointer" }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={togglePlay}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: 6,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.75)",
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div style={{ flex: 1 }} />

          <select
            value={speed}
            onChange={changeSpeed}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 6,
              color: "rgba(255,255,255,0.85)",
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 6px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s} style={{ background: "#111", color: "#fff" }}>
                {s === 1 ? "1x" : `${s}x`}
              </option>
            ))}
          </select>

          <button
            onClick={toggleMute}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={changeVolume}
            className="pg-seek"
            style={{ width: 70, cursor: "pointer" }}
          />
        </div>
      </div>
    </div>
  );
}
