import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";

import { initialize, useMigrationHelper } from "@/db/drizzle";
import { clearDirectory, resetTable } from "@/db/drop";
import { VIDEOS_DIR } from "@/lib/constants";
import { DatabaseIcon } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function SettingsModal() {
  const { success, error } = useMigrationHelper();

  const dropDatabase = async () => {
    await clearDirectory(VIDEOS_DIR);
    await resetTable();

    initialize();

    if (error) {
      console.error("Migration failed:", error);
    } else {
      console.log("Database migration succeeded:", success);
    }
  };

  return (
    <>
      <View className="mx-auto w-full max-w-lg p-6">
        <Text className="mb-4">Are you sure you want to permanently erase everything?</Text>

        <Button
          variant="destructive"
          className="flex flex-row items-center justify-center gap-4"
          onPress={dropDatabase}>
          <DatabaseIcon
            className="text-foreground"
            size={20}
            strokeWidth={1.25}
          />
          <Text>Reset Data</Text>
        </Button>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
