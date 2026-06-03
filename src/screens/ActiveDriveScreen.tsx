import React, { useEffect } from "react";
import { Text, View, ScrollView, Alert, Pressable, BackHandler } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useDriveSession } from "@/hooks/useDriveSession";
import ScoreGauge from "@/components/ScoreGauge";
import EventCard from "@/components/EventCard";
import SymbolIcon from "@/components/SymbolIcon";
import { Colors, Radii, darkCardStyle } from "@/theme";

// Interactive Touch Scale Button
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

export default function ActiveDriveScreen() {
  const insets = useSafeAreaInsets();
  const session = useDriveSession();

  // Pulse animation for LIVE telemetry red dot
  const dotOpacity = useSharedValue(0.4);
  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.4, { duration: 750 })
      ),
      -1, // infinite loop
      true // reverse on repeat
    );
  }, [dotOpacity]);

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  useEffect(() => {
    const onBackPress = () => {
      Alert.alert(
        "Active Telemetry Session",
        "Are you sure you want to end this driving session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "End Session",
            style: "destructive",
            onPress: async () => {
              await session.endDrive();
              router.replace("/");
            },
          },
        ]
      );
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [session]);

  const formatTimer = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleEndDrive = async () => {
    Alert.alert(
      "End Drive",
      "Would you like to complete this drive session and generate your safety scorecard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End and Review",
          style: "default",
          onPress: async () => {
            const completed = await session.endDrive();
            router.replace(completed ? "/summary" : "/");
          },
        },
      ]
    );
  };

  const lastFiveEvents = [...session.events].reverse().slice(0, 5);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: Colors.darker }}
      contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: insets.top + 20, gap: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Status Header */}
      <Animated.View
        entering={FadeInDown.springify().duration(500)}
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            ...darkCardStyle({ paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radii.sm, gap: 6 }),
          }}
        >
          <Animated.View
            style={[
              {
                width: 7,
                height: 7,
                borderRadius: 3.5,
                backgroundColor: Colors.danger,
              },
              dotAnimatedStyle,
            ]}
          />
          <Text selectable style={{ color: Colors.lightGray, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>
            LIVE TELEMETRY
          </Text>
        </View>
        
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <SymbolIcon name="eye.fill" size={14} color={Colors.info} />
          <Text selectable style={{ fontSize: 10, color: Colors.gray, fontWeight: "700", letterSpacing: 0.5 }}>
            SCREEN LOCK ACTIVE
          </Text>
        </View>
      </Animated.View>

      {/* Gauge */}
      <Animated.View
        entering={FadeInDown.springify().delay(100).duration(600)}
        style={{ alignItems: "center", marginVertical: 10 }}
      >
        <ScoreGauge score={session.score} size={220} strokeWidth={16} />
      </Animated.View>

      {/* Timer */}
      <Animated.View
        entering={FadeInDown.springify().delay(200).duration(600)}
        style={{ alignItems: "center", gap: 6 }}
      >
        <Text selectable style={{ fontSize: 10, color: Colors.gray, fontWeight: "800", letterSpacing: 2.5 }}>
          ELAPSED DRIVE TIME
        </Text>
        <Text
          selectable
          style={{
            fontSize: 44,
            fontWeight: "900",
            color: Colors.white,
            fontVariant: ["tabular-nums"],
            letterSpacing: 0.5,
          }}
        >
          {formatTimer(session.duration)}
        </Text>
        {session.heading !== null && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              ...darkCardStyle({ paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radii.sm, gap: 4 }),
            }}
          >
            <SymbolIcon name="compass" size={12} color={Colors.gray} />
            <Text selectable style={{ fontSize: 10, color: Colors.gray, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
              HEADING: {Math.round(session.heading)}°
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Feed */}
      <Animated.View
        entering={FadeInDown.springify().delay(300).duration(600)}
        style={{ flex: 1 }}
      >
        <View style={darkCardStyle({ flex: 1, padding: 16, gap: 12 })}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text selectable style={{ fontSize: 14, fontWeight: "800", color: Colors.lightGray, letterSpacing: 0.5 }}>
              Real-time Event Feed
            </Text>
            <View
              style={{
                backgroundColor: Colors.charcoal,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: Radii.sm,
              }}
            >
              <Text selectable style={{ color: Colors.gray, fontSize: 9, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
                {session.events.length} TOTAL
              </Text>
            </View>
          </View>

          {lastFiveEvents.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 40 }}>
              <SymbolIcon name="car.fill" size={32} color={Colors.charcoal} />
              <Text selectable style={{ color: Colors.lightGray, fontSize: 14, fontWeight: "700" }}>
                Smooth driving detected…
              </Text>
              <Text selectable style={{ color: Colors.darkGray, fontSize: 11, textAlign: "center" }}>
                Any sudden force shifts will appear here.
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 260 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {lastFiveEvents.map((evt, idx) => (
                <EventCard key={`evt-${idx}-${evt.timestamp}`} type={evt.type} timestamp={evt.timestamp} />
              ))}
            </ScrollView>
          )}
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View entering={FadeInUp.springify().delay(400).duration(500)}>
        <ScaleButton
          onPress={handleEndDrive}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.danger,
            width: "100%",
            paddingVertical: 15,
            borderRadius: Radii.md,
            boxShadow: `0 8px 24px ${Colors.danger}40`,
          }}
        >
          <SymbolIcon name="square.fill" size={16} color={Colors.white} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 16, fontWeight: "800", color: Colors.white, letterSpacing: 0.2 }}>
            End Drive Session
          </Text>
        </ScaleButton>
      </Animated.View>
    </ScrollView>
  );
}
