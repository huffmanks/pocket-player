import { View } from "react-native";

import UploadForm from "@/components/forms/upload-video";
import { H1 } from "@/components/ui/typography";

export default function UploadScreen() {
  return (
    <View className="px-4 py-6">
      <H1 className="mb-6">Upload</H1>
      <UploadForm />
    </View>
  );
}
