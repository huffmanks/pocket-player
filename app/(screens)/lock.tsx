import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { NavigationBar } from "expo-navigation-bar";
import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { DeleteIcon, ScanFaceIcon } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { ERROR_SHAKE_OFFSET, ERROR_SHAKE_TIME } from "@/lib/constants";
import handleRedirect from "@/lib/handle-redirect";
import { useSecurityStore, useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import KeypadRow from "@/components/keypad-row";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function LockScreen() {
  const [code, setCode] = useState<number[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const codeLength = Array(4).fill(0);
  const insets = useSafeAreaInsets();

  const { lastVisitedPath, previousVisitedPath } = useSettingsStore(
    useShallow((state) => ({
      lastVisitedPath: state.lastVisitedPath,
      previousVisitedPath: state.previousVisitedPath,
    }))
  );
  const { passcode, setIsLocked } = useSecurityStore(
    useShallow((state) => ({
      passcode: state.passcode,
      setIsLocked: state.setIsLocked,
    }))
  );

  const offset = useSharedValue(0);
  const offsetRef = useRef(offset);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  const handleErrorShake = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const handleUnlockApp = useCallback(async () => {
    setIsLocked(false);
    await handleRedirect({ lastVisitedPath, previousVisitedPath });
  }, [setIsLocked, lastVisitedPath, previousVisitedPath]);

  const handleNumberPress = useCallback((number: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode((prevCode) => [...prevCode, number]);
  }, []);

  const handleBackspacePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCode((prevCode) => prevCode.slice(0, -1));
  }, []);

  const handleBiometricPress = useCallback(async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    setCode([]);

    if (success) {
      await handleUnlockApp();
    } else {
      await handleErrorShake();
    }
  }, [handleUnlockApp, handleErrorShake]);

  const triggerShakeAnimation = useCallback(() => {
    offsetRef.current.value = withSequence(
      withTiming(-ERROR_SHAKE_OFFSET, { duration: ERROR_SHAKE_TIME / 2 }),
      withRepeat(withTiming(ERROR_SHAKE_OFFSET, { duration: ERROR_SHAKE_TIME }), 4, true),
      withTiming(0, { duration: ERROR_SHAKE_TIME / 2 })
    );
  }, []);

  useEffect(() => {
    if (code.length === 4) {
      (async () => {
        setCode([]);

        if (code.join("") === passcode) {
          await handleUnlockApp();
        } else {
          triggerShakeAnimation();
          await handleErrorShake();
        }
      })();
    }
  }, [code, passcode, triggerShakeAnimation, handleUnlockApp, handleErrorShake]);

  useFocusEffect(
    useCallback(() => {
      try {
        NavigationBar.setHidden(true);
        StatusBar.setHidden(true);
      } catch (_error) {}

      return () => {
        try {
          NavigationBar.setHidden(false);
          StatusBar.setHidden(false);
        } catch (_error) {}
      };
    }, [])
  );

  return (
    <SafeAreaView style={{ marginTop: insets.top + 40 }}>
      <View className="mb-12 items-center justify-center">
        <Image
          style={{ width: 75, height: 75 }}
          source={require("../../assets/icons/base_logo.png")}
        />
      </View>

      <Text className="mb-16 self-center text-3xl font-bold">Welcome back!</Text>
      <Animated.View
        className="mb-24 flex-row items-center justify-center gap-5"
        style={animatedStyle}>
        {codeLength.map((_, index) => (
          <View
            key={`code-dots_${index}`}
            className={cn(
              "size-5 rounded-xl",
              code[index] !== undefined ? "bg-brand-foreground" : "bg-gray-500"
            )}></View>
        ))}
      </Animated.View>
      <View className="mx-16 gap-10">
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
          <Pressable
            className="flex items-center justify-center rounded-full px-5 py-4"
            onPress={handleBiometricPress}>
            <Icon
              as={ScanFaceIcon}
              size={26}
              className="text-foreground"
            />
          </Pressable>

          <KeypadRow
            numbers={[0]}
            handleNumberPress={handleNumberPress}
          />

          <Pressable
            className={cn(
              "flex items-center justify-center rounded-full px-5 py-4",
              isPressed && "bg-muted"
            )}
            disabled={code.length < 1}
            onPress={handleBackspacePress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}>
            <Icon
              as={DeleteIcon}
              size={26}
              className={cn("text-foreground", code.length < 1 && "text-muted-foreground")}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
