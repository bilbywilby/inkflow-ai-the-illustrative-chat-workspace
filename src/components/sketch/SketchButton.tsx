import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
interface SketchButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'ghost' | 'outline';
}
export function SketchButton({ className, variant = 'primary', ...props }: SketchButtonProps) {
  const baseStyles = "transition-all duration-200 active:translate-y-0.5 active:shadow-none font-bold";
  const variants = {
    primary: "bg-primary text-primary-foreground border-2 border-foreground hard-shadow hover:-translate-y-0.5 hover:shadow-hard-lg",
    outline: "bg-background text-foreground border-2 border-foreground hard-shadow hover:-translate-y-0.5 hover:shadow-hard-lg",
    ghost: "bg-transparent hover:bg-foreground/5 text-foreground"
  };
  // Map our custom variants to shadcn underlying variants if needed, 
  // but here we primarily use our custom Tailwind classes.
  return (
    <Button
      variant="ghost" // Base variant to reset shadcn defaults
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}