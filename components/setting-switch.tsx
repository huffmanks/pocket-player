import { useEffect, useState } from "react";
import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { useSecurityStore, useSettingsStore } from "@/lib/store";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type SettingId = "autoplay" | "mute" | "loop" | "enablePasscode";

interface SettingSwitchProps {
  id: SettingId;
  defaultChecked?: boolean;
  label: string;
}

export default function SettingSwitch({ id, defaultChecked = false, label }: SettingSwitchProps) {
  const { autoPlay, mute, loop, setAutoPlay, setLoop, setMute } = useSettingsStore(
    useShallow((state) => ({
      autoPlay: state.autoPlay,
      mute: state.mute,
      loop: state.loop,
      setAutoPlay: state.setAutoPlay,
      setLoop: state.setLoop,
      setMute: state.setMute,
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
    mute: mute,
    loop: loop,
    enablePasscode: enablePasscode,
  } as const;

  const settersMap = {
    autoplay: setAutoPlay,
    mute: setMute,
    loop: setLoop,
    enablePasscode: setEnablePasscode,
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
        checked={checked}
        onCheckedChange={setChecked}
        nativeID={id}
      />
      <Label
        nativeID={id}
        onPress={() => setChecked((prev) => !prev)}>
        {label}
      </Label>
    </View>
  );
}
