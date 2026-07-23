import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function OnboardingStep1() {
  return (
    <View>
      <Text>Onboarding step 1 of 4</Text>
      <Link href="/(onboarding)/step-2">Next</Link>
    </View>
  );
}
