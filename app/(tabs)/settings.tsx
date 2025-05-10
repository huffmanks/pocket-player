import { cacheDirectory } from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { useShallow } from "zustand/react/shallow";

import { clearDirectory, resetTables } from "@/db/drop";
import {
  BOTTOM_TABS_OFFSET,
  VIDEOS_DIR,
  lockIntervalOptions,
  settingsSwitches,
} from "@/lib/constants";
import { FileVideo2Icon, KeyRoundIcon, SettingsIcon, TrashIcon } from "@/lib/icons";
import { resetPersistedStorage, useSecurityStore } from "@/lib/store";
import { cn, withDelay } from "@/lib/utils";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";

export default function SettingsScreen() {
  const [selectTriggerWidth, setSelectTriggerWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const contentInsets = {
    top: insets.top + BOTTOM_TABS_OFFSET,
    bottom: insets.bottom + BOTTOM_TABS_OFFSET,
    left: 12,
    right: 12,
  };

  const { passcode, enablePasscode, lockInterval, setEnablePasscode, setLockInterval } =
    useSecurityStore(
      useShallow((state) => ({
        passcode: state.passcode,
        enablePasscode: state.enablePasscode,
        lockInterval: state.lockInterval,
        setEnablePasscode: state.setEnablePasscode,
        setLockInterval: state.setLockInterval,
      }))
    );

  async function handleResetSettings() {
    const promise = withDelay(async () => {
      resetPersistedStorage();
      return { message: "Settings has been reset." };
    }, 500);

    toast.promise(promise, {
      loading: "Settings being reset...",
      success: ({ message }) => message,
      error: "Reset settings has failed.",
    });
  }

  async function handleDeleteFiles() {
    const promise = withDelay(async () => {
      await clearDirectory(VIDEOS_DIR);
      await clearDirectory(cacheDirectory || "");
      await resetTables();
      return { message: "All files have been deleted." };
    }, 1000);

    toast.promise(promise, {
      loading: "Files being deleted...",
      success: ({ message }) => message,
      error: "File deletion has failed.",
    });
  }

  async function handleClearAllData() {
    const promise = withDelay(async () => {
      await clearDirectory(VIDEOS_DIR);
      await clearDirectory(cacheDirectory || "");
      await resetTables();
      resetPersistedStorage();
      return { message: "All data has been deleted." };
    }, 2000);

    toast.promise(promise, {
      loading: "Data being deleted...",
      success: ({ message }) => message,
      error: "Data deletion has failed.",
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

  const selectedOption = lockIntervalOptions.find(
    (option) => option.value === lockInterval?.toString()
  );

  return (
    <ScrollView
      contentInset={insets}
      contentContainerClassName="pt-6 pb-20 px-3"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <H1 className="mb-6">Settings</H1>
      <View className="px-3">
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
            onPress={() => router.push("/(screens)/passcode")}>
            <KeyRoundIcon
              className="text-foreground"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              {passcode !== null ? "Change" : "Create"} passcode
            </Text>
          </Button>

          <View>
            <Select
              disabled={!enablePasscode}
              value={selectedOption}
              onValueChange={(option) => option && setLockInterval(Number(option.value))}>
              <SelectLabel
                className={cn(
                  "native:pl-0 native:text-lg pl-0 text-base",
                  !enablePasscode ? "opacity-50" : "opacity-100"
                )}>
                Lock timeout
              </SelectLabel>
              <SelectTrigger
                disabled={!enablePasscode}
                onLayout={(ev) => {
                  setSelectTriggerWidth(ev.nativeEvent.layout.width);
                }}>
                <SelectValue
                  className="native:text-lg text-sm text-foreground"
                  placeholder="Select a lock timeout"
                />
              </SelectTrigger>
              <SelectContent
                insets={contentInsets}
                style={{ width: selectTriggerWidth }}>
                <SelectGroup>
                  <SelectLabel className="native:pl-3 native:text-lg pl-3 text-base">
                    Lock timeout
                  </SelectLabel>
                  <Separator />
                  {lockIntervalOptions.map((interval) => (
                    <SelectItem
                      key={interval.value}
                      label={interval.label}
                      value={interval.value}>
                      <Text>{interval.label}</Text>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        </View>

        <Separator className="mb-6 mt-2" />

        <View className="mb-6 gap-6">
          <Text className="text-xl font-semibold">Data</Text>

          <View className="mt-3 gap-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex flex-row items-center justify-center gap-4">
                  <SettingsIcon
                    className="text-foreground"
                    size={24}
                    strokeWidth={1.5}
                  />
                  <Text className="native:text-base font-semibold uppercase tracking-wider">
                    Reset settings
                  </Text>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will reset all settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction onPress={handleResetSettings}>
                    <Text>Reset</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </View>
          <View className="mt-3 gap-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex flex-row items-center justify-center gap-4">
                  <FileVideo2Icon
                    className="text-destructive-foreground"
                    size={24}
                    strokeWidth={1.5}
                  />
                  <Text className="native:text-base font-semibold uppercase tracking-wider">
                    Delete files
                  </Text>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all uploaded videos
                    and thumbnails.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction onPress={handleDeleteFiles}>
                    <Text>Delete</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </View>
          <View className="mt-3 gap-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex flex-row items-center justify-center gap-4">
                  <TrashIcon
                    className="text-destructive-foreground"
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
                  <AlertDialogAction onPress={handleClearAllData}>
                    <Text>Delete</Text>
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
