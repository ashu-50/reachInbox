import type { TextareaHTMLAttributes } from "react";
export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`w-full rounded-lg border border-transparent bg-[#f5f7f6] px-3 py-2 text-[12px] outline-none placeholder:text-[#a4a8ac] focus:border-[#c7e9d5] focus:bg-white ${className}`} {...props} />;
}
