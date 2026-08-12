import { Image } from "expo-image";
import { Link } from "expo-router";
import { View } from "react-native";

import { CloudUploadIcon } from "lucide-react-native";

import { BASE_LOGO } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function IndexScreen() {
  return (
    <View className="flex-1 items-center justify-center pb-20">
      <View className="mb-10">
        <Image
          style={{ width: 75, height: 75 }}
          source={BASE_LOGO}
        />
      </View>
      <Text
        variant="h1"
        className="mb-3 text-center text-foreground">
        Pocket Player
      </Text>
      <View>
        <Text className="mb-10 text-center text-muted-foreground">
          Get started by uploading some videos.
        </Text>
        <Link
          asChild
          href="/(tabs)/upload">
          <Button
            size="lg"
            variant="brand"
            className="flex flex-row items-center justify-center gap-3">
            <Icon
              as={CloudUploadIcon}
              color="white"
              size={24}
              strokeWidth={1.5}
            />
            <Text className="native:text-lg font-semibold uppercase tracking-wider">Upload</Text>
          </Button>
        </Link>
      </View>
    </View>
  );
}
