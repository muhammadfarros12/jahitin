"use client"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { cn } from "@/lib/utils"

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger

interface DropdownMenuContentProps extends MenuPrimitive.Popup.Props {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  alignOffset?: number
  sideOffset?: number
}

function DropdownMenuContent({ 
  className, 
  align = "start", 
  side = "bottom", 
  alignOffset = 0, 
  sideOffset = 5,
  children, 
  ...props 
}: DropdownMenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner 
        side={side}
        align={align}
        sideOffset={sideOffset} 
        alignOffset={alignOffset}
      >
        <MenuPrimitive.Popup
          className={cn(
            "z-50 min-w-[10rem] overflow-hidden rounded-xl border bg-card p-1.5 text-card-foreground shadow-md transition-all outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
