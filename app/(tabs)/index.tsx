import { View } from "react-native";

import { useMigrationHelper } from "@/db/drizzle";

import ErrorMessage from "@/components/error-message";
import VideoForm from "@/components/video-form";

export default function Home() {
  const { success, error } = useMigrationHelper();

  if (error) {
    return (
      <ErrorMessage
        message="Migration error:"
        errorMessage={error.message}
      />
    );
  }

  if (!success) {
    return <ErrorMessage message="Migration is in progress..." />;
  }

  return (
    <>
      <View className="flex-1 p-6">
        <VideoForm />
      </View>
    </>
  );
}
