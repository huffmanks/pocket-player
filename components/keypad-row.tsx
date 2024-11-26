import { memo } from "react";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";

interface KeypadRowProps {
  numbers: number[];
  handleNumberPress: (number: number) => void;
}

function KeypadRow({ numbers, handleNumberPress }: KeypadRowProps) {
  return (
    <View className="flex-row justify-between">
      {numbers.map((number) => (
        <Pressable
          key={number}
          onPress={() => handleNumberPress(number)}>
          <Text className="text-4xl">{number}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default memo(KeypadRow);
