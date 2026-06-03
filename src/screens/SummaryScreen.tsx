import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { DriveSession } from "@/hooks/useDriveSession";
import { EVENT_DETAILS, EventType } from "@/constants/THRESHOLDS";
import SafetyBadge from "@/components/SafetyBadge";
import EventCard from "@/components/EventCard";
import StatRow, { StatItem } from "@/components/StatRow";
import SymbolIcon from "@/components/SymbolIcon";
import { Colors, Radii, darkCardStyle } from "@/theme";

// Premium Scaling Pressable Button
interface ScaleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}

function ScaleButton({ onPress, children, style }: ScaleButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const {
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    alignSelf,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    ...visualStyle
  } = style || {};

  const containerStyle = {
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    alignSelf,
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
  };

  const hasLayoutWidth = width !== undefined || alignSelf === "stretch" || flex !== undefined || flexGrow !== undefined;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 12, stiffness: 220 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
      style={containerStyle}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: hasLayoutWidth ? "100%" : undefined,
            height: height ? "100%" : undefined,
          },
          visualStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Animate progress bar filling on load
function AnimatedProgressBar({ percentage, color, delay = 0 }: { percentage: number; color: string; delay?: number }) {
  const widthVal = useSharedValue(0);

  useEffect(() => {
    widthVal.value = withDelay(
      delay,
      withTiming(percentage * 100, { duration: 1000 })
    );
  }, [percentage, delay, widthVal]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthVal.value}%`,
  }));

  return (
    <View style={{ height: 6, backgroundColor: Colors.charcoal, borderRadius: 3, overflow: "hidden" }}>
      <Animated.View
        style={[
          {
            height: "100%",
            backgroundColor: color,
            borderRadius: 3,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<DriveSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiCoaching, setAiCoaching] = useState<string>("");
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const stored = await AsyncStorage.getItem("@DriveSafe:last_session");
        if (stored) {
          const sess = JSON.parse(stored) as DriveSession;
          setSession(sess);
          generateAiCoaching(sess);
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        console.warn("Failed to load summary session", e);
        setIsLoading(false);
      }
    };
    fetchSession();
  }, []);

  const generateAiCoaching = (sess: DriveSession) => {
    setGeneratingFeedback(true);
    setTimeout(() => {
      const counts = sess.eventCounts;

      let feedback = "";
      if (sess.score === 100) {
        feedback =
          "Perfect score! An exemplary display of smooth driving. You maintained consistent speeds, stayed focused, kept the device securely mounted, and anticipated traffic flow flawlessly. Keep up this gold standard of driving safety!";
      } else {
        const concerns: string[] = [];

        if (counts.PHONE_HANDLING && counts.PHONE_HANDLING > 0) {
          concerns.push(
            `handled your phone ${counts.PHONE_HANDLING} time${counts.PHONE_HANDLING > 1 ? "s" : ""}, which causes severe visual and cognitive distractions`
          );
        }
        if (counts.HARSH_BRAKING && counts.HARSH_BRAKING > 0) {
          concerns.push(
            `braked aggressively ${counts.HARSH_BRAKING} time${counts.HARSH_BRAKING > 1 ? "s" : ""}, indicating a potential lack of safe following distance or late hazard awareness`
          );
        }
        if (counts.HARSH_ACCELERATION && counts.HARSH_ACCELERATION > 0) {
          concerns.push(
            `accelerated rapidly ${counts.HARSH_ACCELERATION} time${counts.HARSH_ACCELERATION > 1 ? "s" : ""}, which decreases fuel economy and increases risk of loss of control`
          );
        }
        if ((counts.SHARP_TURN && counts.SHARP_TURN > 0) || (counts.AGGRESSIVE_STEERING && counts.AGGRESSIVE_STEERING > 0)) {
          const steeringCount = (counts.SHARP_TURN || 0) + (counts.AGGRESSIVE_STEERING || 0);
          concerns.push(
            `took corner maneuvers or swerved aggressively ${steeringCount} time${steeringCount > 1 ? "s" : ""}, indicating high lateral forces that can compromise vehicle stability`
          );
        }
        if (counts.EXCESSIVE_MOVEMENT && counts.EXCESSIVE_MOVEMENT > 0) {
          concerns.push(
            `experienced sudden phone shifts/slips ${counts.EXCESSIVE_MOVEMENT} time${
              counts.EXCESSIVE_MOVEMENT > 1 ? "s" : ""
            }, suggesting your phone is sliding in the cabin or needs a sturdier mount`
          );
        }

        feedback = `Your drive score of ${sess.score} is rated ${sess.rating}. Here are personalized coaching adjustments:\n\n`;
        concerns.forEach((item, idx) => {
          feedback += `\u2022 Adjustment ${idx + 1}: You ${item}.\n\n`;
        });
        feedback += `Recommendation: Secure your device in a dedicated dash-mount before launching your next drive and try looking further down the road to anticipate traffic slow-downs sooner. Safe driving starts with focus!`;
      }

      setAiCoaching(feedback);
      setGeneratingFeedback(false);
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darker, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ActivityIndicator size="large" color={Colors.info} />
        <Text selectable style={{ color: Colors.gray, fontSize: 14, fontWeight: "600" }}>
          Compiling driving data…
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: Colors.darker }}
        contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20, paddingTop: insets.top + 20, gap: 16 }}
      >
        <Text selectable style={{ fontSize: 16, color: Colors.gray, fontWeight: "600" }}>
          No drive session history found.
        </Text>
        <ScaleButton
          onPress={() => router.replace("/")}
          style={{ backgroundColor: Colors.info, paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radii.md }}
        >
          <Text style={{ color: Colors.white, fontWeight: "700" }}>Return to Home</Text>
        </ScaleButton>
      </ScrollView>
    );
  }

  const formatDuration = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const statItems: StatItem[] = [
    { label: "Duration", value: formatDuration(session.duration), icon: "clock", color: Colors.info },
    { label: "Total Anomalies", value: `${session.events.length} logged`, icon: "exclamationmark.triangle", color: Colors.warning },
  ];

  const maxVal = Math.max(...Object.values(session.eventCounts), 1);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: Colors.darker }}
      contentContainerStyle={{ padding: 18, paddingTop: insets.top + 18, gap: 14, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify().duration(500)}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}
      >
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            width: 70,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <SymbolIcon name="house" size={20} color={Colors.info} />
          <Text style={{ color: Colors.info, fontSize: 14, fontWeight: "700" }}>Home</Text>
        </Pressable>
        <Text selectable style={{ fontSize: 18, fontWeight: "800", color: Colors.white }}>
          Drive Scorecard
        </Text>
        <View style={{ width: 70 }} />
      </Animated.View>

      {/* Score Banner */}
      <Animated.View entering={FadeInDown.springify().delay(100).duration(500)}>
        <View style={darkCardStyle({ padding: 20, alignItems: "center" })}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
            <Text
              selectable
              style={{
                fontSize: 68,
                fontWeight: "900",
                fontVariant: ["tabular-nums"],
                color:
                  session.score >= 90
                    ? Colors.success
                    : session.score >= 75
                      ? Colors.info
                      : session.score >= 60
                        ? Colors.warning
                        : Colors.danger,
              }}
            >
              {session.score}
            </Text>
            <View style={{ gap: 6 }}>
              <Text selectable style={{ fontSize: 10, color: Colors.gray, fontWeight: "800", letterSpacing: 2.5 }}>
                DRIVE SCORE
              </Text>
              <SafetyBadge score={session.score} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Stats Row Component */}
      <StatRow stats={statItems} />

      {/* Breakdown */}
      <Animated.View entering={FadeInDown.springify().delay(200).duration(600)}>
        <View style={darkCardStyle({ padding: 16, gap: 14 })}>
          <Text
            selectable
            style={{
              fontSize: 13,
              fontWeight: "800",
              color: Colors.lightGray,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Event Breakdown
          </Text>
          {(Object.keys(EVENT_DETAILS) as EventType[]).map((type, idx) => {
            const count = session.eventCounts[type] || 0;
            const details = EVENT_DETAILS[type];
            const percentage = count / maxVal;

            return (
              <View key={type} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text selectable style={{ color: Colors.lightGray, fontSize: 13, fontWeight: "600" }}>
                    {details.title}
                  </Text>
                  <Text
                    selectable
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      fontVariant: ["tabular-nums"],
                      color: count > 0 ? details.color : Colors.darkGray,
                    }}
                  >
                    {count}
                  </Text>
                </View>
                <AnimatedProgressBar percentage={percentage} color={details.color} delay={300 + idx * 100} />
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* AI Coach */}
      <Animated.View entering={FadeInDown.springify().delay(300).duration(600)}>
        <View style={darkCardStyle({ padding: 16, gap: 10, borderColor: `${Colors.info}40` })}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <SymbolIcon name="sparkles" size={18} color={Colors.info} />
            <Text selectable style={{ color: Colors.info, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }}>
              AI DRIVING COACH
            </Text>
          </View>
          {generatingFeedback ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 }}>
              <ActivityIndicator size="small" color={Colors.info} />
              <Text selectable style={{ color: Colors.gray, fontSize: 12, fontWeight: "600" }}>
                AI analyzing driving forces…
              </Text>
            </View>
          ) : (
            <Text selectable style={{ color: Colors.lightGray, fontSize: 13, lineHeight: 20 }}>
              {aiCoaching}
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Timeline */}
      <View style={{ gap: 12 }}>
        <Text
          selectable
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: Colors.lightGray,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          Event Timeline
        </Text>
        {session.events.length === 0 ? (
          <Animated.View entering={FadeInUp.springify().delay(400)}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                ...darkCardStyle({ padding: 16, gap: 10 }),
              }}
            >
              <SymbolIcon name="shield.checkered" size={24} color={Colors.success} />
              <Text selectable style={{ color: Colors.gray, fontSize: 13, fontWeight: "600" }}>
                Excellent Drive! No safety anomalies logged.
              </Text>
            </View>
          </Animated.View>
        ) : (
          session.events.map((evt, idx) => (
            <View key={`timeline-${idx}`} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <View style={{ width: 76, alignItems: "flex-end", paddingTop: 8 }}>
                <Text
                  selectable
                  style={{
                    fontSize: 11,
                    color: Colors.gray,
                    fontWeight: "800",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {new Date(evt.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: EVENT_DETAILS[evt.type].color,
                    marginTop: 9,
                  }}
                />
                {idx < session.events.length - 1 && (
                  <View style={{ width: 2, flex: 1, minHeight: 40, backgroundColor: Colors.charcoal }} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <EventCard type={evt.type} timestamp={evt.timestamp} showTime={false} />
              </View>
            </View>
          ))
        )}
      </View>

      {/* Back Button */}
      <Animated.View entering={FadeInUp.springify().delay(500).duration(500)}>
        <ScaleButton
          onPress={() => router.replace("/")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.info,
            paddingVertical: 15,
            borderRadius: Radii.md,
            boxShadow: `0 8px 24px ${Colors.info}40`,
            marginVertical: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: Colors.white, letterSpacing: 0.2 }}>
            Back to Dashboard
          </Text>
          <SymbolIcon name="arrow.right" size={18} color={Colors.white} style={{ marginLeft: 6 }} />
        </ScaleButton>
      </Animated.View>
    </ScrollView>
  );
}
