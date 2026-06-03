import { Stack } from "expo-router/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DriveSessionProvider } from "@/hooks/useDriveSession";
import { Colors } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DriveSessionProvider>
        <Stack
          screenOptions={{
            headerTransparent: true,
            headerShadowVisible: false,
            headerLargeTitleShadowVisible: false,
            headerLargeStyle: { backgroundColor: "transparent" },
            headerTitleStyle: { color: Colors.white, fontWeight: "800" },
            headerBlurEffect: "none",
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: Colors.darker },
          }}
        />
      </DriveSessionProvider>
    </SafeAreaProvider>
  );
}


