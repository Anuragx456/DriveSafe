import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Svg, { Rect, Line, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";
import { DriveSession } from "@/hooks/useDriveSession";
import { getRatingForScore } from "@/scoring/scoreEngine";
import { Colors, Radii } from "@/theme";

interface TrendChartProps {
  history: DriveSession[];
}

const CHART_HEIGHT = 140;
const CHART_WIDTH = 280;
const PADDING_LEFT = 35; // Prevent negative labels (like -100) from clipping
const PADDING_BOTTOM = 25;
const PADDING_TOP = 15;
const PADDING_RIGHT = 10;
const GRAPH_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const GRAPH_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const BAR_WIDTH = 20;

export default function TrendChart({ history }: TrendChartProps) {
  if (history.length === 0) {
    return (
      <Animated.View entering={FadeInUp.springify().delay(300)}>
        <View
          style={{
            backgroundColor: Colors.darkSurface,
            borderRadius: Radii.lg,
            borderWidth: 1,
            borderColor: Colors.charcoal,
            borderCurve: "continuous",
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 4,
            borderStyle: "dashed",
          }}
        >
          <Text selectable style={{ color: Colors.gray, fontSize: 14, fontWeight: "600" }}>
            No completed sessions yet.
          </Text>
          <Text selectable style={{ color: Colors.darkGray, fontSize: 12, marginTop: 4 }}>
            Your safety score trend will appear here.
          </Text>
        </View>
      </Animated.View>
    );
  }

  const sortedSessions = [...history].reverse();
  const gap = (GRAPH_WIDTH - BAR_WIDTH * sortedSessions.length) / (sortedSessions.length + 1);

  // Dynamic range calculation to support both positive and negative values
  const scores = sortedSessions.map((s) => s.score);
  const maxScore = Math.max(...scores, 100); // Dynamic max, at least 100
  const minScore = Math.min(...scores, 0);   // Dynamic min, at least 0 (can go negative)
  const range = maxScore - minScore;

  const getY = (value: number) => {
    const ratio = (value - minScore) / (range || 1);
    return CHART_HEIGHT - PADDING_BOTTOM - ratio * GRAPH_HEIGHT;
  };

  const yZero = getY(0);

  // Determine grid levels based on data range
  const gridLevels = [60, 75, 90, 100];
  if (minScore < 60) {
    gridLevels.push(0);
  }
  if (minScore < 0) {
    const minStep = Math.floor(minScore / 50) * 50;
    for (let val = -50; val >= minStep; val -= 50) {
      gridLevels.push(val);
    }
  }
  // Remove duplicates and sort
  const uniqueGridLevels = Array.from(new Set(gridLevels)).sort((a, b) => a - b);

  return (
    <Animated.View entering={FadeInUp.springify().delay(300)}>
      <View
        style={{
          backgroundColor: Colors.darkSurface,
          borderRadius: Radii.lg,
          borderWidth: 1,
          borderColor: Colors.charcoal,
          borderCurve: "continuous",
          padding: 16,
          marginVertical: 4,
        }}
      >
        <Text
          selectable
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: Colors.lightGray,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Driving History Trend
        </Text>

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
            <Defs>
              {sortedSessions.map((session, idx) => {
                const { color } = getRatingForScore(session.score);
                const isNegative = session.score < 0;
                return (
                  <LinearGradient
                    key={`grad-${idx}`}
                    id={`barGrad-${idx}`}
                    x1="0"
                    y1={isNegative ? "0" : "1"}
                    x2="0"
                    y2={isNegative ? "1" : "0"}
                  >
                    <Stop offset="0%" stopColor={`${color}20`} stopOpacity={0.2} />
                    <Stop offset="100%" stopColor={color} stopOpacity={1} />
                  </LinearGradient>
                );
              })}
            </Defs>

            {/* Grid lines */}
            {uniqueGridLevels.map((level) => {
              const y = getY(level);
              return (
                <React.Fragment key={`grid-${level}`}>
                  <Line
                    x1={PADDING_LEFT}
                    y1={y}
                    x2={CHART_WIDTH - PADDING_RIGHT}
                    y2={y}
                    stroke={level === 0 ? "#48484A" : "#2C2C2E"}
                    strokeWidth="1"
                    strokeDasharray={level === 0 ? undefined : "4 4"}
                  />
                  <SvgText
                    x={PADDING_LEFT - 8}
                    y={y + 3}
                    fill={level === 0 ? "#AEAEB2" : "#8E8E93"}
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    {level}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Bars */}
            {sortedSessions.map((session, idx) => {
              const x = PADDING_LEFT + gap + idx * (BAR_WIDTH + gap);
              const yVal = getY(session.score);
              const y = Math.min(yZero, yVal);
              const bHeight = Math.abs(yVal - yZero);
              const { color } = getRatingForScore(session.score);
              const isNegative = session.score < 0;

              const dateLabel = new Date(session.startTime).toLocaleDateString([], {
                month: "numeric",
                day: "numeric",
              });

              return (
                <React.Fragment key={`bar-group-${session.id}`}>
                  <Rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={Math.max(bHeight, 2)} // Minimum 2px height so small/zero values remain visible
                    rx={4}
                    fill={`url(#barGrad-${idx})`}
                  />
                  <SvgText
                    x={x + BAR_WIDTH / 2}
                    y={isNegative ? yVal + 10 : yVal - 4}
                    fill={color}
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {session.score}
                  </SvgText>
                  <SvgText
                    x={x + BAR_WIDTH / 2}
                    y={CHART_HEIGHT - 4}
                    fill="#AEAEB2"
                    fontSize="8"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {dateLabel}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Bottom axis line */}
            <Line
              x1={PADDING_LEFT}
              y1={CHART_HEIGHT - PADDING_BOTTOM}
              x2={CHART_WIDTH - PADDING_RIGHT}
              y2={CHART_HEIGHT - PADDING_BOTTOM}
              stroke="#3A3A3C"
              strokeWidth="1"
            />
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
}
