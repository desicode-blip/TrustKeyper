import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View>
      <Text>TrustKeyper</Text>
      <Text>Sign in with your phone number</Text>
      <Link href="/(auth)/phone">Continue</Link>
    </View>
  );
}
