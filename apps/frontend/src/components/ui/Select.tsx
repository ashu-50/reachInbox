import type { SelectHTMLAttributes } from "react";
export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`h-9 w-full appearance-none rounded-lg border border-transparent bg-[#f5f7f6] px-3 text-[12px] text-[#202124] outline-none focus:border-[#c7e9d5] focus:bg-white ${className}`} {...props}>{children}</select>;
}
