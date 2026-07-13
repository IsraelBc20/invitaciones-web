"use client";

// Miniatura de un archivo por subir, con progreso individual y botón de quitar.
// Es visualmente neutra: cada diseño le pasa su color de acento.

import { UploadItem } from "./useMediaUpload";

export default function UploadPreview({
  item,
  uploading,
  onRemove,
  accent,
}: {
  item: UploadItem;
  uploading: boolean;
  onRemove: (id: string) => void;
  accent: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        aspectRatio: "1 / 1",
        background: "rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ position: "absolute", fontSize: 24, opacity: 0.4 }}>
        {item.kind === "video" ? "🎬" : "📷"}
      </span>
      {item.kind === "video" ? (
        <video
          src={item.previewUrl}
          muted
          playsInline
          preload="metadata"
          style={{ position: "relative", width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : item.kind === "photo" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.previewUrl}
          alt={item.file.name}
          style={{ position: "relative", width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <span style={{ position: "relative", fontSize: 24 }}>⚠️</span>
      )}

      {item.kind === "video" && item.status !== "uploading" && (
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          ▶
        </div>
      )}

      {item.status === "done" && (
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: accent,
            color: "#fff",
            fontSize: 12,
            lineHeight: "20px",
            textAlign: "center",
          }}
        >
          ✓
        </div>
      )}

      {!uploading && item.status !== "done" && (
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Quitar ${item.file.name}`}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: 0,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 13,
            lineHeight: 1,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ×
        </button>
      )}

      {(item.status === "uploading" || item.status === "done") && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
            background: "rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              width: `${item.progress}%`,
              height: "100%",
              background: accent,
              transition: "width 0.2s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}
