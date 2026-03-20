import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";
import { loadFont as loadSerifFont } from "@remotion/google-fonts/DMSerifDisplay";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/JetBrainsMono";

// Scene imports
import { ScoreReveal } from "./scenes/ScoreReveal";
import { QuizSpeedRun } from "./scenes/QuizSpeedRun";
import { ResultBars } from "./scenes/ResultBars";
import { Dashboard } from "./scenes/Dashboard";
import { CTA } from "./scenes/CTA";

// Load Google Fonts
const { fontFamily: dmSans } = loadFont();
const { fontFamily: dmSerifDisplay } = loadSerifFont();
const { fontFamily: jetBrainsMono } = loadMonoFont();

export type QuizAdProps = {
  score: number;
  companyName: string;
};

export const QuizAd: React.FC<QuizAdProps> = ({ score, companyName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timing (15 seconds = 450 frames @ 30fps)
  const scene1End = 2 * fps; // 0-2s (frame 0-60)
  const scene2End = 5 * fps; // 2-5s (frame 60-150) 
  const scene3End = 8 * fps; // 5-8s (frame 150-240)
  const scene4End = 11 * fps; // 8-11s (frame 240-330)
  const scene5End = 15 * fps; // 11-15s (frame 330-450)

  // Determine current scene
  const currentScene = 
    frame < scene1End ? 1 :
    frame < scene2End ? 2 :
    frame < scene3End ? 3 :
    frame < scene4End ? 4 : 5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0c0f14",
        fontFamily: dmSans,
        overflow: "hidden",
      }}
    >
      {/* Scene 1: Score Reveal (0-2s) */}
      {currentScene === 1 && (
        <ScoreReveal 
          frame={frame} 
          fps={fps}
          score={score}
          jetBrainsMono={jetBrainsMono}
          dmSans={dmSans}
        />
      )}

      {/* Scene 2: Quiz Speed-Run (2-5s) */}
      {currentScene === 2 && (
        <QuizSpeedRun 
          frame={frame - scene1End} 
          fps={fps}
          dmSans={dmSans}
        />
      )}

      {/* Scene 3: Result Bars (5-8s) */}
      {currentScene === 3 && (
        <ResultBars 
          frame={frame - scene2End} 
          fps={fps}
          dmSans={dmSans}
        />
      )}

      {/* Scene 4: Dashboard (8-11s) */}
      {currentScene === 4 && (
        <Dashboard 
          frame={frame - scene3End} 
          fps={fps}
          dmSans={dmSans}
          companyName={companyName}
        />
      )}

      {/* Scene 5: CTA (11-15s) */}
      {currentScene === 5 && (
        <CTA 
          frame={frame - scene4End} 
          fps={fps}
          dmSans={dmSans}
          dmSerifDisplay={dmSerifDisplay}
        />
      )}
    </AbsoluteFill>
  );
};