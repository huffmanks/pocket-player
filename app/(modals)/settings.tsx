import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";

import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { clearDirectory, resetTables } from "@/db/drop";
import { VIDEOS_DIR, settingsSwitches } from "@/lib/constants";
import { DatabaseIcon, KeyRoundIcon } from "@/lib/icons";
import { useAppStore, useSecurityStore } from "@/lib/store";

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
  const setAppLoadedOnce = useAppStore((state) => state.setAppLoadedOnce);
  const { passcode, enablePasscode, setEnablePasscode } = useSecurityStore(
    useShallow((state) => ({
      passcode: state.passcode,
      enablePasscode: state.enablePasscode,
      setEnablePasscode: state.setEnablePasscode,
    }))
  );

  async function dropDatabase() {
    try {
      await clearDirectory(VIDEOS_DIR);
      await resetTables();

      setAppLoadedOnce(false);

      console.info("Database initialized.");
      toast.success("Database initialized.");
    } catch (err) {
      console.error("Database operation failed:", err);
      toast.error("Database operation failed.");
    }
  }

  useEffect(() => {
    const unsubscribe = useSecurityStore.subscribe((state, prevState) => {
      if (state.enablePasscode !== prevState.enablePasscode) {
        setEnablePasscode(state.enablePasscode);
      }
    });

    return () => {
      unsubscribe();
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

          <Button
            disabled={!enablePasscode}
            variant="secondary"
            className="flex flex-row items-center justify-center gap-4"
            onPress={() => router.push("/(modals)/passcode")}>
            <KeyRoundIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
            <Text>{passcode !== null ? "Change" : "Create"}</Text>
          </Button>
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
