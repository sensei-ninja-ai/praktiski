import React from "react";

type PersonaCardProps = {
  name: string;
  score: number;
  dmSans: string;
  isHighlighted?: boolean;
  isSuccess?: boolean;
};

export const PersonaCard: React.FC<PersonaCardProps> = ({
  name,
  score,
  dmSans,
  isHighlighted = false,
  isSuccess = false,
}) => {
  // Color based on score
  const scoreColor = 
    score < 40 ? "#ef5350" : // Red
    score < 70 ? "#ffa726" : // Orange  
    "#66bb6a"; // Green

  const borderColor = isHighlighted ? "#4fc3f7" : isSuccess ? "#66bb6a" : "#2a3040";
  const backgroundColor = isHighlighted ? "#1e3a5f22" : "#141820";

  return (
    <div
      style={{
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        padding: 12,
        boxShadow: isHighlighted ? "0 0 20px rgba(79, 195, 247, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Company name */}
      <div
        style={{
          fontFamily: dmSans,
          fontSize: 14,
          fontWeight: 600,
          color: "#e8eaf0",
          marginBottom: 8,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>

      {/* Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: scoreColor,
            borderRadius: "50%",
            boxShadow: `0 0 8px ${scoreColor}55`,
          }}
        />
        <span
          style={{
            fontFamily: dmSans,
            fontSize: 12,
            color: scoreColor,
            fontWeight: 600,
          }}
        >
          {score}/100
        </span>
      </div>

      {/* Notes (only for highlighted/success) */}
      {(isHighlighted || isSuccess) && (
        <div
          style={{
            marginTop: 8,
            fontFamily: dmSans,
            fontSize: 10,
            color: "#8a93a6",
          }}
        >
          {isSuccess 
            ? "Kartlegging booket ✓" 
            : "Lav KI-modenhet - høy prioritet"
          }
        </div>
      )}
    </div>
  );
};