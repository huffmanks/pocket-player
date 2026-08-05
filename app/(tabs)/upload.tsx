import { View } from "react-native";

import UploadForm from "@/components/forms/upload-video";
import { Text } from "@/components/ui/text";

export default function UploadScreen() {
  return (
    <View className="px-4 py-6">
      <Text
        variant="h1"
        className="mb-6">
        Upload
      </Text>
      <UploadForm />
    </View>
  );
}
