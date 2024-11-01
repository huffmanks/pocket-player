import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, TouchableOpacity, View } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { DeleteIcon, ScanFaceIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import KeypadRow from "@/components/keypad-row";
import { Text } from "@/components/ui/text";

export default function LockModal() {
  const [code, setCode] = useState<number[]>([]);
  const codeLength = Array(6).fill(0);
  const router = useRouter();

  const offset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const OFFSET = 20;
  const TIME = 80;

  useEffect(() => {
    if (code.length === 6) {
      setCode([]);

      // Refactor using expo-secure-store
      if (code.join("") === "111111") {
        router.replace("/");
      } else {
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 2 }),
          withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
          withTiming(0, { duration: TIME / 2 })
        );

        handleErrorShake();
      }
    }
  }, [code]);

  async function handleNumberPress(number: number) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode([...code, number]);
  }

  async function handleBackspacePress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode(code.slice(0, -1));
  }

  async function handleBiometricPress() {
    const { success } = await LocalAuthentication.authenticateAsync();

    setCode([]);

    if (success) {
      router.replace("/");
    } else {
      handleErrorShake();
    }
  }

  async function handleErrorShake() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  return (
    <SafeAreaView>
      <Text className="mb-24 mt-32 self-center text-3xl font-bold">Welcome back!</Text>
      <Animated.View
        className="mb-28 flex-row items-center justify-center gap-5"
        style={animatedStyle}>
        {codeLength.map((_, index) => (
          <View
            key={index}
            className={cn("size-5 rounded-xl", code[index] ? "bg-teal-500" : "bg-gray-500")}></View>
        ))}
      </Animated.View>
      <View className="mx-20 gap-16">
        <KeypadRow
          numbers={[1, 2, 3]}
          handleNumberPress={handleNumberPress}
        />
        <KeypadRow
          numbers={[4, 5, 6]}
          handleNumberPress={handleNumberPress}
        />
        <KeypadRow
          numbers={[7, 8, 9]}
          handleNumberPress={handleNumberPress}
        />

        <View className="flex-row justify-between">
          <TouchableOpacity onPress={handleBiometricPress}>
            <ScanFaceIcon
              size={26}
              className="text-foreground"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNumberPress(0)}>
            <Text className="text-4xl">0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={code.length < 1}
            onPress={handleBackspacePress}>
            <DeleteIcon
              size={26}
              className="text-foreground"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
