import { Text } from "react-native";
import { ScreenSafeArea } from "@/lib/ScreenSafeArea";

const TAB_EDGES = ["top", "left", "right"] as const;

export default function RecordsTab() {
  return (
    <ScreenSafeArea edges={TAB_EDGES}>
      <Text>Records</Text>
    </ScreenSafeArea>
  );
}
