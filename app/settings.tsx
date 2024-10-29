import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";

import { Text } from "@/components/ui/text";

export default function Modal() {
  return (
    <>
      <View className="mx-auto w-full max-w-xs p-6">
        <Text>This is the settings screen.</Text>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
