import React from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";

interface SymbolIconProps {
  name: string; // SF Symbol name, e.g. "house" or "sf:house"
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// Custom SVG Paths for Android/Web fallback (Material-like styles)
const SVG_ICONS: Record<string, (color: string, size: number) => React.ReactNode> = {
  house: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />
    </Svg>
  ),
  sparkles: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21.5l1.9-4.1 4.1-1.9-4.1-1.9L9 9.5 7.1 13.6l-4.1 1.9 4.1 1.9L9 21.5zm8-11l1.1-2.4 2.4-1.1-2.4-1.1L17 3.5l-1.1 2.4-2.4 1.1 2.4 1.1L17 10.5z" fill={color} />
    </Svg>
  ),
  "shield.checkered": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 9H6V6.5l6-2.25V11zm0 0v8.92c-3.15-1.02-5.46-4.52-5.91-7.92H12zm6-1h-6V4.25l6 2.25V10zm0 0h-6v7.92c.45-3.4 2.76-6.9 5.91-7.92V10z" fill={color} />
    </Svg>
  ),
  "arrow.right": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill={color} />
    </Svg>
  ),
  "play.fill": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5v14l11-7z" fill={color} />
    </Svg>
  ),
  clock: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill={color} />
    </Svg>
  ),
  "exclamationmark.triangle": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill={color} />
    </Svg>
  ),
  "chevron.right": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill={color} />
    </Svg>
  ),
  compass: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm2.25-10.25L10 12l-2.25 4.25L14 14l2.25-4.25z" fill={color} />
    </Svg>
  ),
  "car.fill": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.96-.68h9.54c.44 0 .82.28.96.68L19 11H5z" fill={color} />
    </Svg>
  ),
  "square.fill": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3h18v18H3z" fill={color} />
    </Svg>
  ),
  "eye.fill": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill={color} />
    </Svg>
  ),
  "checkmark.circle.fill": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill={color} />
    </Svg>
  ),
  "exclamationmark.circle.fill": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={color} />
    </Svg>
  ),
  "arrow.down.to.circle": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 10h3l-4 4-4-4h3V8h2v4z" fill={color} />
    </Svg>
  ),
  "arrow.up.to.circle": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 10V16h-2v-4H8l4-4 4 4h-3z" fill={color} />
    </Svg>
  ),
  "arrow.left.and.right": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" fill={color} />
    </Svg>
  ),
  "point.3.filled.connected.trianglepath.dotted": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 16c-.93 0-1.74.46-2.24 1.17l-3.66-2.09c.58-.8 1.07-1.85 1.34-3.08h4.56c.5 1.17 1.66 2 3 2 1.93 0 3.5-1.57 3.5-3.5S21.93 7 20 7c-1.34 0-2.5.83-3 2h-4.56C12.18 7.77 11.69 6.72 11.11 5.92l3.66-2.09c.5.71 1.31 1.17 2.24 1.17 1.93 0 3.5-1.57 3.5-3.5S18.93 1 17 1c-1.34 0-2.5.83-3 2h-.1C12 3 10.3 4.2 9.07 5.92L5.41 3.83c.5-.71 1.31-1.17 2.24-1.17C9.58 2.66 11 1.25 11-.5S9.58-3.66 7.65-3.66c-1.34 0-2.5.83-3 2h-2c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2c.5 1.17 1.66 2 3 2z" fill={color} />
    </Svg>
  ),
  iphone: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" fill={color} />
    </Svg>
  ),
  "hand.tap": (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 11.24V7.5a2.5 2.5 0 015 0v3.74c1.21-.81 2-2.18 2-3.74C16 4.47 13.53 2 10.5 2S5 4.47 5 7.5c0 1.56.79 2.93 2 3.74v5.33c-1.21-.81-2-2.18-2-3.74h-2C3 16.53 5.47 19 8.5 19c.53 0 1.04-.08 1.5-.23v.73c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2.27c1.78-.96 3-2.85 3-5.03v-4.2c1.21.81 2 2.18 2 3.74h2c0-3.03-2.47-5.5-5.5-5.5-.53 0-1.04.08-1.5.23v-.73c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v1.07z" fill={color} />
    </Svg>
  ),
  house_fill: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color} />
    </Svg>
  ),
  shield_fill: (color, size) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill={color} />
    </Svg>
  ),
};

export default function SymbolIcon({ name, size = 24, color = "#FFF", style }: SymbolIconProps) {
  const cleanName = name.startsWith("sf:") ? name.slice(3) : name;

  if (process.env.EXPO_OS === "ios") {
    // Guidelines command: Use expo-image with source="sf:name" for SF Symbols
    return (
      <Image
        source={`sf:${cleanName}`}
        style={[{ width: size, height: size }, style as any]}
        tintColor={color}
      />
    );
  }

  // Android/Web fallbacks
  const renderFallback = SVG_ICONS[cleanName] || SVG_ICONS["house"];
  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      {renderFallback(color, size)}
    </View>
  );
}
