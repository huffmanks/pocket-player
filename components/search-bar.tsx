import { View } from "react-native";

import { useShallow } from "zustand/react/shallow";

import {
  ArrowDownAZIcon,
  ArrowUpZAIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  SearchIcon,
} from "@/lib/icons";
import { useSettingsStore } from "@/lib/store";

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
  const { sortDateOrder, sortTitleOrder } = useSettingsStore(
    useShallow((state) => ({
      sortDateOrder: state.sortDateOrder,
      sortTitleOrder: state.sortTitleOrder,
    }))
  );

  return (
    <View className="mb-4 flex-row gap-2">
      <View className="ml-2 flex-1 flex-row items-center gap-4 rounded-md border border-input px-3">
        <SearchIcon
          className="text-muted-foreground"
          size={20}
          strokeWidth={1.25}
        />
        <Input
          className="border-0 px-0 placeholder:text-muted-foreground"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search videos"
        />
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
