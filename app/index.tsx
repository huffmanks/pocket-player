import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import { EXCLUDED_PATHS } from "@/lib/constants";
import { CloudUploadIcon } from "@/lib/icons";
import { useSettingsStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";

export default function IndexScreen() {
  const router = useRouter();
  const { isFirstAppLoad, previousPath, setIsFirstAppLoad } = useSettingsStore(
    useShallow((state) => ({
      isFirstAppLoad: state.isFirstAppLoad,
      previousPath: state.previousPath,
      setIsFirstAppLoad: state.setIsFirstAppLoad,
    }))
  );

  function handlePress() {
    setIsFirstAppLoad();
    router.push("/(tabs)/upload");
  }

  useEffect(() => {
    if (!isFirstAppLoad) {
      const timeout = setTimeout(() => {
        if (previousPath && !EXCLUDED_PATHS.includes(previousPath)) {
          router.push(previousPath as any);
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center pb-20">
      <Image
        className="mb-10"
        style={{ width: 75, height: 75 }}
        source={require("../assets/icons/base_logo.png")}
      />
      <H1 className="mb-3 text-foreground">Pocket Player</H1>
      {isFirstAppLoad && (
        <View>
          <Text className="mb-10 text-muted-foreground">Get started by uploading some videos.</Text>

          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-4 bg-brand"
            onPress={handlePress}>
            <CloudUploadIcon
              className="text-foreground"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg font-semibold uppercase tracking-wider text-foreground">
              Upload
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
}
