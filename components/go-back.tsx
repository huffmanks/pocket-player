import { type Href, router } from "expo-router";
import { Pressable } from "react-native";

import { ChevronLeftIcon } from "@/lib/icons";

interface GoBackProps {
  fallbackHref: Href;
}

export default function GoBack({ fallbackHref }: GoBackProps) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.dismissTo(fallbackHref))}
      hitSlop={12}
      className="pr-2">
      <ChevronLeftIcon
        className="text-foreground"
        size={24}
        strokeWidth={1.5}
      />
    </Pressable>
  );
}
