import React from "react";
import { interpolate, spring, AbsoluteFill } from "remotion";
import { ScoreCircle } from "../components/ScoreCircle";

type ScoreRevealProps = {
  frame: number;
  fps: number;
  score: number;
  jetBrainsMono: string;
  dmSans: string;
};

export const ScoreReveal: React.FC<ScoreRevealProps> = ({
  frame,
  fps,
  score,
  jetBrainsMono,
  dmSans,
}) => {
  // Score animation (0-1.5s)
  const scoreProgress = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
    durationInFrames: 1.5 * fps,
  });

  // Text fade-in (1s-2s)
  const textOpacity = interpolate(
    frame,
    [1 * fps, 2 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Pulse effect when score stops
  const pulseProgress = spring({
    frame: frame - 1.5 * fps,
    fps,
    delay: 10,
    config: { damping: 12 },
  });
  
  const pulseScale = interpolate(
    pulseProgress,
    [0, 1],
    [1, 1.05]
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Score Circle */}
      <div style={{ transform: `scale(${pulseScale})` }}>
        <ScoreCircle 
          score={Math.round(score * scoreProgress)} 
          jetBrainsMono={jetBrainsMono}
        />
      </div>

      {/* Question text */}
      <div
        style={{
          opacity: textOpacity,
          fontFamily: dmSans,
          fontSize: 32,
          fontWeight: 600,
          color: "#e8eaf0",
          textAlign: "center",
          paddingInline: 40,
        }}
      >
        Er dette din bedrift?
      </div>
    </AbsoluteFill>
  );
};