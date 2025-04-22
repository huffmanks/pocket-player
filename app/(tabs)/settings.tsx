import { cacheDirectory } from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { clearDirectory, resetTables } from "@/db/drop";
import { VIDEOS_DIR, settingsSwitches } from "@/lib/constants";
import { GitMergeIcon, KeyRoundIcon, TrashIcon } from "@/lib/icons";
import { migrateDatabase } from "@/lib/migrate-database";
import { resetPersistedStorage, useSecurityStore } from "@/lib/store";
import { withDelay } from "@/lib/utils";

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
  const [isMigrationDisabled, setIsMigrationDisabled] = useState(false);
  const insets = useSafeAreaInsets();

  const { passcode, enablePasscode, setEnablePasscode } = useSecurityStore(
    useShallow((state) => ({
      passcode: state.passcode,
      enablePasscode: state.enablePasscode,
      setEnablePasscode: state.setEnablePasscode,
    }))
  );

  async function handleClearData() {
    const promise = withDelay(async () => {
      await clearDirectory(VIDEOS_DIR);
      await clearDirectory(cacheDirectory || "");
      await resetTables();
      resetPersistedStorage();
      return { message: "Data has been deleted." };
    }, 2000);

    toast.promise(promise, {
      loading: "Data being deleted...",
      success: ({ message }) => message,
      error: "Data deletion has failed.",
    });
  }

  function handleMigrateDatabase() {
    setIsMigrationDisabled(true);
    const promise = withDelay(() => migrateDatabase(), 2000);

    toast.promise(promise, {
      loading: "Database migrating...",
      success: ({ message }) => message,
      error: "Database migration failed.",
    });

    promise.finally(() => {
      setIsMigrationDisabled(false);
    });
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
    <ScrollView
      contentInset={insets}
      contentContainerClassName="pb-20"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-lg p-6">
        <View className="mb-6 gap-6">
          <View>
            <Text className="mb-1 text-xl font-semibold">Video player</Text>
            <Text className="text mb-2 text-muted-foreground">Default settings</Text>
          </View>
          {settingsSwitches.map((item) => (
            <SettingSwitch
              key={"settings-screen_" + item.id}
              id={item.id}
              label={item.label}
              description={item.description}
            />
          ))}
        </View>

        <Separator className="mb-6 mt-2" />

        <View className="mb-6 gap-6">
          <Text className="text-xl font-semibold">Passcode</Text>

          <SettingSwitch
            key="setttings-screen_enablePasscode"
            id="enablePasscode"
            label="Enable passcode"
          />

          <Button
            disabled={!enablePasscode}
            variant="secondary"
            className="mt-2 flex flex-row items-center justify-center gap-4"
            onPress={() => router.push("/(modals)/passcode")}>
            <KeyRoundIcon
              className="text-foreground"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              {passcode !== null ? "Change" : "Create"} passcode
            </Text>
          </Button>
        </View>

        <Separator className="mb-6 mt-2" />

        <View className="mb-6 gap-6">
          <Text className="text-xl font-semibold">Database</Text>

          <Button
            variant="secondary"
            disabled={isMigrationDisabled}
            className="flex flex-row items-center justify-center gap-4"
            onPress={handleMigrateDatabase}>
            <GitMergeIcon
              className="text-foreground"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              Migrate database
            </Text>
          </Button>

          <View className="mt-3 gap-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex flex-row items-center justify-center gap-4">
                  <TrashIcon
                    className="text-white"
                    size={24}
                    strokeWidth={1.5}
                  />
                  <Text className="native:text-base font-semibold uppercase tracking-wider">
                    Delete all data
                  </Text>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your local app
                    data and files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive"
                    onPress={handleClearData}>
                    <Text className="text-white">Delete</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
