import type { InputHTMLAttributes } from "react";
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-9 w-full rounded-lg border border-transparent bg-[#f5f7f6] px-3 text-[12px] text-[#202124] outline-none placeholder:text-[#a4a8ac] focus:border-[#c7e9d5] focus:bg-white ${className}`} {...props} />;
}
