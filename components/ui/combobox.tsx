import * as React from "react";
import { ListRenderItemInfo, Pressable, Text, View } from "react-native";

import Fuse from "fuse.js";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckIcon, ChevronsUpDownIcon, MinusIcon, SearchIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetFlatList,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetTextInput,
  useBottomSheet,
} from "@/components/ui/bottom-sheet";
import { Button, buttonTextVariants, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HEADER_HEIGHT = 100;

interface ComboboxOption {
  label?: string;
  value?: string;
}

const Combobox = React.forwardRef<
  React.ComponentRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "children"> & {
    items: ComboboxOption[];
    includeSearch?: boolean;
    placeholder?: string;
    inputProps?: React.ComponentPropsWithoutRef<typeof BottomSheetTextInput>;
    emptyText?: string;
    textClass?: string;
    selectedItems?: ComboboxOption[];
    onSelectedItemsChange?: (options: ComboboxOption[]) => void;
  }
>(
  (
    {
      className,
      textClass,
      variant = "outline",
      size = "sm",
      inputProps,
      placeholder,
      items,
      includeSearch = false,
      emptyText = "Nothing found...",
      selectedItems: selectedItemsProp,
      onSelectedItemsChange,
      ...props
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const [selectedItems, setSelectedItems] = React.useState<ComboboxOption[]>([]);
    const bottomSheet = useBottomSheet();
    const inputRef = React.useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);

    const filteredItems = React.useMemo(() => {
      if (!items) return [];
      if (!search) return items;

      const fuse = new Fuse(items, { keys: ["label"], threshold: 0.5 });
      return fuse.search(search).map((result) => result.item);
    }, [search, items]);

    function onItemToggle(listItem: ComboboxOption) {
      const current = selectedItemsProp ?? selectedItems;
      const isSelected = current.some((i) => i.value === listItem.value);
      const updated = isSelected
        ? current.filter((i) => i.value !== listItem.value)
        : [...current, listItem];

      if (onSelectedItemsChange) {
        onSelectedItemsChange(updated);
      } else {
        setSelectedItems(updated);
      }
    }

    const renderItem = React.useCallback(
      ({ item }: ListRenderItemInfo<unknown>) => {
        const listItem = item as ComboboxOption;
        const isSelected = (selectedItemsProp ?? selectedItems).some(
          (i) => i.value === listItem.value
        );
        return (
          <Button
            variant="ghost"
            size="unset"
            className={cn(
              "android:flex-1 flex-row items-center justify-between gap-2 p-2",
              isSelected && "bg-accent"
            )}
            onPress={() => onItemToggle(listItem)}>
            <View className="flex-1 flex-row">
              <Text className="text-lg text-foreground">{listItem.label}</Text>
            </View>
            {isSelected && (
              <CheckIcon
                size={24}
                className={"px-4 text-foreground"}
              />
            )}
          </Button>
        );
      },
      [selectedItems, selectedItemsProp]
    );

    const isAllSelected = (selectedItemsProp ?? selectedItems).length === items.length;
    const isSomeSelected = (selectedItemsProp ?? selectedItems).length > 0 && !isAllSelected;

    function handleIsAllSelected() {
      const newSelection = isAllSelected ? [] : items;
      if (onSelectedItemsChange) {
        onSelectedItemsChange(newSelection);
      } else {
        setSelectedItems(newSelection);
      }
    }

    function handleClear() {
      setSearch("");
      inputRef.current?.blur();
    }

    const selected = selectedItemsProp ?? selectedItems;
    const displayText =
      selected.length > 0 ? selected.map((i) => i.label).join(", ") : (placeholder ?? "");

    return (
      <BottomSheet>
        <BottomSheetOpenTrigger
          ref={ref}
          className={buttonVariants({
            variant,
            size,
            className: cn("native:h-14 h-12 w-full flex-row web:py-2", className),
          })}
          role="combobox"
          {...props}>
          <View className="flex-1 flex-row items-center justify-between">
            <Text
              className={buttonTextVariants({
                variant,
                size,
                className: cn("flex-1", textClass),
              })}
              numberOfLines={1}>
              {displayText}
            </Text>
            <ChevronsUpDownIcon className="ml-2 text-foreground opacity-50" />
          </View>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          ref={bottomSheet.ref}
          onDismiss={() => {
            setSearch("");
          }}>
          <BottomSheetHeader className="mb-2 border-b-0">
            <Text className="px-0.5 text-center text-xl font-bold text-foreground">
              {placeholder}
            </Text>
          </BottomSheetHeader>

          {includeSearch && (
            <View className="mb-8 flex-row gap-2 px-4">
              <View
                className={cn(
                  "flex-1 flex-row items-center gap-3 rounded-md border bg-background px-3",
                  isFocused ? "border-brand" : "border-input"
                )}>
                <Pressable onPress={() => inputRef.current?.blur()}>
                  <SearchIcon
                    className={cn(isFocused ? "text-foreground" : "text-brand-foreground")}
                    size={20}
                    strokeWidth={1.25}
                  />
                </Pressable>
                <Input
                  ref={inputRef}
                  className="native:text-xl flex-1 border-0 px-0 placeholder:text-muted-foreground"
                  role="searchbox"
                  value={search}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChangeText={setSearch}
                  returnKeyType="next"
                  clearButtonMode="while-editing"
                  placeholder="Search videos"
                />
                <Pressable onPress={handleClear}>
                  <XIcon
                    className={cn(search ? "text-foreground" : "text-muted-foreground")}
                    size={20}
                    strokeWidth={1.25}
                  />
                </Pressable>
              </View>
            </View>
          )}

          {items.length > 0 && (
            <Pressable
              className="mx-5 flex-row items-center gap-3"
              onPress={handleIsAllSelected}>
              <View
                className={cn(
                  "web:peer native:h-[20] native:w-[20] native:rounded h-4 w-4 shrink-0 rounded-sm border border-primary disabled:cursor-not-allowed disabled:opacity-50 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
                  isAllSelected || isSomeSelected ? "bg-primary" : ""
                )}>
                <View className="h-full w-full items-center justify-center">
                  {isAllSelected && (
                    <CheckIcon
                      size={12}
                      strokeWidth={3.5}
                      className="text-primary-foreground"
                    />
                  )}
                  {isSomeSelected && (
                    <MinusIcon
                      size={12}
                      strokeWidth={3.5}
                      className="text-primary-foreground"
                    />
                  )}
                </View>
              </View>
              <Text className="font-bold text-muted-foreground">Select all</Text>
            </Pressable>
          )}
          <BottomSheetFlatList
            data={filteredItems}
            contentContainerStyle={{
              paddingTop: insets.top / 2,
              paddingBottom: HEADER_HEIGHT / 2 + insets.bottom,
              gap: 6,
            }}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item as ComboboxOption)?.value ?? index.toString()}
            className="px-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => {
              return (
                <View className="flex-1 flex-row items-center justify-center px-4 py-6">
                  <Text className={"text-center text-xl text-muted-foreground"}>{emptyText}</Text>
                </View>
              );
            }}
          />
        </BottomSheetContent>
      </BottomSheet>
    );
  }
);

Combobox.displayName = "Combobox";

export { Combobox, type ComboboxOption };
