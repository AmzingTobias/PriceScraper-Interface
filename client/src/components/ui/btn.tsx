"use client";

import React from "react";

type Variant = "primary" | "danger" | "ghost" | "warn";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "border-accent text-accent hover:bg-accent hover:text-surface-900 focus:bg-accent focus:text-surface-900",
  danger:
    "border-danger text-danger hover:bg-danger hover:text-surface-900 focus:bg-danger focus:text-surface-900",
  ghost:
    "border-surface-500 text-text-secondary hover:border-text-secondary hover:text-text-primary",
  warn:
    "border-warn text-warn hover:bg-warn hover:text-surface-900 focus:bg-warn focus:text-surface-900",
};

export default function Btn({ variant = "primary", fullWidth, children, className = "", ...rest }: BtnProps) {
  return (
    <button
      className={`
        px-6 py-2 rounded-full font-semibold text-sm uppercase tracking-wider
        border-2 bg-transparent transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
