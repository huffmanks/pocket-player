import { type Href, router } from "expo-router";
import { Pressable } from "react-native";

import { ChevronLeftIcon } from "lucide-react-native";

import { Icon } from "@/components/ui/icon";

interface GoBackProps {
  fallbackHref: Href;
}

export default function GoBack({ fallbackHref }: GoBackProps) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.push(fallbackHref))}
      hitSlop={12}
      className="pr-3 pt-0.5">
      <Icon
        as={ChevronLeftIcon}
        className="text-foreground"
        size={24}
        strokeWidth={1.5}
      />
    </Pressable>
  );
}
