import { Stack } from "expo-router";
import ActiveDriveScreen from "@/screens/ActiveDriveScreen";

export default function ActivePage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ActiveDriveScreen />
    </>
  );
}
