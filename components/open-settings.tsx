import { Link } from "expo-router";

import { SettingsIcon } from "@/lib/icons";

import { Button } from "@/components/ui/button";

export default function OpenSettings() {
  return (
    <Link
      href="/(modals)/settings"
      asChild>
      <Button
        variant="ghost"
        size="icon">
        <SettingsIcon
          className="text-teal-500"
          size={28}
          strokeWidth={1.25}
        />
      </Button>
    </Link>
  );
}
