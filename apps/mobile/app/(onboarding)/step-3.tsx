import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function OnboardingStep3() {
  return (
    <View>
      <Text>Onboarding step 3 of 4</Text>
      <Link href="/(onboarding)/step-4">Next</Link>
    </View>
  );
}
