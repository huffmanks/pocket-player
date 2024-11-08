import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";

import { toast } from "sonner-native";

import { initialize, useMigrationHelper } from "@/db/drizzle";
import { clearDirectory, resetTables } from "@/db/drop";
import { VIDEOS_DIR, settingsSwitches } from "@/lib/constants";
import { DatabaseIcon, KeyRoundIcon } from "@/lib/icons";
import { settingsStorage } from "@/lib/storage";

import SettingSwitch from "@/components/setting-switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

export default function SettingsModal() {
  const [enablePasscode, setEnablePasscode] = useState(
    settingsStorage.getBoolean("enablePasscode") || false
  );
  const [hasPasscode, setHasPasscode] = useState(
    settingsStorage.getNumber("passcode") ? true : false
  );

  const { success, error } = useMigrationHelper();

  async function dropDatabase() {
    try {
      await clearDirectory(VIDEOS_DIR);
      await resetTables();

      if (error) {
        console.error("Migration failed:", error);
        toast.error("Migration failed.");
        return;
      }

      await initialize();
      console.info("Database initialized.");
      toast.success("Database initialized.");
    } catch (err) {
      console.error("Database operation failed:", err);
      toast.error("Database operation failed.");
    }
  }

  useEffect(() => {
    const listener = settingsStorage.addOnValueChangedListener((changedKey) => {
      const newValue = settingsStorage.getBoolean(changedKey) as boolean;

      if (changedKey === "enablePasscode") {
        setEnablePasscode(newValue);
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <>
      <View className="mx-auto w-full max-w-lg p-6">
        <View className="mb-6 gap-6">
          <View>
            <Text className="mb-1 text-xl font-semibold">Video player</Text>
            <Text className="mb-2 text-lg text-muted-foreground">Default settings</Text>
          </View>
          {settingsSwitches.map((item) => (
            <SettingSwitch
              key={"settings-screen_" + item.id}
              id={item.id}
              label={item.label}
            />
          ))}
        </View>

        <Separator className="mb-6 mt-2" />

        <View className="mb-6 gap-6">
          <Text className="mb-4 text-xl font-semibold">Passcode</Text>

          <SettingSwitch
            key="setttings-screen_enablePasscode"
            id="enablePasscode"
            label="Enable passcode"
          />

          {enablePasscode && (
            <Button
              variant="secondary"
              className="flex flex-row items-center justify-center gap-4">
              <KeyRoundIcon
                className="text-foreground"
                size={20}
                strokeWidth={1.25}
              />
              <Text>{hasPasscode ? "Update" : "Create"}</Text>
            </Button>
          )}
        </View>

        <Separator className="mb-6 mt-2" />

        <View className="gap-6">
          <Text className="mb-4 text-xl font-semibold">Danger zone</Text>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex flex-row items-center justify-center gap-4">
                <DatabaseIcon
                  className="text-white"
                  size={20}
                  strokeWidth={1.25}
                />
                <Text>Delete data</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive"
                  onPress={async () => await dropDatabase()}>
                  <Text className="text-white">Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </>
  );
}
