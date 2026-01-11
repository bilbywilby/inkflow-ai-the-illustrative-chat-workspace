import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
interface SketchButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'ghost' | 'outline';
}
export const SketchButton = React.forwardRef<HTMLButtonElement, SketchButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const baseStyles = "transition-all duration-200 active:translate-y-0.5 active:shadow-none font-bold select-none";
    const variants = {
      primary: "bg-primary text-primary-foreground border-2 border-foreground hard-shadow hover:-translate-y-0.5 hover:shadow-hard-lg",
      outline: "bg-background text-foreground border-2 border-foreground hard-shadow hover:-translate-y-0.5 hover:shadow-hard-lg",
      ghost: "bg-transparent hover:bg-foreground/5 text-foreground border-none shadow-none"
    };
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
SketchButton.displayName = "SketchButton";