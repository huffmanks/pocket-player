import { View } from "react-native";

import UploadForm from "@/components/forms/upload-video";

export default function UploadScreen() {
  return (
    <View className="mx-auto mb-8 w-full max-w-md px-2 py-8">
      <UploadForm />
    </View>
  );
}
