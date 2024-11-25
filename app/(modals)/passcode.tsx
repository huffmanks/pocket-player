import { View } from "react-native";

import CreatePasscodeForm from "@/components/forms/create-passcode";

export default function PasscodeModal() {
  return (
    <View className="px-5 pt-4">
      <CreatePasscodeForm />
    </View>
  );
}
