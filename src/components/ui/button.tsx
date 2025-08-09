import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hermes-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 min-h-[56px] touch-target-large",
  {
    variants: {
      variant: {
        default: "bg-hermes-gradient text-white shadow-lg hover:shadow-xl",
        secondary: "bg-white text-hermes-orange border-2 border-hermes-orange hover:bg-hermes-orange/5",
        outline: "border border-old-money-gray text-old-money-gray hover:bg-old-money-gray/5",
        ghost: "hover:bg-hermes-orange/10 text-hermes-orange",
        premium: "bg-premium-gradient text-white shadow-lg hover:shadow-xl",
      },
      size: {
        default: "px-6 py-4",
        sm: "px-4 py-3 text-sm min-h-[44px]",
        lg: "px-8 py-5 text-lg min-h-[64px]",
        icon: "h-12 w-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }