import { router } from "expo-router";
import { useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollToTop } from "@react-navigation/native";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner-native";
import * as z from "zod";

import { EyeIcon, EyeOffIcon, KeyRoundIcon } from "@/lib/icons";
import { useSecurityStore } from "@/lib/store";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";

const formSchema = z
  .object({
    passcode: z.string().regex(/^\d{4}$/, { message: "Passcode must be exactly 4 digits." }),
    hidePasscode: z.boolean(),
    confirmPasscode: z
      .string()
      .regex(/^\d{4}$/, { message: "Confirm passcode must be exactly 4 digits." }),
    hideConfirmPasscode: z.boolean(),
  })
  .refine((data) => data.passcode === data.confirmPasscode, {
    message: "Passcodes don't match.",
    path: ["confirmPasscode"],
  });

export type CreatePasscodeFormData = z.infer<typeof formSchema>;

export default function CreatePasscodeForm() {
  const setPasscode = useSecurityStore((state) => state.setPasscode);
  const ref = useRef(null);
  useScrollToTop(ref);

  const form = useForm<CreatePasscodeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passcode: "",
      hidePasscode: true,
      confirmPasscode: "",
      hideConfirmPasscode: true,
    },
  });

  const hidePasscode = form.watch("hidePasscode");
  const hideConfirmPasscode = form.watch("hideConfirmPasscode");

  function togglePasscodeVisibility(field: "hidePasscode" | "hideConfirmPasscode") {
    form.setValue(field, !form.watch(field));
  }

  async function onSubmit(values: CreatePasscodeFormData) {
    try {
      const parsedValues = formSchema.parse(values);

      setPasscode(parsedValues.passcode);

      toast.success("Passcode set successfully!");

      if (router.canDismiss()) {
        router.dismissAll();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error setting passcode");
    }
  }

  function handleErrors(errors: FieldErrors<CreatePasscodeFormData>) {
    const errorMessage = errors?.passcode?.root?.message ? errors.passcode.root.message : undefined;

    if (errorMessage) {
      toast.error(errorMessage);
    }
  }

  return (
    <View className="relative h-full">
      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-lg pt-2 px-1 pb-5"
        showsVerticalScrollIndicator={true}
        className="bg-background"
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 12 }}>
        <View className="mx-auto mb-8 min-h-1 w-full max-w-md">
          <Form {...form}>
            <View className="mb-12">
              <View className="flex-1 gap-7">
                <FormField
                  control={form.control}
                  name="passcode"
                  render={({ field }) => (
                    <View className="relative">
                      <FormInput
                        label="Passcode"
                        secureTextEntry={hidePasscode}
                        autoFocus={false}
                        selectTextOnFocus={true}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        {...field}
                      />
                      <Pressable
                        onPress={() => togglePasscodeVisibility("hidePasscode")}
                        className="absolute right-3 top-11">
                        {hidePasscode ? (
                          <EyeOffIcon
                            className="text-muted-foreground"
                            size={24}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <EyeIcon
                            className="text-muted-foreground"
                            size={24}
                            strokeWidth={1.5}
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
                      <FormInput
                        label="Confirm passcode"
                        secureTextEntry={hideConfirmPasscode}
                        autoFocus={false}
                        selectTextOnFocus={true}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        {...field}
                      />
                      <Pressable
                        onPress={() => togglePasscodeVisibility("hideConfirmPasscode")}
                        className="absolute right-3 top-11">
                        {hideConfirmPasscode ? (
                          <EyeOffIcon
                            className="text-muted-foreground"
                            size={24}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <EyeIcon
                            className="text-muted-foreground"
                            size={24}
                            strokeWidth={1.5}
                          />
                        )}
                      </Pressable>
                    </View>
                  )}
                />
              </View>
            </View>
            <View>
              <Button
                className="bg-teal-600"
                size="lg"
                onPress={form.handleSubmit(onSubmit, handleErrors)}>
                <View className="flex-row items-center gap-4">
                  <KeyRoundIcon
                    className="text-white"
                    size={28}
                    strokeWidth={1.25}
                  />
                  <Text className="native:text-base text-white">Set passcode</Text>
                </View>
              </Button>
            </View>
          </Form>
        </View>
      </ScrollView>
    </View>
  );
}
