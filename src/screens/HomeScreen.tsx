import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useDriveSession, DriveSession } from "@/hooks/useDriveSession";
import SafetyBadge from "@/components/SafetyBadge";
import TrendChart from "@/components/TrendChart";
import SymbolIcon from "@/components/SymbolIcon";
import { Colors, Radii, darkCardStyle } from "@/theme";

// Premium Interactive Scaling Button Component
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
        scale.value = withSpring(0.95, { damping: 12, stiffness: 220 });
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { startDrive, permissionsGranted, requestPermissions, getSessionHistory } = useDriveSession();

  const [lastSession, setLastSession] = useState<DriveSession | null>(null);
  const [history, setHistory] = useState<DriveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadHistoryData = async () => {
        try {
          const storedLast = await AsyncStorage.getItem("@DriveSafe:last_session");
          const lastSess = storedLast ? (JSON.parse(storedLast) as DriveSession) : null;
          const hist = await getSessionHistory();

          if (isMounted) {
            setLastSession(lastSess);
            setHistory(hist);
            setIsLoading(false);
          }
        } catch (e) {
          console.warn("Failed to load history on Home:", e);
          if (isMounted) setIsLoading(false);
        }
      };

      loadHistoryData();

      return () => {
        isMounted = false;
      };
    }, [getSessionHistory])
  );

  const handleStartDrive = async () => {
    const success = await startDrive(false);
    if (success) {
      router.push("/active");
    } else {
      Alert.alert(
        "Telemetry Sensor Warning",
        "Physical sensor permissions were not fully calibrated or are unavailable on this device (typical of emulators).\n\nWould you like to run in Simulated Drive mode to test real-time driving event feeds and scorecards?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Launch Simulated Drive",
            style: "default",
            onPress: async () => {
              const simSuccess = await startDrive(true);
              if (simSuccess) {
                router.push("/active");
              }
            },
          },
        ]
      );
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: Colors.darker }}
      contentContainerStyle={{ padding: 18, paddingTop: insets.top + 18, paddingBottom: 40, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify().duration(500)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <View>
          <Text
            selectable
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: Colors.white,
              letterSpacing: -0.8,
            }}
          >
            DriveSafe
          </Text>
          <Text selectable style={{ fontSize: 13, color: Colors.gray, fontWeight: "600", marginTop: 2 }}>
            Driving Behavior Analyzer
          </Text>
        </View>
        <View
          style={{
            width: 48,
            height: 48,
            ...darkCardStyle({ alignItems: "center", justifyContent: "center", borderRadius: Radii.xl }),
          }}
        >
          <SymbolIcon name="shield.checkered" size={24} color={Colors.primary} />
        </View>
      </Animated.View>

      {/* Permission Status */}
      <Animated.View entering={FadeInDown.springify().delay(100).duration(500)}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            ...darkCardStyle({
              padding: 14,
              borderColor: permissionsGranted ? "#34C75940" : "#FF3B3040",
              borderWidth: 1,
            }),
          }}
        >
          <SymbolIcon
            name={permissionsGranted ? "checkmark.circle.fill" : "exclamationmark.circle.fill"}
            size={22}
            color={permissionsGranted ? Colors.success : Colors.warning}
          />
          <View style={{ flex: 1, marginHorizontal: 10, gap: 2 }}>
            <Text selectable style={{ color: Colors.white, fontSize: 14, fontWeight: "700" }}>
              {permissionsGranted ? "Sensors Calibrated" : "Sensor Access Recommended"}
            </Text>
            <Text selectable style={{ color: Colors.gray, fontSize: 11, lineHeight: 15 }}>
              {permissionsGranted
                ? "High-frequency telemetry logging is active and running."
                : "Please enable physical sensors for real-time safety tracking."}
            </Text>
          </View>
          {!permissionsGranted && (
            <ScaleButton
              onPress={requestPermissions}
              style={{
                backgroundColor: Colors.info,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: Radii.sm,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 11, fontWeight: "800" }}>ENABLE</Text>
            </ScaleButton>
          )}
        </View>
      </Animated.View>

      {/* CTA Card */}
      <Animated.View entering={FadeInDown.springify().delay(200).duration(500)}>
        <View
          style={darkCardStyle({
            padding: 20,
            alignItems: "center",
            gap: 16,
          })}
        >
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text selectable style={{ fontSize: 22, fontWeight: "800", color: Colors.white, textAlign: "center", letterSpacing: -0.4 }}>
              Ready to Hit the Road?
            </Text>
            <Text selectable style={{ fontSize: 13, color: Colors.lightGray, textAlign: "center", lineHeight: 19, paddingHorizontal: 10 }}>
              DriveSafe analyzes braking, acceleration, cornering, swerving, device displacement, and phone handling in real-time.
            </Text>
          </View>
          <ScaleButton
            onPress={handleStartDrive}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.success,
              width: "100%",
              paddingVertical: 15,
              borderRadius: Radii.md,
              boxShadow: `0 8px 24px ${Colors.success}40`,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.white, letterSpacing: 0.2 }}>
              Start Session
            </Text>
            <SymbolIcon name="play.fill" size={20} color={Colors.white} style={{ marginLeft: 6 }} />
          </ScaleButton>
        </View>
      </Animated.View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.info} style={{ marginVertical: 30 }} />
      ) : (
        <>
          {/* Last Session */}
          {lastSession && (
            <Animated.View entering={FadeInDown.springify().delay(300).duration(500)} style={{ gap: 10 }}>
              <Text
                selectable
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: Colors.gray,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginLeft: 4,
                }}
              >
                Last Driving Session
              </Text>
              
              <Pressable
                onPress={() => router.push("/summary")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.95 : 1,
                })}
              >
                <View style={darkCardStyle({ padding: 16, gap: 14 })}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ gap: 6 }}>
                      <Text selectable style={{ fontSize: 17, fontWeight: "700", color: Colors.white }}>
                        {new Date(lastSession.startTime).toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: Colors.charcoal,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: Radii.sm,
                            gap: 4,
                          }}
                        >
                          <SymbolIcon name="clock" size={12} color={Colors.gray} />
                          <Text selectable style={{ color: Colors.gray, fontSize: 11, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                            {formatDuration(lastSession.duration)}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: Colors.charcoal,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: Radii.sm,
                            gap: 4,
                          }}
                        >
                          <SymbolIcon name="exclamationmark.triangle" size={12} color={Colors.gray} />
                          <Text selectable style={{ color: Colors.gray, fontSize: 11, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                            {lastSession.events.length} {lastSession.events.length === 1 ? "Event" : "Events"}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: "center", justifyContent: "center" }}>
                      <Text
                        selectable
                        style={{
                          fontSize: 36,
                          fontWeight: "900",
                          fontVariant: ["tabular-nums"],
                          color:
                            lastSession.score >= 90
                              ? Colors.success
                              : lastSession.score >= 75
                                ? Colors.info
                                : lastSession.score >= 60
                                  ? Colors.warning
                                  : Colors.danger,
                        }}
                      >
                        {lastSession.score}
                      </Text>
                      <Text
                        selectable
                        style={{
                          fontSize: 8,
                          color: Colors.gray,
                          fontWeight: "800",
                          letterSpacing: 1.5,
                          marginTop: 2,
                        }}
                      >
                        SCORE
                      </Text>
                    </View>
                  </View>
                  <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <SafetyBadge score={lastSession.score} />
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                      <Text style={{ color: Colors.info, fontSize: 13, fontWeight: "700" }}>Session Details</Text>
                      <SymbolIcon
                        name="chevron.right"
                        size={14}
                        color={Colors.info}
                      />
                    </View>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* Trend Chart */}
          <TrendChart history={history} />
        </>
      )}
    </ScrollView>
  );
}
