import React from "react";
import { interpolate, AbsoluteFill } from "remotion";
import { QuizCard } from "../components/QuizCard";

type QuizSpeedRunProps = {
  frame: number;
  fps: number;
  dmSans: string;
};

const quizQuestions = [
  {
    question: "Bruker dere KI-verktøy daglig i bedriften?",
    options: ["Aldri", "Sjelden", "Noen ganger", "Daglig"],
    selectedIndex: 1,
  },
  {
    question: "Hvor mye av arbeidet kan automatiseres?", 
    options: ["Under 10%", "10-30%", "30-50%", "Over 50%"],
    selectedIndex: 0,
  },
  {
    question: "Har dere digitale prosesser for kundeservice?",
    options: ["Ingen", "Grunnleggende", "Avansert", "Fullstendig"],
    selectedIndex: 1,
  },
  {
    question: "Hvor oppdatert er teamet på KI-teknologi?",
    options: ["Ikke i det hele tatt", "Litt", "Ganske oppdatert", "Eksperter"],
    selectedIndex: 2,
  },
];

export const QuizSpeedRun: React.FC<QuizSpeedRunProps> = ({
  frame,
  fps,
  dmSans,
}) => {
  const duration = 3 * fps; // 3 seconds total
  const questionDuration = duration / quizQuestions.length;

  // Current question index
  const currentQuestionIndex = Math.floor(frame / questionDuration);
  const questionProgress = (frame % questionDuration) / questionDuration;

  // Progress bar (1/12 → 12/12)
  const totalProgress = interpolate(
    frame,
    [0, duration],
    [1, 12],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Slide animation
  const slideOffset = interpolate(
    questionProgress,
    [0.7, 1], // Start sliding out at 70% through each question
    [0, -100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const nextSlideOffset = interpolate(
    questionProgress,
    [0.7, 1], 
    [100, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 40,
        gap: 30,
        backgroundColor: "#0c0f14",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          height: 6,
          backgroundColor: "#2a3040",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#4fc3f7",
            width: `${(totalProgress / 12) * 100}%`,
            transition: "width 0.1s ease",
            borderRadius: 3,
          }}
        />
      </div>

      {/* Progress text */}
      <div
        style={{
          fontFamily: dmSans,
          fontSize: 16,
          color: "#8a93a6",
          textAlign: "center",
        }}
      >
        {Math.round(totalProgress)}/12
      </div>

      {/* Quiz cards container */}
      <div style={{ position: "relative", flex: 1 }}>
        {/* Current question */}
        {currentQuestionIndex < quizQuestions.length && (
          <div style={{ transform: `translateX(${slideOffset}%)` }}>
            <QuizCard
              question={quizQuestions[currentQuestionIndex]}
              dmSans={dmSans}
              progress={questionProgress}
            />
          </div>
        )}

        {/* Next question */}
        {currentQuestionIndex + 1 < quizQuestions.length && questionProgress > 0.7 && (
          <div 
            style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              transform: `translateX(${nextSlideOffset}%)`,
            }}
          >
            <QuizCard
              question={quizQuestions[currentQuestionIndex + 1]}
              dmSans={dmSans}
              progress={0}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};