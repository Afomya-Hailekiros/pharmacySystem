"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ToastVariant = "default" | "success" | "destructive" | "info";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextProps {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => dismiss(id), 3000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (variant?: ToastVariant) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "destructive":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}

      <div className="fixed top-4 right-4 flex flex-col gap-3 z-[9999]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className={`w-72 p-4 rounded-xl shadow-lg border flex items-start gap-3
              ${
                t.variant === "destructive"
                  ? "bg-red-50 border-red-300 text-red-800"
                  : t.variant === "success"
                  ? "bg-green-50 border-green-300 text-green-800"
                  : t.variant === "info"
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <div className="mt-[2px]">{getIcon(t.variant)}</div>
              <div className="flex-1">
                {t.title && (
                  <p className="font-semibold text-sm mb-1">{t.title}</p>
                )}
                {t.description && (
                  <p className="text-xs opacity-90">{t.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
