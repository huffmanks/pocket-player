import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type Props = {
  value: number;
  max: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

export default function TimerInput({ value, max, onChange, disabled }: Props) {
  const [numericInput, setNumericInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isOverMax, setIsOverMax] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Format numeric input to display format (hh:mm:ss:MMM)
  const formatDisplay = (input: string) => {
    if (!input) return "";

    const digits = input.padStart(7, "0");
    const ms = digits.slice(-3);
    const s = digits.slice(-5, -3);
    const m = digits.length > 5 ? digits.slice(-7, -5) : "";
    const h = digits.length > 7 ? digits.slice(0, -7) : "";

    const parts = [];
    if (h) parts.push(h);
    if (m || h) parts.push(m || "00");
    parts.push(s);
    parts.push(ms);

    return parts.join(":");
  };

  // Convert numeric input to seconds
  const toSeconds = (input: string) => {
    if (!input) return 0;

    const digits = input.padStart(7, "0");
    const ms = parseInt(digits.slice(-3)) / 1000;
    const s = parseInt(digits.slice(-5, -3));
    const m = digits.length > 5 ? parseInt(digits.slice(-7, -5)) : 0;
    const h = digits.length > 7 ? parseInt(digits.slice(0, -7)) : 0;

    return h * 3600 + m * 60 + s + ms;
  };

  // Convert seconds to numeric input
  const fromSeconds = (seconds: number) => {
    if (seconds === 0) return "";

    const totalMs = Math.floor(seconds * 1000);
    const ms = totalMs % 1000;
    const s = Math.floor(totalMs / 1000) % 60;
    const m = Math.floor(totalMs / 60000) % 60;
    const h = Math.floor(totalMs / 3600000);

    let result = ms.toString().padStart(3, "0");
    result = s.toString().padStart(2, "0") + result;

    if (m > 0 || h > 0) {
      result = m.toString().padStart(2, "0") + result;
    }

    if (h > 0) {
      result = h.toString() + result;
    }

    return result;
  };

  // Update numeric input when value changes
  useEffect(() => {
    if (!isEditing) {
      setNumericInput(fromSeconds(value));
      setIsOverMax(false);
    }
  }, [value, isEditing]);

  const handleChange = (input: string) => {
    if (disabled) return;

    // Only allow numeric input
    const cleanInput = input.replace(/\D/g, "");
    setNumericInput(cleanInput);
    setIsEditing(true);

    if (!cleanInput) {
      setIsOverMax(false);
      onChange(0);
      return;
    }

    const seconds = toSeconds(cleanInput);

    if (seconds > max) {
      setIsOverMax(true);
    } else {
      setIsOverMax(false);
      onChange(seconds);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);

    if (!numericInput) {
      onChange(0);
      setIsOverMax(false);
      return;
    }

    let seconds = toSeconds(numericInput);
    if (seconds > max) {
      seconds = max;
      setNumericInput(fromSeconds(max));
      setIsOverMax(false);
      onChange(max);
    }
  };

  return (
    <Pressable onPress={() => !disabled && inputRef.current?.focus()}>
      <View
        className={cn(
          "flex-row items-center rounded-md px-2 py-1",
          isOverMax && "border border-red-500"
        )}>
        <Text className={cn("font-mono text-base", isOverMax && "text-red-500")}>
          {formatDisplay(numericInput)}
        </Text>

        <Input
          ref={inputRef}
          className="absolute h-full w-full opacity-0"
          keyboardType="number-pad"
          value={numericInput}
          onChangeText={handleChange}
          onBlur={handleBlur}
          onFocus={() => setIsEditing(true)}
          selectTextOnFocus={true}
          editable={!disabled}
        />
      </View>
    </Pressable>
  );
}
