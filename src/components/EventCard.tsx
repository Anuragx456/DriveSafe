import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import SymbolIcon from "@/components/SymbolIcon";
import { EventType, EVENT_DETAILS } from "@/constants/THRESHOLDS";
import { Colors, Radii } from "@/theme";

interface EventCardProps {
  type: EventType;
  timestamp: number;
  showTime?: boolean;
}

export default function EventCard({ type, timestamp, showTime = true }: EventCardProps) {
  const details = EVENT_DETAILS[type];

  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Animated.View entering={FadeInRight.springify().damping(15).stiffness(120)}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: Colors.darkSurface,
          borderRadius: Radii.md,
          padding: 14,
          borderLeftWidth: 4,
          borderLeftColor: details.color,
          borderWidth: 1,
          borderColor: Colors.charcoal,
          borderCurve: "continuous",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${details.color}15`,
          }}
        >
          <SymbolIcon name={details.icon} size={24} color={details.color} />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text selectable style={{ fontSize: 16, fontWeight: "700", color: Colors.white, flex: 1, marginRight: 8 }}>
              {details.title}
            </Text>
            <Text
              selectable
              style={{
                fontSize: 13,
                fontWeight: "800",
                letterSpacing: 0.5,
                color: details.color,
                fontVariant: ["tabular-nums"],
              }}
            >
              -{details.deduction} PTS
            </Text>
          </View>
          <Text selectable style={{ fontSize: 13, color: Colors.gray, lineHeight: 18 }}>
            {details.description}
          </Text>
          {showTime && (
            <Text selectable style={{ fontSize: 11, color: Colors.gray, marginTop: 6, fontWeight: "500" }}>
              {timeString}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
