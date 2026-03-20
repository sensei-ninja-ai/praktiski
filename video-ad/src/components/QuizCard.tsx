import React from "react";
import { interpolate } from "remotion";

type QuizQuestion = {
  question: string;
  options: string[];
  selectedIndex: number;
};

type QuizCardProps = {
  question: QuizQuestion;
  dmSans: string;
  progress: number;
};

export const QuizCard: React.FC<QuizCardProps> = ({ question, dmSans, progress }) => {
  // Highlight animation - show selection at 40% through the question
  const showSelection = progress > 0.4;
  
  return (
    <div
      style={{
        backgroundColor: "#141820",
        border: "1px solid #2a3040",
        borderRadius: 12,
        padding: 32,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Question */}
      <h3
        style={{
          fontFamily: dmSans,
          fontSize: 24,
          fontWeight: 600,
          color: "#e8eaf0",
          marginBottom: 24,
          lineHeight: 1.4,
          margin: 0,
          marginBottom: 24,
        }}
      >
        {question.question}
      </h3>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {question.options.map((option, index) => {
          const isSelected = index === question.selectedIndex;
          const shouldHighlight = showSelection && isSelected;

          return (
            <div
              key={index}
              style={{
                padding: 16,
                backgroundColor: shouldHighlight ? "#1e3a5f" : "#2a3040",
                border: shouldHighlight ? "2px solid #4fc3f7" : "2px solid transparent",
                borderRadius: 8,
                fontFamily: dmSans,
                fontSize: 18,
                color: shouldHighlight ? "#4fc3f7" : "#e8eaf0",
                fontWeight: shouldHighlight ? 600 : 400,
                transition: "all 0.3s ease",
                boxShadow: shouldHighlight ? "0 0 20px rgba(79, 195, 247, 0.3)" : "none",
              }}
            >
              {option}
            </div>
          );
        })}
      </div>
    </div>
  );
};