import { toast } from "sonner";

export function success(message: string, options?: { description?: string }) {
  toast.success(message, { description: options?.description });
}

export function error(message: string, options?: { description?: string }) {
  toast.error(message, { description: options?.description });
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