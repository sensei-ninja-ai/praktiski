import React from "react";
import { interpolate, spring, AbsoluteFill } from "remotion";
import { CategoryBar } from "../components/CategoryBar";

type ResultBarsProps = {
  frame: number;
  fps: number;
  dmSans: string;
};

const categories = [
  { label: "KI-bruk i dag", value: 12, color: "#ef5350" },
  { label: "Digitale verktøy", value: 67, color: "#66bb6a" },
  { label: "Prosesser", value: 8, color: "#ef5350" },
  { label: "Teamkompetanse", value: 45, color: "#ffa726" },
  { label: "Ledelse", value: 22, color: "#ef5350" },
  { label: "Data & Sikkerhet", value: 31, color: "#ffa726" },
];

export const ResultBars: React.FC<ResultBarsProps> = ({ frame, fps, dmSans }) => {
  const duration = 3 * fps; // 3 seconds total

  // Header animation
  const headerOpacity = interpolate(
    frame,
    [0, 0.5 * fps],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 40,
        paddingTop: 80,
        gap: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: dmSans,
            fontSize: 32,
            fontWeight: 700,
            color: "#e8eaf0",
            margin: 0,
            marginBottom: 8,
          }}
        >
          Dine resultater
        </h2>
        <p
          style={{
            fontFamily: dmSans,
            fontSize: 18,
            color: "#8a93a6",
            margin: 0,
          }}
        >
          KI-modenhetsanalyse per kategori
        </p>
      </div>

      {/* Category bars */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {categories.map((category, index) => {
          const delay = (index * 0.2 * fps) + (0.5 * fps); // Stagger by 0.2s each, start after 0.5s
          
          return (
            <CategoryBar
              key={index}
              label={category.label}
              value={category.value}
              color={category.color}
              frame={frame}
              fps={fps}
              delay={delay}
              dmSans={dmSans}
              shouldPulse={category.value < 25} // Pulse weakest categories
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};