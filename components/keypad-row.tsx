import { TouchableOpacity, View } from "react-native";

import { Text } from "@/components/ui/text";

interface KeypadRowProps {
  numbers: number[];
  handleNumberPress: (number: number) => void;
}

export default function KeypadRow({ numbers, handleNumberPress }: KeypadRowProps) {
  return (
    <View className="flex-row justify-between">
      {numbers.map((number) => (
        <TouchableOpacity
          key={`keypad-row_${number}`}
          onPress={() => handleNumberPress(number)}>
          <Text className="text-4xl">{number}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
