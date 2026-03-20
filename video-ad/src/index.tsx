import React from "react";
import { Composition, registerRoot } from "remotion";
import { QuizAd, QuizAdProps } from "./QuizAd";

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuizAd"
        component={QuizAd}
        durationInFrames={450} // 15 sekunder * 30fps
        fps={30}
        width={1080} // 9:16 format for Reels
        height={1920}
        defaultProps={{
          score: 34,
          companyName: "Din bedrift",
        } satisfies QuizAdProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);