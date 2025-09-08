import { toast } from "sonner";

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

interface ToastOptions {
    description?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    }
}  

const toastComponent = {
    success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
        style: { background: "var(--toast-success)", color: "var(--toast-success-foreground)", boxShadow: "var(--toast-shadow)"},
        description: options?.description,
        duration: options?.duration ?? 3000,
        action: options?.action,
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
        description: options?.description,
        duration: options?.duration ?? 5000,
        action: options?.action,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, {
        description: options?.description,
        duration: options?.duration ?? 4000,
        action: options?.action,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toast.warning?.(message, {
        description: options?.description,
        duration: options?.duration ?? 4000,
        action: options?.action,
    }) ?? toast(message, options), 

  custom: toast,
}

export default toastComponent;