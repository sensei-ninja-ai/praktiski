import React from "react";
import { interpolate, spring } from "remotion";

type CategoryBarProps = {
  label: string;
  value: number;
  color: string;
  frame: number;
  fps: number;
  delay: number;
  dmSans: string;
  shouldPulse?: boolean;
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  label,
  value,
  color,
  frame,
  fps,
  delay,
  dmSans,
  shouldPulse = false,
}) => {
  // Bar fill animation
  const fillProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 1 * fps,
  });

  // Opacity animation
  const opacity = interpolate(
    frame,
    [delay - 10, delay],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Pulse animation for low scores
  const pulseScale = shouldPulse ? 
    interpolate(
      Math.sin((frame - delay) * 0.2),
      [-1, 1],
      [1, 1.02]
    ) : 1;

  const actualWidth = Math.max(5, value * fillProgress); // Minimum 5% width for visibility

  return (
    <div
      style={{
        opacity,
        transform: `scale(${pulseScale})`,
        transition: "transform 0.1s ease",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: dmSans,
          fontSize: 16,
          fontWeight: 600,
          color: "#e8eaf0",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{label}</span>
        <span style={{ color }}>
          {Math.round(value * fillProgress)}%
        </span>
      </div>

      {/* Progress bar container */}
      <div
        style={{
          height: 24,
          backgroundColor: "#2a3040",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Progress bar fill */}
        <div
          style={{
            height: "100%",
            backgroundColor: color,
            width: `${actualWidth}%`,
            borderRadius: 12,
            boxShadow: `0 0 12px ${color}33`,
            transition: "width 0.1s ease",
          }}
        />

        {/* Glow effect for filled bars */}
        {fillProgress > 0.5 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${actualWidth}%`,
              background: `linear-gradient(90deg, transparent 0%, ${color}22 50%, transparent 100%)`,
              borderRadius: 12,
            }}
          />
        )}
      </div>
    </div>
  );
};