"use client";

import { useEffect, useState } from "react";
import WinCard from "@/components/WinCard";
import type { MockWin } from "@/lib/mockWins";

export interface WinDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  win: MockWin | null;
  onToggleExhibit: (id: number) => void;
  onRemove: (id: number) => void;
}

export function WinDetailModal({
  isOpen,
  onClose,
  win,
  onToggleExhibit,
  onRemove,
}: WinDetailModalProps) {
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Reset state when closing
      setShowConfirmRemove(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !win) return null;

  const handleToggleExhibit = () => {
    onToggleExhibit(win.id);
  };

  const handleConfirmRemove = () => {
    onRemove(win.id);
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes detailReveal {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      
      <div
        className="modal-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: "color-mix(in srgb, var(--color-cream) 85%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          animation: "detailReveal 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both",
        }}
        onClick={(e) => {
          // Only close if clicking outside the modal content container
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "2rem",
            right: "2rem",
            background: "transparent",
            border: "none",
            color: "var(--color-ink)",
            opacity: 0.5,
            cursor: "pointer",
            padding: "0.5rem",
            zIndex: 10,
            fontFamily: "var(--font-body)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
          }}
        >
          Close
        </button>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2.5rem",
            width: "100%",
            maxWidth: "340px",
            alignItems: "center",
          }}
        >
          {/* Card */}
          <div style={{ width: "100%" }}>
            <WinCard
              variant="personal"
              backgroundId={win.backgroundId}
              category={win.category}
              date={win.date}
              headline={win.headline}
              body={win.body}
              
            />
          </div>

          {/* Actions Container */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {!showConfirmRemove ? (
              <>
                <button
                  onClick={handleToggleExhibit}
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  {win.isExhibited ? "Withdraw from Exhibition" : "Exhibit Publicly 🌍"}
                </button>
                <button
                  onClick={() => setShowConfirmRemove(true)}
                  className="btn-ghost"
                  style={{
                    width: "100%",
                    color: "color-mix(in srgb, var(--color-ink) 70%, transparent)",
                  }}
                >
                  Remove from Collection
                </button>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  padding: "1rem",
                  backgroundColor: "var(--color-parchment)",
                  borderRadius: "12px",
                  border: "1px solid color-mix(in srgb, var(--color-ink) 10%, transparent)",
                  textAlign: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      color: "var(--color-ink)",
                      margin: "0 0 0.25rem 0",
                    }}
                  >
                    Remove This Piece?
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "color-mix(in srgb, var(--color-ink) 60%, transparent)",
                      margin: 0,
                    }}
                  >
                    Once removed, it cannot be recovered.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setShowConfirmRemove(false)}
                    className="btn-primary"
                    style={{ flex: 1, padding: "0.5rem" }}
                  >
                    Keep It
                  </button>
                  <button
                    onClick={handleConfirmRemove}
                    className="btn-ghost"
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      color: "#d9534f",
                    }}
                  >
                    Remove It
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
