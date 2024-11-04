import { useEffect, useState } from "react";
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
  const [checked, setChecked] = useState(settingsStorage.getBoolean(id) ?? defaultChecked);

  useEffect(() => {
    settingsStorage.set(id, checked === true ? true : false);
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
