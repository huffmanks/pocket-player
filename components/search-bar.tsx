import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import {
  ArrowDownAZIcon,
  ArrowUpZAIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  SearchIcon,
  XIcon,
} from "@/lib/icons";
import { useSettingsStore } from "@/lib/store";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleSortDate: () => void;
  handleSortTitle: () => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  handleSortDate,
  handleSortTitle,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { sortDateOrder, sortTitleOrder } = useSettingsStore(
    useShallow((state) => ({
      sortDateOrder: state.sortDateOrder,
      sortTitleOrder: state.sortTitleOrder,
    }))
  );

  function handleClear() {
    setSearchQuery("");
    inputRef.current?.blur();
  }

  return (
    <View className="mb-4 flex-row gap-2">
      <View
        className={cn(
          "ml-2 flex-1 flex-row items-center gap-3 rounded-md border px-3",
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
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={setSearchQuery}
          placeholder="Search videos"
        />
        <Pressable onPress={handleClear}>
          <XIcon
            className={cn(searchQuery ? "text-foreground" : "text-muted-foreground")}
            size={20}
            strokeWidth={1.25}
          />
        </Pressable>
      </View>
      <View className="mr-2 flex-row gap-2">
        <Button
          className="px-3"
          style={{ height: 44 }}
          variant="outline"
          size="unset"
          onPress={handleSortTitle}>
          {sortTitleOrder === "asc" ? (
            <ArrowDownAZIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
          ) : (
            <ArrowUpZAIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
          )}
        </Button>
        <Button
          className="px-3"
          style={{ height: 44 }}
          variant="outline"
          size="unset"
          onPress={handleSortDate}>
          {sortDateOrder === "asc" ? (
            <CalendarArrowDownIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
          ) : (
            <CalendarArrowUpIcon
              className="text-foreground"
              size={20}
              strokeWidth={1.25}
            />
          )}
        </Button>
      </View>
    </View>
  );
}
