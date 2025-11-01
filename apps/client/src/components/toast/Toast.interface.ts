
export type ToastType = "info" | "error" | "success";

export interface Toast {
  message: string;
  type: ToastType;
}

export interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    icon?: React.ReactNode;
    delay?: number;
    onClose?: () => void;
}

