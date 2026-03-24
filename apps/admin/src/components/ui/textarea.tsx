import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "bg-slate-50 border-slate-200 focus:ring-primary focus:bg-white flex min-h-[80px] w-full rounded-xl border px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-input/20 dark:border-input dark:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
