import { Link } from "expo-router";
import { Text } from "react-native";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

export default function SplashScreen() {
  return (
    <ScreenSafeArea>
      <Text>TrustKeyper</Text>
      <Text>Sign in with your phone number</Text>
      <Link href="/(auth)/phone">Continue</Link>
    </ScreenSafeArea>
  );
}
