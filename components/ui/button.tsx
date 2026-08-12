import { Platform, Pressable } from "react-native";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { TextClassContext } from "@/components/ui/text";

const buttonVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none",
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-foreground active:bg-foreground/90 shadow-sm shadow-black/5",
          Platform.select({ web: "hover:bg-foreground/90" })
        ),
        brand: cn(
          "bg-brand active:bg-brand/90 shadow-sm shadow-black/5",
          Platform.select({ web: "hover:bg-brand/90" })
        ),
        destructive: cn(
          "bg-destructive active:bg-destructive/90 dark:bg-destructive dark:active:bg-destructive/80 shadow-sm shadow-black/5",
          Platform.select({
            web: "hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          })
        ),
        outline: cn(
          "border-border bg-background active:bg-accent dark:border-input dark:active:bg-input/50 border shadow-sm shadow-black/5",
          Platform.select({
            web: "hover:bg-accent dark:hover:bg-input/50",
          })
        ),
        secondary: cn(
          "bg-secondary active:bg-secondary/80 shadow-sm shadow-black/5",
          Platform.select({ web: "hover:bg-secondary/80" })
        ),
        ghost: cn(
          "active:bg-accent dark:active:bg-accent/50",
          Platform.select({ web: "hover:bg-accent dark:hover:bg-accent/50" })
        ),
        link: "",
      },
      size: {
        default: cn("h-10 px-4 py-2", Platform.select({ web: "h-12 px-5 py-3 has-[>svg]:px-3" })),
        sm: cn("h-9 gap-1.5 rounded-md px-3", Platform.select({ web: "has-[>svg]:px-2.5" })),
        lg: cn("h-11 rounded-md px-8", Platform.select({ web: "h-14 has-[>svg]:px-4" })),
        icon: "h-10 w-10",
        circle: "rounded-full p-2 w-12 h-12",
        unset: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva(
  cn(
    "text-foreground text-sm font-medium",
    Platform.select({ web: "pointer-events-none transition-colors" })
  ),
  {
    variants: {
      variant: {
        default: "text-background",
        brand: "text-white",
        destructive: "text-destructive-foreground",
        outline: cn(
          "group-active:text-accent-foreground",
          Platform.select({ web: "group-hover:text-accent-foreground" })
        ),
        secondary: "text-secondary-foreground",
        ghost: "group-active:text-accent-foreground",
        link: cn(
          "text-primary group-active:underline",
          Platform.select({ web: "underline-offset-4 hover:underline group-hover:underline" })
        ),
      },
      size: {
        default: "",
        sm: "",
        lg: "",
        icon: "",
        unset: "",
        circle: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={cn(buttonTextVariants({ variant, size }))}>
      <Pressable
        className={cn(props.disabled && "opacity-75", buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
