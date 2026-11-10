import { cn } from "@/lib/utils"

/** `<select>` nativo con lo stile degli input: su telefono apre il selettore di sistema. */
export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
    return (
        <select
            data-slot="native-select"
            className={cn(
                "h-10 w-full rounded-md border border-input bg-card pr-10 pl-3 text-base outline-none md:text-sm",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive",
                className,
            )}
            {...props}
        />
    )
}
