import { Link } from "expo-router";
import { Image, View } from "react-native";

import { CloudUploadIcon } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center pb-20">
      <Image
        className="mb-10"
        style={{ width: 75, height: 75 }}
        source={require("../../assets/icons/base_logo.png")}
      />
      <H1 className="mb-3 text-center text-foreground">Pocket Player</H1>
      <View>
        <Text className="mb-10 text-center text-muted-foreground">
          Get started by uploading some videos.
        </Text>
        <Link
          asChild
          href="/(tabs)/upload">
          <Button
            size="lg"
            className="flex flex-row items-center justify-center gap-4 bg-brand">
            <CloudUploadIcon
              className="text-white"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg font-semibold uppercase tracking-wider text-white">
              Upload
            </Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
