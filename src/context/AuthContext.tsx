"use client";

import { ApiError, setOnAuthFailure } from "@/lib/api";
import { authApi } from "@/lib/auth";
import type { AdminMeResponse } from "@/types/admin";
import { usePathname, useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AuthContextValue {
  user: AdminMeResponse | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const redirectingRef = useRef(false);

  const redirectToSignIn = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    const from = pathname && pathname !== "/signin" ? pathname : "/";
    router.replace(`/signin?from=${encodeURIComponent(from)}`);
  }, [pathname, router]);

  const loadMe = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
      redirectingRef.current = false;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        redirectToSignIn();
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [redirectToSignIn]);

  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
      redirectToSignIn();
    });
    return () => setOnAuthFailure(null);
  }, [redirectToSignIn]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore — cookie is cleared anyway */
    } finally {
      setUser(null);
      router.push("/signin");
      router.refresh();
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, refresh: loadMe, signOut }),
    [user, isLoading, loadMe, signOut],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Yükleniyor…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Auth failed and we are redirecting; render nothing to avoid flash
    return null;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
