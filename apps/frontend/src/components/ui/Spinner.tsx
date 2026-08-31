import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" };
export function Spinner({ size = "md", className = "", ...props }: Props) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-7 w-7" };
  return <div aria-label="Loading" role="status" className={`animate-spin rounded-full border-2 border-gray-200 border-t-[#00a63c] ${sizes[size]} ${className}`} {...props} />;
}
