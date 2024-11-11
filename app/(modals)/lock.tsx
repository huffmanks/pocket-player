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

import { ERROR_SHAKE_OFFSET, ERROR_SHAKE_TIME } from "@/lib/constants";
import { DeleteIcon, ScanFaceIcon } from "@/lib/icons";
import { useSecurityStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import KeypadRow from "@/components/keypad-row";
import { Text } from "@/components/ui/text";

export default function LockModal() {
  const [code, setCode] = useState<number[]>([]);
  const codeLength = Array(4).fill(0);
  const router = useRouter();
  const setIsLocked = useSecurityStore((state) => state.setIsLocked);

  const offset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  useEffect(() => {
    if (code.length === 4) {
      setCode([]);

      if (code.join("") === "1111") {
        setIsLocked(false);
        router.replace("/");
      } else {
        offset.value = withSequence(
          withTiming(-ERROR_SHAKE_OFFSET, { duration: ERROR_SHAKE_TIME / 2 }),
          withRepeat(withTiming(ERROR_SHAKE_OFFSET, { duration: ERROR_SHAKE_TIME }), 4, true),
          withTiming(0, { duration: ERROR_SHAKE_TIME / 2 })
        );

        (async () => {
          await handleErrorShake();
        })();
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
      setIsLocked(false);
      router.replace("/");
    } else {
      await handleErrorShake();
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
            key={`code-dots_${index}`}
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
              className={cn("text-foreground", code.length < 1 && "text-muted-foreground")}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
