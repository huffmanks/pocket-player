import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";

import { cn } from "@/lib/utils";

import { Text } from "@/components/ui/text";

export default function LockModal() {
  const [code, setCode] = useState<number[]>([]);
  const codeLength = Array(6).fill(0);
  const router = useRouter();

  useEffect(() => {
    if (code.length === 6) {
    }
  }, [code]);

  return (
    <SafeAreaView>
      <Text className="mt-20 self-center text-2xl font-bold">Lock</Text>
      <View className="my-24 flex-row items-center justify-center gap-5">
        {codeLength.map((_, index) => (
          <View
            key={index}
            className={cn("size-5 rounded-lg", code[index] ? "bg-teal-500" : "bg-gray-500")}></View>
        ))}
      </View>
    </SafeAreaView>
  );
}

// numbersview mx-20 gap-[60px]
// number text-32
