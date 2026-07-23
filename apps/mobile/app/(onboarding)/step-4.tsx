import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function OnboardingStep4() {
  const router = useRouter();

  return (
    <View>
      <Text>Onboarding step 4 of 4</Text>
      <Button title="Finish" onPress={() => router.replace("/(tabs)/home")} />
    </View>
  );
}
