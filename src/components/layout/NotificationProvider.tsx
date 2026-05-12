"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type NotificationVariant = "error" | "success" | "info";

type Notification = {
    id: number;
    title: string;
    message: string;
    variant: NotificationVariant;
};

type NotifyInput = {
    title?: string;
    message: string;
    variant?: NotificationVariant;
};

type NotificationContextValue = {
    notify: (input: NotifyInput) => void;
    notifyError: (message: string, title?: string) => void;
    notifySuccess: (message: string, title?: string) => void;
    notifyInfo: (message: string, title?: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const VARIANT_STYLES: Record<NotificationVariant, string> = {
    error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    info: "border-border bg-background text-foreground",
};

let nextNotificationId = 1;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: number) => {
        setNotifications((current) => current.filter((notification) => notification.id !== id));
    }, []);

    const notify = useCallback(
        ({ title, message, variant = "info" }: NotifyInput) => {
            const id = nextNotificationId++;
            const notification: Notification = {
                id,
                title: title ?? (variant === "error" ? "Error" : variant === "success" ? "Success" : "Notice"),
                message,
                variant,
            };

            setNotifications((current) => [...current, notification]);

            window.setTimeout(() => {
                removeNotification(id);
            }, 5000);
        },
        [removeNotification],
    );

    const value = useMemo<NotificationContextValue>(
        () => ({
            notify,
            notifyError: (message, title) => notify({ message, title, variant: "error" }),
            notifySuccess: (message, title) => notify({ message, title, variant: "success" }),
            notifyInfo: (message, title) => notify({ message, title, variant: "info" }),
        }),
        [notify],
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-120 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${VARIANT_STYLES[notification.variant]}`}
                        role={notification.variant === "error" ? "alert" : "status"}
                        aria-live={notification.variant === "error" ? "assertive" : "polite"}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em]">
                                    {notification.title}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed">{notification.message}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeNotification(notification.id)}
                                className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] opacity-70 transition-opacity hover:opacity-100"
                                aria-label="Dismiss notification"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }

    return context;
}