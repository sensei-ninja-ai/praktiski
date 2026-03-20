import React from "react";

type ScoreCircleProps = {
  score: number;
  jetBrainsMono: string;
  size?: number;
};

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ 
  score, 
  jetBrainsMono,
  size = 200
}) => {
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Color based on score
  const scoreColor = 
    score < 40 ? "#ef5350" : // Red
    score < 70 ? "#ffa726" : // Orange  
    "#66bb6a"; // Green

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2a3040"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.3s ease",
            filter: "drop-shadow(0 0 8px " + scoreColor + "55)",
          }}
        />
      </svg>

      {/* Score text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 48,
            fontWeight: 700,
            color: scoreColor,
            lineHeight: 1,
            textShadow: `0 0 12px ${scoreColor}55`,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: jetBrainsMono,
            fontSize: 20,
            color: "#8a93a6",
            marginTop: -4,
          }}
        >
          /100
        </span>
      </div>
    </div>
  );
};