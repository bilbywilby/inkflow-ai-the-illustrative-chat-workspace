import { SketchButton } from '@/components/sketch/SketchButton';
import { useNavigate } from 'react-router-dom';
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  onRetry?: () => void;
  onGoHome?: () => void;
}
export function ErrorFallback({ error, resetErrorBoundary, onRetry, onGoHome }: ErrorFallbackProps) {
  const navigate = useNavigate();
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
      resetErrorBoundary();
    }
  };
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      resetErrorBoundary();
    }
  };
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md w-full sketch-border p-10 bg-white dark:bg-card hard-shadow text-center space-y-6">
        <h2 className="sketch-font text-4xl font-bold">Paper Jam!</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground italic">
            An error occurred while drawing your session.
          </p>
          <pre className="bg-muted p-4 rounded-md text-[10px] font-mono text-left overflow-x-auto border-2 border-dashed border-foreground/20 max-h-40">
            {error.message || "Unknown skeletal error"}
          </pre>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SketchButton
            onClick={handleRetry}
            variant="outline"
            className="w-full"
          >
            Try Again
          </SketchButton>
          <SketchButton
            onClick={handleGoHome}
            className="w-full"
          >
            Go Home
          </SketchButton>
        </div>
      </div>
    </div>
  );
}