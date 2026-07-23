import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function OnboardingStep2() {
  return (
    <View>
      <Text>Onboarding step 2 of 4</Text>
      <Link href="/(onboarding)/step-3">Next</Link>
    </View>
  );
}
