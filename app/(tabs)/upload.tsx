import { View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import UploadForm from "@/components/forms/upload-video";

export default function UploadScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: 28, paddingBottom: insets.bottom + 84 }}
      className="relative min-h-full">
      <UploadForm />
    </View>
  );
}
