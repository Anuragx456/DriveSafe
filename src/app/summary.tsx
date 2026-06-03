import { Stack } from "expo-router";
import SummaryScreen from "@/screens/SummaryScreen";

export default function SummaryPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SummaryScreen />
    </>
  );
}
