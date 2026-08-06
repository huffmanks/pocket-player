import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, KeyRoundIcon, LockIcon } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { useSecurityStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const formSchema = z
  .object({
    passcode: z.string().regex(/^\d{4}$/, { message: "Passcode must be exactly 4 digits." }),
    confirmPasscode: z
      .string()
      .regex(/^\d{4}$/, { message: "Confirm passcode must be exactly 4 digits." }),
  })
  .refine((data) => data.passcode === data.confirmPasscode, {
    message: "Passcodes don't match.",
    path: ["confirmPasscode"],
  });

export type CreatePasscodeFormData = z.infer<typeof formSchema>;

export default function CreatePasscodeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hidePasscode, setHidePasscode] = useState(true);
  const [hideConfirmPasscode, setHideConfirmPasscode] = useState(true);

  const setPasscode = useSecurityStore((state) => state.setPasscode);

  const form = useForm<CreatePasscodeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passcode: "",
      confirmPasscode: "",
    },
  });

  async function onSubmit(values: CreatePasscodeFormData) {
    try {
      setIsSubmitting(true);
      const parsedValues = formSchema.parse(values);

      setPasscode(parsedValues.passcode);

      toast.success("Passcode set successfully!");

      router.dismissTo("/(tabs)/settings");
    } catch (_error) {
      toast.error("Error setting passcode");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <View className="mb-12 gap-7">
        <FormField
          control={form.control}
          name="passcode"
          render={({ field }) => (
            <View className="relative">
              <View className="absolute left-3 top-[34px] z-10 py-2">
                <Icon
                  as={LockIcon}
                  className="text-muted-foreground"
                  size={20}
                  strokeWidth={1.25}
                />
              </View>
              <FormInput
                className="pl-12 pr-16"
                label="Passcode"
                secureTextEntry={hidePasscode}
                autoFocus={false}
                selectTextOnFocus={true}
                keyboardType="numeric"
                autoCapitalize="none"
                maxLength={4}
                onChangeText={(value) => {
                  field.onChange(value);
                  if (value.length === 4) {
                    form.setFocus("confirmPasscode");
                  }
                }}
                {...field}
              />
              <Pressable
                onPress={() => setHidePasscode((prev) => !prev)}
                className="absolute right-4 top-[34px] py-2">
                {hidePasscode ? (
                  <Icon
                    as={EyeOffIcon}
                    className="text-muted-foreground"
                    size={20}
                    strokeWidth={1.25}
                  />
                ) : (
                  <Icon
                    as={EyeIcon}
                    className="text-foreground"
                    size={20}
                    strokeWidth={1.25}
                  />
                )}
              </Pressable>
            </View>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPasscode"
          render={({ field }) => (
            <View className="relative">
              <View className="absolute left-3 top-[34px] z-10 py-2">
                <Icon
                  as={LockIcon}
                  className="text-muted-foreground"
                  size={20}
                  strokeWidth={1.25}
                />
              </View>
              <FormInput
                className="pl-12 pr-16"
                label="Confirm passcode"
                secureTextEntry={hideConfirmPasscode}
                autoFocus={false}
                selectTextOnFocus={true}
                keyboardType="numeric"
                autoCapitalize="none"
                maxLength={4}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && field.value === "") {
                    form.setFocus("passcode");
                  }
                }}
                {...field}
              />
              <Pressable
                onPress={() => setHideConfirmPasscode((prev) => !prev)}
                className="absolute right-4 top-[34px] py-2">
                {hideConfirmPasscode ? (
                  <Icon
                    as={EyeOffIcon}
                    className="text-muted-foreground"
                    size={20}
                    strokeWidth={1.25}
                  />
                ) : (
                  <Icon
                    as={EyeIcon}
                    className="text-foreground"
                    size={20}
                    strokeWidth={1.25}
                  />
                )}
              </Pressable>
            </View>
          )}
        />
      </View>

      <View>
        <Button
          disabled={isSubmitting}
          variant="brand"
          size="lg"
          onPress={form.handleSubmit(onSubmit)}>
          <View className="flex-row items-center gap-2">
            <Icon
              as={KeyRoundIcon}
              className="text-white"
              size={20}
              strokeWidth={1.5}
            />
            <Text className="native:text-base font-semibold uppercase tracking-wider">
              Set passcode
            </Text>
          </View>
        </Button>
      </View>
    </Form>
  );
}
