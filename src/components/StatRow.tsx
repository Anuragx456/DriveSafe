import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import SymbolIcon from "@/components/SymbolIcon";
import { Colors, Radii } from "@/theme";

export interface StatItem {
  label: string;
  value: string;
  icon: string;
  color?: string;
}

interface StatRowProps {
  stats: StatItem[];
}

export default function StatRow({ stats }: StatRowProps) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 4 }}>
      {stats.map((stat, idx) => (
        <Animated.View
          key={idx}
          entering={FadeInUp.springify().delay(idx * 80).damping(15).stiffness(120)}
          style={{ flex: 1, minWidth: "46%" }}
        >
          <View
            style={{
              backgroundColor: Colors.darkSurface,
              borderRadius: Radii.lg,
              borderWidth: 1,
              borderColor: Colors.charcoal,
              borderCurve: "continuous",
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${stat.color || Colors.info}15`,
              }}
            >
              <SymbolIcon
                name={stat.icon}
                size={20}
                color={stat.color || Colors.info}
              />
            </View>
            <View style={{ flex: 1, justifyContent: "center", gap: 2 }}>
              <Text
                selectable
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: Colors.white,
                  letterSpacing: -0.2,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {stat.value}
              </Text>
              <Text
                selectable
                style={{
                  fontSize: 11,
                  color: Colors.gray,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                }}
              >
                {stat.label}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
