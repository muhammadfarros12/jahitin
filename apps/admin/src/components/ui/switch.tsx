"use client"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "bg-secondary/20 h-5 w-9 rounded-full relative cursor-pointer outline-none transition-colors inline-flex shrink-0 items-center",
        "data-[checked]:bg-primary shadow-inner",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "bg-white h-4 w-4 rounded-full transition-transform duration-150 inline-block",
          "data-[checked]:translate-x-4.5 translate-x-0.5 shadow-sm"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
