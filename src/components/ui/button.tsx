import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles = {
      primary: "bg-teal-700 hover:bg-teal-800 text-white shadow-sm focus-visible:ring-teal-600",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 focus-visible:ring-slate-400",
      outline:
        "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm focus-visible:ring-slate-400",
      danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus-visible:ring-rose-500",
      ghost: "hover:bg-slate-100 text-slate-700 focus-visible:ring-slate-400",
      link: "text-teal-700 underline-offset-4 hover:underline p-0 focus-visible:ring-teal-600",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
