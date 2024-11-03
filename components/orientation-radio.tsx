import { useState } from "react";
import { View } from "react-native";

import { settingsStorage } from "@/lib/storage";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Text } from "@/components/ui/text";

export default function OrientationRadio() {
  const [value, setValue] = useState("portrait");

  function onLabelPress(label: string) {
    return () => {
      settingsStorage.set("orientation", label);
      setValue(label);
    };
  }
  return (
    <>
      <Text className="mb-1 mt-2 text-lg">Orientation</Text>
      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="flex-row gap-8">
        <RadioGroupItemWithLabel
          id="orientation-radio-portrait"
          value="portrait"
          label="Portrait"
          onLabelPress={onLabelPress("portrait")}
        />
        <RadioGroupItemWithLabel
          id="orientation-radio-landscape"
          value="landscape"
          label="Landscape"
          onLabelPress={onLabelPress("landscape")}
        />
      </RadioGroup>
    </>
  );
}

function RadioGroupItemWithLabel({
  id,
  value,
  label,
  onLabelPress,
}: {
  id: string;
  value: string;
  label: string;
  onLabelPress: () => void;
}) {
  return (
    <View className={"flex-row items-center gap-4"}>
      <RadioGroupItem
        aria-labelledby={id}
        value={value}
      />
      <Label
        nativeID={id}
        onPress={onLabelPress}>
        {label}
      </Label>
    </View>
  );
}
