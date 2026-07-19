import { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/[0.08] bg-slate-900/60 p-6 shadow-xl shadow-black/20 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="group transition duration-200 hover:-translate-y-0.5 hover:border-primary-300/25 hover:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">{value}</p>
          {trend && (
            <p className="mt-1.5 text-xs font-medium text-accent-400">{trend}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary-300/20 bg-primary-500/10 text-primary-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition group-hover:border-primary-300/40 group-hover:text-primary-200">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary:
      "bg-primary-500 hover:bg-primary-400 text-slate-950 shadow-lg shadow-primary-500/20 border border-primary-300/20",
    secondary:
      "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10",
    ghost: "hover:bg-white/[0.06] text-slate-300 hover:text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-primary-400/50 focus:bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
      />
    </div>
  );
}

export function Badge({
  children,
  color = "primary",
}: {
  children: ReactNode;
  color?: "primary" | "accent" | "warning" | "error";
}) {
  const colors = {
    primary: "bg-primary-500/10 text-primary-400 border-primary-500/20",
    accent: "bg-accent-500/10 text-accent-400 border-accent-500/20",
    warning: "bg-warning-500/10 text-warning-400 border-warning-500/20",
    error: "bg-error-500/10 text-error-400 border-error-500/20",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colors[color]
      )}
    >
      {children}
    </span>
  );
}
