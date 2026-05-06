import { toast } from "sonner";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

interface ErrorOptions {
  severity?: ErrorSeverity;
  silent?: boolean;
  context?: string;
}

export const handleError = (error: unknown, options: ErrorOptions = {}) => {
  const { severity = ErrorSeverity.MEDIUM, silent = false, context } = options;
  
  console.error(`[Error Handler] ${context ? `[${context}] ` : ""}`, error);

  if (silent) return;

  let message = "An unexpected error occurred.";
  let description = "Our team has been notified. Please try again shortly.";

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Domain-specific error mapping
  if (message.includes("rate limit") || message.includes("429")) {
    message = "Intelligence Engine Cooling Down";
    description = "You've reached the tactical limit. Please wait 60 seconds before next scan.";
  } else if (message.includes("JWT") || message.includes("auth")) {
    message = "Session De-synchronized";
    description = "Your tactical session has expired. Please re-authenticate.";
  } else if (message.includes("network") || message.includes("fetch")) {
    message = "Signal Interference";
    description = "We're having trouble connecting to the Lumina core. Check your connection.";
  }

  switch (severity) {
    case ErrorSeverity.CRITICAL:
      toast.error(message, {
        description,
        duration: 10000,
      });
      break;
    case ErrorSeverity.HIGH:
      toast.error(message, { description });
      break;
    case ErrorSeverity.MEDIUM:
      toast.warning(message, { description });
      break;
    case ErrorSeverity.LOW:
    default:
      toast.info(message);
      break;
  }
};
