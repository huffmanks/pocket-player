import { View } from "react-native";

import { Text } from "@/components/ui/text";

interface ErrorMessageProps {
  message: string;
  errorMessage?: string;
}

export default function ErrorMessage({ message, errorMessage }: ErrorMessageProps) {
  return (
    <View className="flex-1 gap-5 bg-secondary/30 p-6">
      <Text>
        {message} {errorMessage && errorMessage}
      </Text>
    </View>
  );
}
