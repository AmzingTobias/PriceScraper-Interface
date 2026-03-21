"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`
        w-full bg-surface-700/60 text-text-primary placeholder:text-text-muted
        rounded-xl px-4 py-2.5 outline-none border border-transparent
        focus:border-accent/40 hover:border-accent/20 transition-colors
        ${className}
      `}
      {...rest}
    />
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className = "", ...rest }: TextAreaProps) {
  return (
    <textarea
      className={`
        w-full bg-surface-700/60 text-text-primary placeholder:text-text-muted
        rounded-xl px-4 py-2.5 outline-none border border-transparent resize-none
        focus:border-accent/40 hover:border-accent/20 transition-colors
        ${className}
      `}
      {...rest}
    />
  );
}
