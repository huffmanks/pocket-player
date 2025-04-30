import { Image, View } from "react-native";

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Image
        style={{ width: 75, height: 75 }}
        source={require("../../assets/icons/base_logo.png")}
      />
    </View>
  );
}
