import { View } from "react-native";

import CreatePasscodeForm from "@/components/forms/create-passcode";

export default function PasscodeModal() {
  return (
    <View className="mx-auto mb-8 w-full max-w-md flex-1 px-4 py-8">
      <CreatePasscodeForm />
    </View>
  );
}
