"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Film, Plus, UploadCloud, X } from "lucide-react";
import type { TagConfig, VideoTag, VideoClip } from "@/types";
import VideoPlayer from "@/components/video-analysis/VideoPlayer";
import TagSetupPanel, { DEFAULT_TAG_CONFIGS } from "@/components/video-analysis/TagSetupPanel";
import TagTimeline from "@/components/video-analysis/TagTimeline";
import TagsList from "@/components/video-analysis/TagsList";
import ClipModal from "@/components/video-analysis/ClipModal";
import ClipsList from "@/components/video-analysis/ClipsList";

const LS_KEY = "pg_tag_configs";

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function fmt(s: number): string {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function loadConfigs(): TagConfig[] {
  if (typeof window === "undefined") return DEFAULT_TAG_CONFIGS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as TagConfig[];
  } catch {
    // ignore
  }
  return DEFAULT_TAG_CONFIGS;
}

export default function VideoAnalysisPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tagConfigsRef = useRef<TagConfig[]>(DEFAULT_TAG_CONFIGS);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoName, setVideoName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [tagConfigs, setTagConfigs] = useState<TagConfig[]>(DEFAULT_TAG_CONFIGS);
  const [tags, setTags] = useState<VideoTag[]>([]);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showClipModal, setShowClipModal] = useState(false);

  // Load tag configs from localStorage once on mount
  useEffect(() => {
    setTagConfigs(loadConfigs());
  }, []);

  // Keep ref in sync and persist to localStorage
  useEffect(() => {
    tagConfigsRef.current = tagConfigs;
    localStorage.setItem(LS_KEY, JSON.stringify(tagConfigs));
  }, [tagConfigs]);

  const loadFile = (file: File) => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setVideoName(file.name);
    setTags([]);
    setClips([]);
    setCurrentTime(0);
    setDuration(0);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) loadFile(file);
  };

  const handleTag = useCallback((tagKey: number, timestamp: number) => {
    const config = tagConfigsRef.current.find((c) => c.key === tagKey);
    if (!config) return;
    const tagId = uuid();
    const clipId = uuid();
    const before = config.clipBefore ?? 5;
    const after = config.clipAfter ?? 5;
    const dur = videoRef.current?.duration ?? 0;
    setTags((prev) => [
      ...prev,
      { id: tagId, tagKey, timestamp, label: config.label, color: config.color, clipId },
    ]);
    setClips((prev) => [
      ...prev,
      {
        id: clipId,
        tagId,
        name: `${config.label} ${fmt(timestamp)}`,
        startTime: Math.max(0, timestamp - before),
        endTime: Math.min(dur, timestamp + after),
      },
    ]);
  }, [videoRef]);

  const handleSeek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
  };

  const addClip = (clip: Omit<VideoClip, "id">) => {
    setClips((prev) => [...prev, { ...clip, id: crypto.randomUUID() }]);
  };

  const deleteTag = (id: string) => {
    const tag = tags.find((t) => t.id === id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    if (tag?.clipId) setClips((prev) => prev.filter((c) => c.id !== tag.clipId));
  };
  const deleteClip = (id: string) => {
    const clip = clips.find((c) => c.id === id);
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (clip?.tagId) setTags((prev) => prev.filter((t) => t.id !== clip.tagId));
  };
  const updateTag = (id: string, label: string) =>
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)));

  // Upload screen
  if (!videoUrl) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          overflow: "hidden",
        }}
      >
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--pg-accent-bg)",
              border: "1px solid rgba(212,168,83,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Film size={24} color="var(--pg-accent)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--pg-text)", marginBottom: 6 }}>
            Análisis de video
          </h1>
          <p style={{ fontSize: 13, color: "var(--pg-muted)", maxWidth: 360 }}>
            Carga un video del partido o jugadas y etiqueta momentos clave con las teclas 0–9.
          </p>
        </div>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: "100%",
            maxWidth: 460,
            border: `2px dashed ${dragOver ? "var(--pg-accent)" : "var(--pg-border)"}`,
            borderRadius: 14,
            padding: "40px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            transition: "border-color 0.2s",
            background: dragOver ? "var(--pg-accent-alt)" : "var(--pg-card)",
          }}
        >
          <input type="file" accept="video/*" onChange={handleFileInput} style={{ display: "none" }} />
          <UploadCloud size={32} color={dragOver ? "var(--pg-accent)" : "var(--pg-muted)"} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: dragOver ? "var(--pg-accent)" : "var(--pg-text)" }}>
              Arrastra un video aquí
            </span>
            <br />
            <span style={{ fontSize: 12, color: "var(--pg-muted)" }}>o haz clic para seleccionar</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--pg-disabled)" }}>MP4, MOV, MKV, WebM…</span>
        </label>
      </div>
    );
  }

  // Main analysis layout
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: "1px solid var(--pg-border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Film size={16} color="var(--pg-accent)" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--pg-text)" }}>
              Análisis de video
            </div>
            <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 1 }}>{videoName}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowClipModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--pg-border)",
              background: "var(--pg-surface)",
              color: "var(--pg-text)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={13} />
            Clip
          </button>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              background: "var(--pg-accent)",
              color: "var(--pg-accent-text)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <input type="file" accept="video/*" onChange={handleFileInput} style={{ display: "none" }} />
            <UploadCloud size={13} />
            Nuevo video
          </label>

          <button
            onClick={() => {
              URL.revokeObjectURL(videoUrl);
              setVideoUrl("");
              setVideoName("");
              setTags([]);
              setClips([]);
            }}
            style={{
              background: "none",
              border: "1px solid var(--pg-border)",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--pg-muted)",
            }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          gap: 0,
        }}
      >
        {/* Left: video + timeline + clips */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: "16px 16px 16px 20px",
            gap: 14,
          }}
        >
          <VideoPlayer
            src={videoUrl}
            tagConfigs={tagConfigs}
            videoRef={videoRef}
            onTag={handleTag}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
          />

          <TagTimeline
            duration={duration}
            currentTime={currentTime}
            tags={tags}
            clips={clips}
            onSeek={handleSeek}
          />

          <ClipsList
            clips={clips}
            videoRef={videoRef}
            onDelete={deleteClip}
          />
        </div>

        {/* Right: tag setup + tags list */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            borderLeft: "1px solid var(--pg-border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Tag setup */}
          <div
            style={{
              padding: "16px 14px",
              borderBottom: "1px solid var(--pg-border)",
              flexShrink: 0,
            }}
          >
            <TagSetupPanel configs={tagConfigs} onChange={setTagConfigs} />
          </div>

          {/* Tags list */}
          <div
            style={{
              flex: 1,
              padding: "14px 14px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <TagsList
              tags={tags}
              onDelete={deleteTag}
              onSeek={handleSeek}
              onUpdateTag={updateTag}
            />
          </div>
        </div>
      </div>

      {showClipModal && (
        <ClipModal
          tags={tags}
          duration={duration}
          currentTime={currentTime}
          onSave={addClip}
          onClose={() => setShowClipModal(false)}
        />
      )}
    </div>
  );
}
