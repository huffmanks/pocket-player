import * as React from "react";
import { Pressable, View } from "react-native";

import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  Noop,
  useFormContext,
} from "react-hook-form";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";

import { CalendarIcon } from "@/lib/icons";
import { cn, formatDateString } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { type Option, Select } from "@/components/ui/select";
import { Switch, SwitchProps } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState, handleSubmit } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { nativeID } = itemContext;

  return {
    nativeID,
    name: fieldContext.name,
    formItemNativeID: `${nativeID}-form-item`,
    formDescriptionNativeID: `${nativeID}-form-item-description`,
    formMessageNativeID: `${nativeID}-form-item-message`,
    handleSubmit,
    ...fieldState,
  };
};

type FormItemContextValue = {
  nativeID: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<
  React.ComponentRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
  const nativeID = React.useId();

  return (
    <FormItemContext.Provider value={{ nativeID }}>
      <View
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  Omit<React.ComponentPropsWithoutRef<typeof Label>, "children"> & {
    children: string;
  }
>(({ className, nativeID: _nativeID, ...props }, ref) => {
  const { error, formItemNativeID } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn("native:pb-2 px-px pb-1", className)}
      nativeID={formItemNativeID}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormDescription = React.forwardRef<
  React.ComponentRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
  const { formDescriptionNativeID } = useFormField();

  return (
    <Text
      ref={ref}
      nativeID={formDescriptionNativeID}
      className={cn("ml-4 pt-3 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  React.ComponentRef<typeof Animated.Text>,
  React.ComponentPropsWithoutRef<typeof Animated.Text>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageNativeID } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <Animated.Text
      entering={FadeInDown}
      exiting={FadeOut.duration(275)}
      ref={ref}
      nativeID={formMessageNativeID}
      className={cn("ml-0.5 pt-3 text-sm font-medium text-destructive", className)}
      {...props}>
      {body}
    </Animated.Text>
  );
});
FormMessage.displayName = "FormMessage";

type Override<T, U> = Omit<T, keyof U> & U;

interface FormFieldFieldProps<T> {
  name: string;
  onBlur: Noop;
  onChange: (val: T) => void;
  value: T;
  disabled?: boolean;
}

type FormItemProps<T extends React.ElementType<any>, U> = Override<
  React.ComponentPropsWithoutRef<T>,
  FormFieldFieldProps<U>
> & {
  label?: string;
  description?: string;
};

const FormDateTimePicker = React.forwardRef<any, FormItemProps<typeof DateTimePicker, Date>>(
  ({ label, description, value, onChange }, ref) => {
    const [show, setShow] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(formatDateString(value));
    const [isInvalid, setIsInvalid] = React.useState(false);
    const [isTouched, setIsTouched] = React.useState(false);
    const [isInternalChange, setIsInternalChange] = React.useState(false);
    const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } =
      useFormField();

    React.useEffect(() => {
      if (isInternalChange) {
        setIsInternalChange(false);
        return;
      }

      setInputValue(formatDateString(value));
      setIsInvalid(false);
      setIsTouched(false);
    }, [value]);

    function validateDate(val: string) {
      if (val.trim() === "") {
        return true;
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(val)) {
        return false;
      }

      const parsedDate = new Date(val);
      return !isNaN(parsedDate.getTime());
    }

    function handleInputChange(val: string) {
      setInputValue(val);

      if (validateDate(val) && val.trim() !== "") {
        const [year, month, day] = val.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);

        setIsInternalChange(true);
        onChange(parsedDate);
      }
    }

    function handleBlur() {
      setIsTouched(true);
      setIsInvalid(!validateDate(inputValue));
    }

    function handleChange(_e: DateTimePickerEvent, selectedDate?: Date) {
      setShow(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    }

    function showDatepicker() {
      setShow(true);
    }

    return (
      <FormItem>
        {!!label && (
          <FormLabel
            nativeID={formItemNativeID}
            className="native:text-lg">
            {label}
          </FormLabel>
        )}

        <View
          className={cn(
            "native:h-12 h-10 flex-row items-center justify-between rounded-md border border-input web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
            isInvalid && isTouched && "border-red-500"
          )}>
          <Input
            ref={ref}
            className={cn(
              "flex-1 border-0 px-3 web:py-2",
              isInvalid && isTouched && "text-destructive"
            )}
            style={{ height: "auto" }}
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleBlur}
          />

          <View className="px-1">
            <Button
              variant="ghost"
              size="icon"
              onPress={showDatepicker}>
              <CalendarIcon
                className={cn(
                  isInvalid && isTouched ? "text-destructive" : "text-brand-foreground"
                )}
                size={24}
                strokeWidth={1.5}
              />
            </Button>
          </View>
        </View>

        {show && (
          <DateTimePicker
            aria-labelledby={formItemNativeID}
            aria-describedby={
              !error
                ? `${formDescriptionNativeID}`
                : `${formDescriptionNativeID} ${formMessageNativeID}`
            }
            aria-invalid={!!error || isInvalid}
            value={value}
            mode="date"
            onChange={handleChange}
          />
        )}

        {!!description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);

FormDateTimePicker.displayName = "FormDateTimePicker";

const FormInput = React.forwardRef<
  React.ComponentRef<typeof Input>,
  FormItemProps<typeof Input, string>
>(({ label, description, onChange, ...props }, ref) => {
  const inputRef = React.useRef<React.ComponentRef<typeof Input>>(null);
  const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } = useFormField();

  React.useImperativeHandle(ref, () => {
    if (!inputRef.current) {
      return {} as React.ComponentRef<typeof Input>;
    }
    return inputRef.current;
  }, [inputRef]);

  function handleOnLabelPress() {
    if (!inputRef.current) {
      return;
    }
    if (inputRef.current.isFocused()) {
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
    }
  }

  return (
    <FormItem>
      {!!label && (
        <FormLabel
          className="native:text-lg"
          nativeID={formItemNativeID}
          onPress={handleOnLabelPress}>
          {label}
        </FormLabel>
      )}

      <Input
        ref={inputRef}
        aria-labelledby={formItemNativeID}
        aria-describedby={
          !error
            ? `${formDescriptionNativeID}`
            : `${formDescriptionNativeID} ${formMessageNativeID}`
        }
        aria-invalid={!!error}
        onChangeText={onChange}
        {...props}
      />
      {!!description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
});

FormInput.displayName = "FormInput";

const FormTextarea = React.forwardRef<
  React.ComponentRef<typeof Textarea>,
  FormItemProps<typeof Textarea, string>
>(({ label, description, onChange, ...props }, ref) => {
  const textareaRef = React.useRef<React.ComponentRef<typeof Textarea>>(null);
  const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } = useFormField();

  React.useImperativeHandle(ref, () => {
    if (!textareaRef.current) {
      return {} as React.ComponentRef<typeof Textarea>;
    }
    return textareaRef.current;
  }, [textareaRef]);

  function handleOnLabelPress() {
    if (!textareaRef.current) {
      return;
    }
    if (textareaRef.current.isFocused()) {
      textareaRef.current?.blur();
    } else {
      textareaRef.current?.focus();
    }
  }

  return (
    <FormItem>
      {!!label && (
        <FormLabel
          nativeID={formItemNativeID}
          className="native:text-lg"
          onPress={handleOnLabelPress}>
          {label}
        </FormLabel>
      )}

      <Textarea
        ref={textareaRef}
        aria-labelledby={formItemNativeID}
        aria-describedby={
          !error
            ? `${formDescriptionNativeID}`
            : `${formDescriptionNativeID} ${formMessageNativeID}`
        }
        aria-invalid={!!error}
        onChangeText={onChange}
        {...props}
      />
      {!!description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
});

FormTextarea.displayName = "FormTextarea";

const FormCheckbox = React.forwardRef<
  React.ComponentRef<typeof Checkbox>,
  Omit<FormItemProps<typeof Checkbox, boolean>, "checked" | "onCheckedChange">
>(({ label, description, value, onChange, ...props }, ref) => {
  const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } = useFormField();

  function handleOnLabelPress() {
    onChange?.(!value);
  }

  return (
    <FormItem className="flex flex-1 px-1">
      <View className="flex flex-1">
        <Pressable
          onPress={handleOnLabelPress}
          className="flex flex-1 flex-row items-center gap-4">
          <Checkbox
            ref={ref}
            aria-labelledby={formItemNativeID}
            aria-describedby={
              !error
                ? `${formDescriptionNativeID}`
                : `${formDescriptionNativeID} ${formMessageNativeID}`
            }
            aria-invalid={!!error}
            onCheckedChange={onChange}
            checked={value}
            {...props}
          />
          {!!label && (
            <FormLabel
              numberOfLines={1}
              className="native:pb-0"
              nativeID={formItemNativeID}>
              {label}
            </FormLabel>
          )}
        </Pressable>
      </View>
      {!!description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
});

FormCheckbox.displayName = "FormCheckbox";

const FormRadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroup>,
  Omit<FormItemProps<typeof RadioGroup, string>, "onValueChange">
>(({ label, description, value, onChange, ...props }, ref) => {
  const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } = useFormField();

  return (
    <FormItem className="gap-3">
      <View>
        {!!label && <FormLabel nativeID={formItemNativeID}>{label}</FormLabel>}
        {!!description && <FormDescription className="pt-0">{description}</FormDescription>}
      </View>
      <RadioGroup
        ref={ref}
        aria-labelledby={formItemNativeID}
        aria-describedby={
          !error
            ? `${formDescriptionNativeID}`
            : `${formDescriptionNativeID} ${formMessageNativeID}`
        }
        aria-invalid={!!error}
        onValueChange={onChange}
        value={value}
        {...props}
      />

      <FormMessage />
    </FormItem>
  );
});

FormRadioGroup.displayName = "FormRadioGroup";

const FormCombobox = React.forwardRef<
  React.ComponentRef<typeof Combobox>,
  FormItemProps<typeof Combobox, ComboboxOption[]>
>(({ label, description, placeholder, value, onChange, ...props }, ref) => {
  const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } = useFormField();

  return (
    <FormItem>
      {!!label && (
        <FormLabel
          nativeID={formItemNativeID}
          className="native:text-lg">
          {label}
        </FormLabel>
      )}
      <Combobox
        ref={ref}
        placeholder={placeholder || `Select ${label}`}
        aria-labelledby={formItemNativeID}
        aria-describedby={
          !error
            ? `${formDescriptionNativeID}`
            : `${formDescriptionNativeID} ${formMessageNativeID}`
        }
        aria-invalid={!!error}
        selectedItems={value}
        onSelectedItemsChange={onChange}
        {...props}
      />
      {!!description && !error && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
});

FormCombobox.displayName = "FormCombobox";

type FormSelectProps = {
  label?: string;
  description?: string;
  onChange: (val: Partial<Option>) => void;
  value: Option | undefined;
  disabled?: boolean;
  children?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
};

const FormSelect = React.forwardRef<React.ComponentRef<typeof Select>, FormSelectProps>(
  ({ label, description, onChange, value, ...props }, ref) => {
    const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } =
      useFormField();

    return (
      <FormItem>
        {!!label && (
          <FormLabel
            nativeID={formItemNativeID}
            className="native:text-lg">
            {label}
          </FormLabel>
        )}
        <Select
          ref={ref}
          aria-labelledby={formItemNativeID}
          aria-describedby={
            !error
              ? `${formDescriptionNativeID}`
              : `${formDescriptionNativeID} ${formMessageNativeID}`
          }
          aria-invalid={!!error}
          value={value}
          onValueChange={onChange}
          {...props}
        />
        {!!description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);

FormSelect.displayName = "FormSelect";

type FormSwitchProps = Omit<FormItemProps<typeof Switch, boolean>, "checked" | "onCheckedChange"> &
  Pick<SwitchProps, "size">;

const FormSwitch = React.forwardRef<React.ComponentRef<typeof Switch>, FormSwitchProps>(
  ({ label, description, value, size = "lg", onChange, ...props }, ref) => {
    const switchRef = React.useRef<React.ComponentRef<typeof Switch>>(null);
    const { error, formItemNativeID, formDescriptionNativeID, formMessageNativeID } =
      useFormField();

    React.useImperativeHandle(ref, () => {
      if (!switchRef.current) {
        return {} as React.ComponentRef<typeof Switch>;
      }
      return switchRef.current;
    }, [switchRef]);

    function handleOnLabelPress() {
      onChange?.(!value);
    }

    return (
      <FormItem className="px-1">
        <View className="flex-row items-center gap-4">
          <Switch
            ref={switchRef}
            aria-labelledby={formItemNativeID}
            aria-describedby={
              !error
                ? `${formDescriptionNativeID}`
                : `${formDescriptionNativeID} ${formMessageNativeID}`
            }
            aria-invalid={!!error}
            size={size}
            onCheckedChange={onChange}
            checked={value}
            {...props}
          />
          {!!label && (
            <FormLabel
              className="native:text-lg"
              style={{ paddingBottom: 0 }}
              nativeID={formItemNativeID}
              onPress={handleOnLabelPress}>
              {label}
            </FormLabel>
          )}
        </View>
        {!!description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    );
  }
);

FormSwitch.displayName = "FormSwitch";

export {
  Form,
  FormCheckbox,
  FormCombobox,
  FormDateTimePicker,
  FormDescription,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormRadioGroup,
  FormSelect,
  FormSwitch,
  FormTextarea,
  useFormField,
};
