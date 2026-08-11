import * as React from "react";

import type { LucideProps } from "lucide-react-native";
import { cssInterop } from "nativewind";

import { cn } from "@/lib/utils";

import { TextClassContext } from "@/components/ui/text";

type IconProps = LucideProps & {
  as: React.ComponentType<LucideProps>;
};

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />;
}

cssInterop(IconImpl, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: "size",
      width: "size",
    },
  },
});

function Icon({ as: IconComponent, className, size = 14, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <IconImpl
      as={IconComponent}
      className={cn("text-foreground", textClass, className)}
      size={size}
      {...props}
    />
  );
}

export { Icon };
