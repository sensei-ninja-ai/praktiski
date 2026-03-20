import React from "react";
import { interpolate, spring, AbsoluteFill } from "remotion";

type CTAProps = {
  frame: number;
  fps: number;
  dmSans: string;
  dmSerifDisplay: string;
};

export const CTA: React.FC<CTAProps> = ({ 
  frame, 
  fps, 
  dmSans,
  dmSerifDisplay,
}) => {
  const duration = 4 * fps; // 4 seconds

  // Blur background animation
  const blurProgress = interpolate(
    frame,
    [0, 1 * fps],
    [0, 10],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Main text animation (staggered)
  const mainTextOpacity = interpolate(
    frame,
    [0.5 * fps, 1.5 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const mainTextScale = spring({
    frame: frame - 0.5 * fps,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Pause before logo
  const logoOpacity = interpolate(
    frame,
    [2 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // URL animation
  const urlOpacity = interpolate(
    frame,
    [2.8 * fps, 3.3 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Pulsing underline
  const pulseOpacity = interpolate(
    Math.sin((frame - 3 * fps) * 0.3),
    [-1, 1],
    [0.5, 1]
  );

  // Glow effect
  const glowIntensity = interpolate(
    Math.sin((frame - 3 * fps) * 0.2),
    [-1, 1],
    [0.3, 0.8]
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        backgroundColor: "#0c0f14",
        position: "relative",
      }}
    >
      {/* Blurred background elements */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `blur(${blurProgress}px)`,
          opacity: 0.3,
          background: `
            radial-gradient(circle at 20% 80%, #ef5350 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, #4fc3f7 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, #66bb6a 0%, transparent 50%)
          `,
        }}
      />

      {/* Main CTA text */}
      <div
        style={{
          opacity: mainTextOpacity,
          transform: `scale(${mainTextScale})`,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: dmSans,
            fontSize: 48,
            fontWeight: 800,
            color: "#e8eaf0",
            margin: 0,
            textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
            lineHeight: 1.2,
          }}
        >
          3 minutter.
        </h1>
        <h1
          style={{
            fontFamily: dmSans,
            fontSize: 48,
            fontWeight: 800,
            color: "#4fc3f7",
            margin: 0,
            textShadow: "0 0 20px rgba(79, 195, 247, 0.5)",
            lineHeight: 1.2,
          }}
        >
          Helt gratis.
        </h1>
      </div>

      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontFamily: dmSerifDisplay,
            fontSize: 36,
            fontWeight: 400,
            color: "#e8eaf0",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Praktisk Intelligens
        </h2>
      </div>

      {/* URL with pulsing effect */}
      <div
        style={{
          opacity: urlOpacity,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: dmSans,
            fontSize: 28,
            fontWeight: 700,
            color: "#4fc3f7",
            textDecoration: "underline",
            textDecorationColor: `rgba(79, 195, 247, ${pulseOpacity})`,
            textDecorationThickness: "3px",
            textUnderlineOffset: "6px",
            textShadow: `0 0 20px rgba(79, 195, 247, ${glowIntensity})`,
          }}
        >
          praktiski.no/quiz
        </div>
      </div>

      {/* Subtle particles/dots for extra flair */}
      {frame > 2 * fps && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 10% 10%, #4fc3f722 1px, transparent 1px),
              radial-gradient(circle at 90% 90%, #66bb6a22 1px, transparent 1px),
              radial-gradient(circle at 70% 30%, #ffa72622 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px, 120px 120px, 80px 80px",
            opacity: interpolate(frame, [2 * fps, 3 * fps], [0, 0.6]),
          }}
        />
      )}
    </AbsoluteFill>
  );
};