import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; loading?: boolean; }
export function Button({ variant = "primary", loading = false, className = "", disabled, children, ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary: "bg-[#00a63c] text-white hover:bg-[#008f34]",
    outline: "border border-[#00a63c] bg-white text-[#00a63c] hover:bg-[#effbf4]",
    ghost: "bg-transparent text-[#5f6368] hover:bg-[#f5f6f7]",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50"
  };
  return <button className={`${base} ${styles[variant]} ${className}`} disabled={disabled || loading} {...props}>{loading && <Spinner size="sm" />}{children}</button>;
}
