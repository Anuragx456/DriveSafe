import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { getRatingForScore } from "@/scoring/scoreEngine";
import { Colors } from "@/theme";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreGauge({ score, size = 200, strokeWidth = 14 }: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = displayScore;
    const end = Math.round(score);

    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 800;
    const difference = end - start;
    const steps = Math.abs(difference);
    const stepDelay = Math.max(Math.floor(duration / steps), 16);

    const timer = setInterval(() => {
      start += difference > 0 ? 1 : -1;
      setDisplayScore(start);
      if (start === end) clearInterval(timer);
    }, stepDelay);

    return () => clearInterval(timer);
  }, [score, displayScore]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.max(0, Math.min(100, displayScore));
  const strokeDashoffset = circumference * (1 - progressPercentage / 100);

  const { rating, color } = getRatingForScore(score);
  const displayRating = rating === "Needs Improvement" ? "NEEDS\nIMPROVEMENT" : rating;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <Stop offset="100%" stopColor={color} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2C2C2E"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGrad)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 10 }}>
        <Text
          selectable
          style={{
            fontSize: 66,
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            letterSpacing: -1.5,
            lineHeight: 72,
            color: color,
          }}
        >
          {displayScore}
        </Text>
        <Text
          selectable
          style={{
            fontSize: 10,
            fontWeight: "800",
            color: Colors.gray,
            letterSpacing: 2.5,
            marginTop: 8,
          }}
        >
          SAFETY SCORE
        </Text>
        <Text
          selectable
          style={{
            fontSize: 14,
            fontWeight: "900",
            marginTop: 8,
            letterSpacing: 0.5,
            textAlign: "center",
            lineHeight: 18,
            textTransform: "uppercase",
            color: color,
            width: size - 48,
          }}
        >
          {displayRating}
        </Text>
      </View>
    </View>
  );
}
