import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { cn, formatTimerInputDisplay, fromSeconds, toSeconds } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

interface TimerInputProps {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (seconds: number) => void;
}

type TextInputRef = React.ComponentRef<typeof TextInput>;

const TimerInput = forwardRef<TextInputRef, TimerInputProps>(
  ({ value, max, disabled, onChange, ...props }, ref) => {
    const [numericInput, setNumericInput] = useState(fromSeconds(value));
    const [isEditing, setIsEditing] = useState(false);

    const inputRef = useRef<TextInputRef | null>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    useEffect(() => {
      if (!isEditing) {
        setNumericInput(fromSeconds(value));
      }
    }, [value, isEditing]);

    function handleChange(input: string) {
      if (disabled) return;

      setIsEditing(true);
      const cleanInput = input.replace(/\D/g, "");

      if (!cleanInput) {
        setNumericInput("0");
        onChange(0);
        return;
      }
      const seconds = toSeconds(cleanInput);

      if (seconds > max) {
        setNumericInput(fromSeconds(max));
        onChange(max);
      } else {
        setNumericInput(cleanInput);
        onChange(seconds);
      }
    }

    function handleBlur() {
      setIsEditing(false);
      inputRef.current?.blur();
    }

    return (
      <Pressable
        onPress={() => !disabled && inputRef?.current?.focus()}
        onBlur={handleBlur}>
        <View
          className={cn(
            "native:h-12 h-10 flex-row items-center justify-between rounded-md border border-input web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
            isEditing && "border-brand"
          )}>
          <Input
            readOnly
            className={cn(
              "flex-1 border-0 px-3 web:py-2",
              isEditing ? "text-brand" : disabled ? "text-muted-foreground" : "text-foreground"
            )}
            style={{ height: "auto" }}
            value={formatTimerInputDisplay(numericInput)}
            onBlur={handleBlur}
          />

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
            {...props}
          />

          <Text
            className={cn(
              "native:text-lg px-3 web:py-2",
              isEditing ? "text-foreground" : "text-muted-foreground"
            )}>
            {formatTimerInputDisplay(fromSeconds(max))}
          </Text>
        </View>
      </Pressable>
    );
  }
);

export default TimerInput;
