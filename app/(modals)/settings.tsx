import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Platform, View } from "react-native";

import { initialize, useMigrationHelper } from "@/db/drizzle";
import { clearDirectory, resetTable } from "@/db/drop";
import { VIDEOS_DIR, settingsSwitches } from "@/lib/constants";
import { DatabaseIcon, KeyRoundIcon } from "@/lib/icons";
import { settingsStorage } from "@/lib/storage";

import OrientationRadio from "@/components/orientation-radio";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

if (settingsStorage.getBoolean("mute") === undefined) settingsStorage.set("mute", false);
if (settingsStorage.getBoolean("loop") === undefined) settingsStorage.set("loop", false);
if (settingsStorage.getBoolean("autoplay") === undefined) settingsStorage.set("autoplay", false);
if (settingsStorage.getString("orientation") === undefined)
  settingsStorage.set("orientation", "portrait");

if (settingsStorage.getBoolean("enablePasscode") === undefined)
  settingsStorage.set("enablePasscode", false);

export default function SettingsModal() {
  const [enablePasscode, setEnablePasscode] = useState(
    settingsStorage.getBoolean("enablePasscode") || false
  );
  const [hasPasscode, setHasPasscode] = useState(
    settingsStorage.getNumber("passcode") ? true : false
  );
  const { success, error } = useMigrationHelper();

  async function dropDatabase() {
    await clearDirectory(VIDEOS_DIR);
    await resetTable();

    initialize();

    if (error) {
      console.error("Migration failed:", error);
    } else {
      console.log("Database migration succeeded:", success);
    }
  }

  function handleEnablePasscode() {
    settingsStorage.set("enablePasscode", !enablePasscode);
    setEnablePasscode((prev) => !prev);
  }

  return (
    <>
      <View className="mx-auto w-full max-w-lg p-6">
        <View className="mb-6 gap-6">
          <Text className="mb-4 text-xl font-semibold">Video player</Text>
          {settingsSwitches.map((item) => (
            <SettingSwitch
              key={item.id}
              id={item.id}
              label={item.label}
            />
          ))}
          <OrientationRadio />
        </View>

        <Separator className="mb-6" />

        <View className="mb-6 gap-6">
          <Text className="mb-4 text-xl font-semibold">Passcode</Text>

          <View className="flex-row items-center gap-6">
            <Switch
              checked={enablePasscode}
              onCheckedChange={handleEnablePasscode}
              nativeID="enablePasscode"
            />
            <Label
              nativeID="enablePasscode"
              onPress={handleEnablePasscode}>
              Enable passcode
            </Label>
          </View>

          {enablePasscode && (
            <Button
              variant="secondary"
              className="flex flex-row items-center justify-center gap-4">
              <KeyRoundIcon
                className="text-white"
                size={20}
                strokeWidth={1.25}
              />
              <Text>{hasPasscode ? "Update" : "Create"}</Text>
            </Button>
          )}
        </View>

        <Separator className="mb-6" />

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
                <Text>Reset Data</Text>
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
                  <Text className="text-foreground">Delete</Text>
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
