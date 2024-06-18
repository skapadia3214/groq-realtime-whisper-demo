"use client"
import { cn } from "@/lib/utils";

export function IconGroq({ className, ...props }: React.ComponentProps<'svg'>) {
    return (
        <svg
        fill="#f55036"
        viewBox="0 0 24 24"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('size-4', className)}
        {...props}
        >
        <title>Groq icon</title>
        <path d="M100,38.8a41.91,41.91,0,1,0,0,83.81h13.78V106.89H100A26.19,26.19,0,1,1,126.26,80.7h0v38.6h0A25.85,25.85,0,0,1,82,137.82L70.93,148.93A41.54,41.54,0,0,0,100,161.19h.58a42,42,0,0,0,41.32-41.7l0-39.81A42,42,0,0,0,100,38.8Z"/>
        </svg>
    )
}

export const spinner = (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className="size-5 animate-spin stroke-zinc-400"
  >
    <path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"></path>
  </svg>
)
