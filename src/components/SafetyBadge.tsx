import React from "react";
import { View, Text } from "react-native";
import { getRatingForScore } from "@/scoring/scoreEngine";

interface SafetyBadgeProps {
  score: number;
}

export default function SafetyBadge({ score }: SafetyBadgeProps) {
  const { rating, color } = getRatingForScore(score);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: `${color}1A`,
        alignSelf: "flex-start",
        gap: 6,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text selectable style={{ fontSize: 14, fontWeight: "700", color: color }}>{rating}</Text>
    </View>
  );
}
