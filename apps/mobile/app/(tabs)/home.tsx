import { Text } from "react-native";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

const TAB_EDGES = ["top", "left", "right"] as const;

export default function HomeTab() {
  return (
    <ScreenSafeArea edges={TAB_EDGES}>
      <Text>Home</Text>
    </ScreenSafeArea>
  );
}
