"use client";

import { useRef, useState } from "react";
import { Play, Download, Trash2, Loader } from "lucide-react";
import type { VideoClip } from "@/types";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

interface Props {
  clips: VideoClip[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onDelete: (id: string) => void;
}

type ExportState = "idle" | "recording" | "done";

export default function ClipsList({ clips, videoRef, onDelete }: Props) {
  const [exportStates, setExportStates] = useState<Record<string, ExportState>>({});
  const activeRecorder = useRef<MediaRecorder | null>(null);

  const playClip = (clip: VideoClip) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clip.startTime;
    v.play();
    const stop = () => {
      if (v.currentTime >= clip.endTime) {
        v.pause();
        v.removeEventListener("timeupdate", stop);
      }
    };
    v.addEventListener("timeupdate", stop);
  };

  const exportClip = async (clip: VideoClip) => {
    const v = videoRef.current;
    if (!v) return;
    if (activeRecorder.current) return; // already recording

    setExportStates((s) => ({ ...s, [clip.id]: "recording" }));

    const prevTime = v.currentTime;
    const prevPaused = v.paused;

    const stream = (v as HTMLVideoElement & { captureStream(): MediaStream }).captureStream();

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    activeRecorder.current = recorder;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      activeRecorder.current = null;
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clip.name}.webm`;
      a.click();
      URL.revokeObjectURL(url);

      // Restore
      v.currentTime = prevTime;
      if (prevPaused) v.pause();

      setExportStates((s) => ({ ...s, [clip.id]: "done" }));
      setTimeout(() => setExportStates((s) => ({ ...s, [clip.id]: "idle" })), 3000);
    };

    const handleTimeUpdate = () => {
      if (v.currentTime >= clip.endTime) {
        recorder.stop();
        v.pause();
        v.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };

    const handleSeeked = () => {
      v.removeEventListener("seeked", handleSeeked);
      recorder.start(100);
      v.play();
      v.addEventListener("timeupdate", handleTimeUpdate);
    };

    v.currentTime = clip.startTime;
    v.addEventListener("seeked", handleSeeked);
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 8 }}>
        Clips ({clips.length})
      </div>

      {clips.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--pg-disabled)", lineHeight: 1.6 }}>
          Aún no hay clips. Usa el botón &quot;+ Clip&quot; para crear uno desde las etiquetas.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {clips.map((clip) => {
            const state = exportStates[clip.id] ?? "idle";
            return (
              <div
                key={clip.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "var(--pg-surface)",
                  border: "1px solid var(--pg-border)",
                }}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {clip.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums", marginTop: 1 }}>
                    {fmt(clip.startTime)} – {fmt(clip.endTime)}
                    <span style={{ marginLeft: 6, color: "var(--pg-disabled)" }}>
                      ({fmt(clip.endTime - clip.startTime)})
                    </span>
                  </div>
                </div>

                {/* Play */}
                <button
                  onClick={() => playClip(clip)}
                  title="Reproducir clip"
                  style={{
                    background: "var(--pg-accent-bg)",
                    border: "1px solid rgba(212,168,83,0.2)",
                    borderRadius: 6,
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--pg-accent)",
                    flexShrink: 0,
                  }}
                >
                  <Play size={12} />
                </button>

                {/* Export */}
                <button
                  onClick={() => exportClip(clip)}
                  disabled={state === "recording"}
                  title={state === "recording" ? "Grabando…" : state === "done" ? "Descargado" : "Exportar clip"}
                  style={{
                    background: state === "done" ? "rgba(74,222,128,0.15)" : "var(--pg-bg)",
                    border: `1px solid ${state === "done" ? "rgba(74,222,128,0.3)" : "var(--pg-border)"}`,
                    borderRadius: 6,
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: state === "recording" ? "not-allowed" : "pointer",
                    color: state === "done" ? "var(--pg-green)" : "var(--pg-muted)",
                    flexShrink: 0,
                  }}
                >
                  {state === "recording" ? (
                    <Loader size={12} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Download size={12} />
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(clip.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--pg-disabled)",
                    display: "flex",
                    alignItems: "center",
                    padding: 2,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
