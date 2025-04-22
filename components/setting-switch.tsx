import { useEffect, useState } from "react";
import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useSecurityStore, useSettingsStore } from "@/lib/store";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";

export type SettingId =
  | "autoplay"
  | "enablePasscode"
  | "loop"
  | "mute"
  | "isNativeControls"
  | "overrideOrientation";

interface SettingSwitchProps {
  id: SettingId;
  defaultChecked?: boolean;
  label: string;
  description?: string;
}

export default function SettingSwitch({
  id,
  defaultChecked = false,
  label,
  description,
}: SettingSwitchProps) {
  const {
    autoPlay,
    loop,
    mute,
    isNativeControls,
    overrideOrientation,
    setAutoPlay,
    setLoop,
    setMute,
    setIsNativeControls,
    setOverrideOrientation,
  } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      loop: state.loop,
      mute: state.mute,
      isNativeControls: state.isNativeControls,
      overrideOrientation: state.overrideOrientation,
      setAutoPlay: state.setAutoPlay,
      setLoop: state.setLoop,
      setMute: state.setMute,
      setIsNativeControls: state.setIsNativeControls,
      setOverrideOrientation: state.setOverrideOrientation,
    }))
  );

  const { enablePasscode, setEnablePasscode } = useSecurityStore(
    useShallow((state) => ({
      enablePasscode: state.enablePasscode,
      setEnablePasscode: state.setEnablePasscode,
    }))
  );

  const settingsMap = {
    autoplay: autoPlay,
    enablePasscode: enablePasscode,
    loop: loop,
    mute: mute,
    isNativeControls: isNativeControls,
    overrideOrientation: overrideOrientation,
  } as const;

  const settersMap = {
    autoplay: setAutoPlay,
    enablePasscode: setEnablePasscode,
    loop: setLoop,
    mute: setMute,
    isNativeControls: setIsNativeControls,
    overrideOrientation: setOverrideOrientation,
  } as const;

  const [checked, setChecked] = useState(
    settingsMap[id as keyof typeof settingsMap] ?? defaultChecked
  );

  useEffect(() => {
    const setter = settersMap[id as keyof typeof settersMap];
    setter(checked);
  }, [checked, id]);

  return (
    <View className="flex-row items-center gap-6">
      <Switch
        nativeID={id}
        checked={checked}
        onCheckedChange={setChecked}
      />
      <View>
        <Label
          nativeID={id}
          className="native:text-lg"
          style={{ paddingBottom: 0 }}
          onPress={() => setChecked((prev) => !prev)}>
          {label}
        </Label>
        {!!description && <Text className="pt-1 text-sm text-muted-foreground">{description}</Text>}
      </View>
    </View>
  );
}
