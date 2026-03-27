import { toast } from "sonner";

export function success(message: string, options?: { description?: string }) {
  toast.success(message, { description: options?.description });
}

export function error(message: string, options?: { description?: string; action?: { label: string; onClick: () => void } }) {
  toast.error(message, {
    description: options?.description,
    action: options?.action,
  });
}

export function userRejected(message: string) {
  toast(message, {
    description: "Action was cancelled.",
    icon: "🚫",
  });
}

export function configError(message: string, options?: { description?: string }) {
  toast.warning(message, {
    description: options?.description,
    duration: 8000,
  });
}

export function warning(message: string, options?: { description?: string }) {
  toast.warning(message, { description: options?.description });
}
