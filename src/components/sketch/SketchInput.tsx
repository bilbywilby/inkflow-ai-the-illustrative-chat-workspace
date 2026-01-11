import React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
interface SketchInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
}
export const SketchInput = React.forwardRef<HTMLTextAreaElement, SketchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative group w-full", containerClassName)}>
        <Textarea
          ref={ref}
          className={cn(
            "min-h-[60px] w-full sketch-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-primary hard-shadow-sm transition-all resize-none",
            className
          )}
          {...props}
        />
        <div className="absolute -bottom-1 -right-1 w-full h-full bg-foreground -z-10 rounded-md opacity-0 group-focus-within:opacity-10 transition-opacity" />
      </div>
    );
  }
);
SketchInput.displayName = "SketchInput";