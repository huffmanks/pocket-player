import * as React from "react";
import { ListRenderItemInfo, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "@/lib/icons";
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

const HEADER_HEIGHT = 130;

interface ComboboxOption {
  label?: string;
  value?: string;
}

const Combobox = React.forwardRef<
  React.ElementRef<typeof Button>,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "children"> & {
    items: ComboboxOption[];
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
      emptyText = "Nothing found...",
      selectedItems: selectedItemsProp,
      onSelectedItemsChange,
      ...props
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = React.useState("");
    const [selectedItems, setSelectedItems] = React.useState<ComboboxOption[]>([]);
    const bottomSheet = useBottomSheet();
    const inputRef = React.useRef<React.ComponentRef<typeof BottomSheetTextInput>>(null);

    const listItems = React.useMemo(() => {
      return search
        ? items.filter((item) => {
            return item.label?.toLocaleLowerCase().includes(search.toLocaleLowerCase());
          })
        : items;
    }, [items, search]);

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

      setSearch("");
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
            className="android:flex-1 flex-row items-center justify-between gap-2 p-2"
            onPress={() => onItemToggle(listItem)}>
            <View className="flex-1 flex-row">
              <Text className={"text-lg text-foreground"}>{listItem.label}</Text>
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

    function onSubmitEditing() {
      const firstItem = listItems[0];
      if (!firstItem) return;
      if (onSelectedItemsChange) {
        onSelectedItemsChange([firstItem]);
      } else {
        setSelectedItems([firstItem]);
      }
      bottomSheet.close();
    }

    function onSearchIconPress() {
      if (!inputRef.current) return;
      const input = inputRef.current;
      if (input && "focus" in input && typeof input.focus === "function") {
        input.focus();
      }
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
                className: cn("-mr-3", textClass),
              })}
              numberOfLines={1}>
              {displayText}
            </Text>
            <ChevronsUpDownIcon className="ml-3 text-foreground opacity-50" />
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
          <View className="relative mb-4 border-b border-border px-4 pb-6">
            <BottomSheetTextInput
              role="searchbox"
              ref={inputRef}
              className="pl-12"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSubmitEditing}
              returnKeyType="next"
              clearButtonMode="while-editing"
              placeholder="Search..."
              {...inputProps}
            />
            <Button
              variant={"ghost"}
              size="sm"
              className="absolute left-4 top-2.5"
              onPress={onSearchIconPress}>
              <SearchIcon
                size={18}
                className="text-foreground opacity-50"
              />
            </Button>
          </View>
          <BottomSheetFlatList
            data={listItems}
            contentContainerStyle={{
              paddingBottom: insets.bottom + HEADER_HEIGHT,
              gap: 6,
            }}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item as ComboboxOption)?.value ?? index.toString()}
            className={"px-4"}
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
