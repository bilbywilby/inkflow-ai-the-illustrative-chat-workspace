import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
interface SketchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
export const SketchButton = React.forwardRef<HTMLButtonElement, SketchButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = "transition-all duration-200 active:translate-y-0.5 active:shadow-none font-bold select-none h-10 px-4 py-2 flex items-center justify-center gap-2 rounded-md";
    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 text-xs",
      lg: "h-11 px-8",
      icon: "h-10 w-10 p-0"
    };
    const variantStyles = {
      primary: "bg-primary text-primary-foreground border-2 border-foreground hard-shadow hover:-translate-y-0.5 hover:shadow-hard-lg",
      outline: "bg-background text-foreground border-2 border-foreground hard-shadow hover:-translate-y-0.5 hover:shadow-hard-lg",
      ghost: "bg-transparent hover:bg-foreground/5 text-foreground border-none shadow-none"
    };
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      />
    );
  }
);
SketchButton.displayName = "SketchButton";