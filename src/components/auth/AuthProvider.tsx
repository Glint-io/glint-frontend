"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";

interface AuthContextType {
    isLoggedIn: boolean | null;
    accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const token = getAccessToken();

        // TODO: Fix the fact that this causes hydration mismatch on first load, since we don't know the auth state until we check localStorage. '
        // TODO:We could render a placeholder until we know the state, but that causes a flash of "loading..." on every page load. 
        // TODO: Maybe we can optimize by only checking localStorage on certain pages, or by using a cookie instead of localStorage for SSR compatibility.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAccessToken(token);


        setIsLoggedIn(!!token);

        const onAuthChange = () => {
            const newToken = getAccessToken();
            setAccessToken(newToken);
            setIsLoggedIn(!!newToken);
        };

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
