'use client';

import React, { useEffect } from 'react';
import { useToastStore, Toast as ToastType } from '@/lib/toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: 'text-green-400 bg-green-400/10 border-green-400/20',
    error: 'text-red-400 bg-red-400/10 border-red-400/20',
    warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

function ToastItem({ toast }: { toast: ToastType }) {
    const removeToast = useToastStore((state) => state.removeToast);
    const Icon = iconMap[toast.type];

    return (
        <div
            className="glass-medium rounded-xl border shadow-lg overflow-hidden animate-slide-left max-w-sm w-full pointer-events-auto"
            style={{ minWidth: '300px' }}
        >
            <div className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorMap[toast.type]}`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white mb-0.5">
                        {toast.title}
                    </h4>
                    {toast.message && (
                        <p className="text-xs text-mono-60 leading-relaxed">
                            {toast.message}
                        </p>
                    )}

                    {toast.action && (
                        <button
                            onClick={toast.action.onClick}
                            className="mt-2 text-xs font-medium text-white hover:text-mono-90 transition-fast"
                        >
                            {toast.action.label} →
                        </button>
                    )}
                </div>

                <button
                    onClick={() => removeToast(toast.id)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-fast text-mono-50 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress bar */}
            {toast.duration && toast.duration > 0 && (
                <div className="h-1 bg-white/5">
                    <div
                        className={`h-full ${colorMap[toast.type]} transition-all ease-linear`}
                        style={{
                            width: '100%',
                            animation: `shrink ${toast.duration}ms linear forwards`,
                        }}
                    />
                </div>
            )}

            <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
        </div>
    );
}

export default function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-md">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
