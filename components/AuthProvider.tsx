"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken } from "@/app/lib/auth";

interface AuthContextType {
    isLoggedIn: boolean | null;
    accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        // Initialize auth state from localStorage
        const token = getAccessToken();
        setAccessToken(token);
        setIsLoggedIn(!!token);

        // Listen for auth changes from setAuth() and clearAuth()
        const onAuthChange = () => {
            const newToken = getAccessToken();
            setAccessToken(newToken);
            setIsLoggedIn(!!newToken);
        };

        // Listen for storage changes from other tabs
        const onStorage = (e: StorageEvent) => {
            if (e.key === "glint.auth") {
                const newToken = getAccessToken();
                setAccessToken(newToken);
                setIsLoggedIn(!!newToken);
            }
        };

        window.addEventListener("glint:auth-change", onAuthChange);
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("glint:auth-change", onAuthChange);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, accessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
