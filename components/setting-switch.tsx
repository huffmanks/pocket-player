import { useState } from "react";
import { View } from "react-native";

import { settingsStorage } from "@/lib/storage";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SettingSwitchProps {
  id: string;
  defaultChecked?: boolean;
  label: string;
}

export default function SettingSwitch({ id, defaultChecked = false, label }: SettingSwitchProps) {
  const defaultCheckedValue = settingsStorage.getBoolean(id) || defaultChecked;
  const [checked, setChecked] = useState(defaultCheckedValue);

  function handlePress() {
    settingsStorage.set(id, !checked);
    setChecked((prev) => !prev);
  }

  return (
    <View className="flex-row items-center gap-6">
      <Switch
        checked={checked}
        onCheckedChange={handlePress}
        nativeID={id}
      />
      <Label
        nativeID={id}
        onPress={handlePress}>
        {label}
      </Label>
    </View>
  );
}
