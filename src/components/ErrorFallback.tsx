import { SketchButton } from '@/components/sketch/SketchButton';
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}
export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md w-full sketch-border p-10 bg-white hard-shadow text-center space-y-6">
        <h2 className="sketch-font text-4xl font-bold">Paper Jam!</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground italic">
            An error occurred while drawing your session.
          </p>
          <pre className="bg-muted p-4 rounded-md text-[10px] font-mono text-left overflow-x-auto border-2 border-dashed border-foreground/20">
            {error.message}
          </pre>
        </div>
        <SketchButton 
          onClick={resetErrorBoundary} 
          className="w-full"
        >
          Reset Sketchbook
        </SketchButton>
      </div>
    </div>
  );
}