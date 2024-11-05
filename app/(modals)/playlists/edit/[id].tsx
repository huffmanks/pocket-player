import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function EditPlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="p-4">
      <Text>Edit playlist screen.</Text>
      <Text className="text-teal-500">{id}</Text>
    </View>
  );
}
