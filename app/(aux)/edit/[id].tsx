import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function EditModal() {
  const { id } = useLocalSearchParams<{ id: string }>();

  console.log("_____ EDIT MODAL params _____", id);

  return (
    <View className="mx-auto flex-1 justify-center p-10">
      <Text>
        Edit screen <Text className="font-medium text-teal-500">{id}</Text>
      </Text>
    </View>
  );
}
