import * as React from "react";
import { Platform } from "react-native";

import * as SwitchPrimitives from "@rn-primitives/switch";
import { VariantProps, cva } from "class-variance-authority";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { NAV_THEME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const switchVariants = cva("rounded-full", {
  variants: {
    size: {
      default: "h-8 w-[46px]",
      lg: "h-9 w-[58px]",
      mega: "h-10 w-[70px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const thumbVariants = cva("rounded-full bg-background shadow-md shadow-foreground/25 ring-0", {
  variants: {
    size: {
      default: "h-7 w-7",
      lg: "h-8 w-8",
      mega: "h-9 w-9",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type SwitchProps = SwitchPrimitives.RootProps & VariantProps<typeof switchVariants>;

const SwitchWeb = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "peer h-6 w-11 shrink-0 cursor-pointer flex-row items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
        props.checked ? "bg-primary" : "bg-input",
        props.disabled && "opacity-50",
        className
      )}
      {...props}
      ref={ref}>
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-md shadow-foreground/5 ring-0 transition-transform",
          props.checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
);

SwitchWeb.displayName = "SwitchWeb";

const SwitchNative = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size = "default", ...props }, ref) => {
    const { colorScheme } = useColorScheme();

    const TRANSLATE_X_DISTANCE = size === "lg" ? 26 : size === "mega" ? 34 : 18;

    const translateX = useDerivedValue(() => (props.checked ? TRANSLATE_X_DISTANCE : 0));
    const animatedRootStyle = useAnimatedStyle(() => {
      return {
        backgroundColor: interpolateColor(
          translateX.value,
          [0, TRANSLATE_X_DISTANCE],
          [NAV_THEME[colorScheme].border, NAV_THEME[colorScheme].primary]
        ),
      };
    });
    const animatedThumbStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
    }));
    return (
      <Animated.View
        style={animatedRootStyle}
        className={cn(props.disabled && "opacity-50", switchVariants({ size }))}>
        <SwitchPrimitives.Root
          className={cn(
            "shrink-0 flex-row items-center rounded-full border-2 border-transparent",
            props.checked ? "bg-primary" : "bg-input",
            switchVariants({ size }),
            className
          )}
          {...props}
          ref={ref}>
          <Animated.View style={animatedThumbStyle}>
            <SwitchPrimitives.Thumb className={thumbVariants({ size })} />
          </Animated.View>
        </SwitchPrimitives.Root>
      </Animated.View>
    );
  }
);
SwitchNative.displayName = "SwitchNative";

const Switch = Platform.select({
  web: SwitchWeb,
  default: SwitchNative,
});

export { Switch, switchVariants, thumbVariants };
export type { SwitchProps };
