import React from "react";
import { interpolate, spring, AbsoluteFill } from "remotion";
import { PersonaCard } from "../components/PersonaCard";

type DashboardProps = {
  frame: number;
  fps: number;
  dmSans: string;
  companyName: string;
};

const dummyCompanies = [
  { name: "Nordlys AS", score: 78, status: "Booket" },
  { name: "Fjord Tech", score: 45, status: "Kontaktet" },
  { name: "Arctic Solutions", score: 62, status: "Ny" },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  frame, 
  fps, 
  dmSans, 
  companyName 
}) => {
  const duration = 3 * fps; // 3 seconds

  // Zoom out animation
  const zoomProgress = spring({
    frame,
    fps,
    config: { damping: 25 },
    durationInFrames: 1.5 * fps,
  });

  const scale = interpolate(zoomProgress, [0, 1], [2, 1]);
  const dashboardOpacity = interpolate(zoomProgress, [0, 1], [0, 1]);

  // Kanban drag animation (start after 1.5s)
  const dragProgress = spring({
    frame: frame - 1.5 * fps,
    fps,
    config: { damping: 20 },
    durationInFrames: 1 * fps,
  });

  const dragOffset = interpolate(dragProgress, [0, 1], [0, 200]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0c0f14",
        padding: 20,
        overflow: "hidden",
      }}
    >
      {/* Dashboard container */}
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: dashboardOpacity,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontFamily: dmSans,
            fontSize: 24,
            fontWeight: 700,
            color: "#e8eaf0",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          KI-Kartlegging Dashboard
        </div>

        {/* Kanban columns */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          {/* Ny column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: dmSans,
                fontSize: 14,
                fontWeight: 600,
                color: "#8a93a6",
                marginBottom: 12,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Ny
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* User's company - main focus */}
              <div
                style={{
                  transform: `translateX(${dragProgress > 0.3 ? dragOffset : 0}px)`,
                  opacity: dragProgress > 0.8 ? 0.5 : 1,
                }}
              >
                <PersonaCard 
                  name={companyName}
                  score={34}
                  dmSans={dmSans}
                  isHighlighted={true}
                />
              </div>
              {/* Other company */}
              <PersonaCard 
                name={dummyCompanies[2].name}
                score={dummyCompanies[2].score}
                dmSans={dmSans}
              />
            </div>
          </div>

          {/* Kontaktet column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: dmSans,
                fontSize: 14,
                fontWeight: 600,
                color: "#8a93a6",
                marginBottom: 12,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Kontaktet
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <PersonaCard 
                name={dummyCompanies[1].name}
                score={dummyCompanies[1].score}
                dmSans={dmSans}
              />
              {/* User's company arrives here */}
              {dragProgress > 0.8 && (
                <div
                  style={{
                    opacity: interpolate(dragProgress, [0.8, 1], [0, 1]),
                  }}
                >
                  <PersonaCard 
                    name={companyName}
                    score={34}
                    dmSans={dmSans}
                    isHighlighted={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Booket column */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: dmSans,
                fontSize: 14,
                fontWeight: 600,
                color: "#8a93a6",
                marginBottom: 12,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Booket
            </div>
            <PersonaCard 
              name={dummyCompanies[0].name}
              score={dummyCompanies[0].score}
              dmSans={dmSans}
              isSuccess={true}
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};