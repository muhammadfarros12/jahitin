import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "bg-slate-50 border-slate-200 focus:ring-primary focus:bg-white flex h-10 w-full rounded-xl border px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Using semantic classes based on your current input style but mapping to tokens where possible
        "dark:bg-input/20 dark:border-input dark:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
