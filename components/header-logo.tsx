import { Image, View } from "react-native";

import { Text } from "@/components/ui/text";

export default function HeaderLogo() {
  return (
    <View className="-mx-2 flex-row items-center gap-4">
      <Image
        style={{ width: 32, height: 32 }}
        source={require("../assets/icons/base_logo.png")}
      />
      <Text className="native:text-xl font-semibold">Pocket Player</Text>
    </View>
  );
}
