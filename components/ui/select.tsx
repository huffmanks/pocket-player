import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";

import * as SelectPrimitive from "@rn-primitives/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";
import { FadeIn, FadeOut } from "react-native-reanimated";

import { cn } from "@/lib/utils";

import { Icon } from "@/components/ui/icon";
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { TextClassContext } from "@/components/ui/text";

type Option = SelectPrimitive.Option;

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

function SelectValue({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value> & {
  className?: string;
}) {
  const { value } = SelectPrimitive.useRootContext();
  return (
    <SelectPrimitive.Value
      ref={ref}
      className={cn(
        "line-clamp-1 flex flex-row items-center gap-2 text-sm text-foreground",
        !value && "text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function SelectTrigger({
  ref,
  className,
  children,
  size = "default",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  children?: React.ReactNode;
  size?: "default" | "sm";
}) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 flex-row items-center justify-between rounded-md border border-input bg-input/30 px-3 shadow-sm shadow-black/5 dark:active:bg-input/50",
        Platform.select({
          web: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-fit whitespace-nowrap text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        }),
        props.disabled && "opacity-50",
        size === "sm" && "h-8",
        className
      )}
      {...props}>
      <>{children}</>
      <Icon
        as={ChevronDownIcon}
        aria-hidden={true}
        className="size-4 text-muted-foreground"
      />
    </SelectPrimitive.Trigger>
  );
}

const FullWindowOverlay = React.Fragment;

function SelectContent({
  className,
  children,
  position = "popper",
  portalHost,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  className?: string;
  portalHost?: string;
}) {
  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <SelectPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
          <TextClassContext.Provider value="text-popover-foreground">
            <NativeOnlyAnimatedView
              className="z-50"
              entering={FadeIn}
              exiting={FadeOut}>
              <SelectPrimitive.Content
                className={cn(
                  "relative z-50 min-w-[8rem] rounded-md border border-border bg-popover shadow-md shadow-black/5",
                  Platform.select({
                    web: cn(
                      "origin-(--radix-select-content-transform-origin) max-h-52 overflow-y-auto overflow-x-hidden animate-in fade-in-0 zoom-in-95",
                      props.side === "bottom" && "slide-in-from-top-2",
                      props.side === "top" && "slide-in-from-bottom-2"
                    ),
                    native: "p-1",
                  }),
                  position === "popper" &&
                    Platform.select({
                      web: cn(
                        props.side === "bottom" && "translate-y-1",
                        props.side === "top" && "-translate-y-1"
                      ),
                    }),
                  className
                )}
                position={position}
                {...props}>
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                  className={cn(
                    "p-1",
                    position === "popper" &&
                      cn(
                        "w-full",
                        Platform.select({
                          web: "h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]",
                        })
                      )
                  )}>
                  {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
              </SelectPrimitive.Content>
            </NativeOnlyAnimatedView>
          </TextClassContext.Provider>
        </SelectPrimitive.Overlay>
      </FullWindowOverlay>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn("px-2 py-2 text-xs text-muted-foreground sm:py-1.5", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "group relative flex w-full flex-row items-center gap-2 rounded-sm py-2 pl-2 pr-8 active:bg-accent sm:py-1.5",
        Platform.select({
          web: "*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 cursor-default outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none [&_svg]:pointer-events-none",
        }),
        props.disabled && "opacity-50",
        className
      )}
      {...props}>
      <View className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon
            as={CheckIcon}
            className="size-4 shrink-0 text-muted-foreground"
          />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="select-none text-sm text-foreground group-active:text-accent-foreground" />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        "-mx-1 my-1 h-px bg-border",
        Platform.select({ web: "pointer-events-none" }),
        className
      )}
      {...props}
    />
  );
}

/**
 * @platform Web only
 * Returns null on native platforms
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  if (Platform.OS !== "web") {
    return null;
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <Icon
        as={ChevronUpIcon}
        className="size-4"
      />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * @platform Web only
 * Returns null on native platforms
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  if (Platform.OS !== "web") {
    return null;
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <Icon
        as={ChevronDownIcon}
        className="size-4"
      />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
};
