import { memo, useState } from "react";
import { Pressable, View } from "react-native";

import { cn } from "@/lib/utils";

import { Text } from "@/components/ui/text";

interface KeypadRowProps {
  numbers: number[];
  handleNumberPress: (number: number) => void;
}

function KeypadRow({ numbers, handleNumberPress }: KeypadRowProps) {
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);

  return (
    <View className="flex-row justify-between">
      {numbers.map((number, index) => (
        <Pressable
          key={number}
          className={cn(
            "flex items-center justify-center rounded-full px-6 py-4",
            pressedIndex === index && "bg-muted"
          )}
          onPress={() => handleNumberPress(number)}
          onPressIn={() => setPressedIndex(index)}
          onPressOut={() => setPressedIndex(null)}>
          <Text className="text-4xl">{number}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default memo(KeypadRow);
