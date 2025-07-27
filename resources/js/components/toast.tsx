import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        titleColor: 'text-green-900 dark:text-green-100',
        textColor: 'text-green-700 dark:text-green-300',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        titleColor: 'text-red-900 dark:text-red-100',
        textColor: 'text-red-700 dark:text-red-300',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        titleColor: 'text-yellow-900 dark:text-yellow-100',
        textColor: 'text-yellow-700 dark:text-yellow-300',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        titleColor: 'text-blue-900 dark:text-blue-100',
        textColor: 'text-blue-700 dark:text-blue-300',
    },
};

function ToastItem({ toast, onClose }: ToastProps) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                onClose(toast.id);
            }, toast.duration);

            return () => clearTimeout(timer);
        }
    }, [toast.id, toast.duration, onClose]);

    return (
        <div
            className={`${config.bgColor} border rounded-lg p-4 shadow-lg max-w-sm w-full transition-all transform animate-in slide-in-from-right-full duration-300`}
        >
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className={`text-sm font-medium ${config.titleColor}`}>
                        {toast.title}
                    </p>
                    {toast.message && (
                        <p className={`mt-1 text-sm ${config.textColor}`}>
                            {toast.message}
                        </p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onClose(toast.id)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 z-50 flex items-end justify-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onClose={onClose} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Toast Hook
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 4000,
        };

        setToasts((prev) => [...prev, newToast]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const toast = {
        success: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'success', title, message, duration }),
        error: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'error', title, message, duration }),
        info: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'info', title, message, duration }),
        warning: (title: string, message?: string, duration?: number) =>
            addToast({ type: 'warning', title, message, duration }),
    };

    return {
        toasts,
        toast,
        removeToast,
    };
}
