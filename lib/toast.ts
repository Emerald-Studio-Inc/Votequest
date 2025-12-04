import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration || 5000,
        };

        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto-dismiss
        if (newToast.duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, newToast.duration);
        }
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),

    clearAll: () => set({ toasts: [] }),
}));

// Convenience functions
export const toast = {
    success: (title: string, message?: string, action?: Toast['action']) =>
        useToastStore.getState().addToast({ type: 'success', title, message, action }),

    error: (title: string, message?: string, action?: Toast['action']) =>
        useToastStore.getState().addToast({ type: 'error', title, message, action }),

    warning: (title: string, message?: string, action?: Toast['action']) =>
        useToastStore.getState().addToast({ type: 'warning', title, message, action }),

    info: (title: string, message?: string, action?: Toast['action']) =>
        useToastStore.getState().addToast({ type: 'info', title, message, action }),
};
