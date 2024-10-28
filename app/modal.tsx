import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function Modal() {
  return (
    <>
      <View className="mx-auto w-full max-w-xs p-6">
        <Text>This is a modal.</Text>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
