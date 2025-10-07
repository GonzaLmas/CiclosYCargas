import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import supabase from "../services/SupabaseService";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: SupabaseUser | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SupabaseUser | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const expiryTimeoutRef = useRef<number | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimeoutRef.current) {
      window.clearTimeout(expiryTimeoutRef.current);
      expiryTimeoutRef.current = null;
    }
  };

  const scheduleExpirySignOut = useCallback((session: Session | null) => {
    clearExpiryTimer();
    const expiresAtSec = session?.expires_at;
    if (!expiresAtSec) return;
    const msUntilExpiry = expiresAtSec * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      supabase.auth.signOut().finally(() => {
        setUser(null);
        setRole(null);
      });
      return;
    }
    expiryTimeoutRef.current = window.setTimeout(() => {
      supabase.auth.signOut().finally(() => {
        setUser(null);
        setRole(null);
      });
    }, msUntilExpiry);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      setRole(currentUser?.user_metadata?.role ?? null);
      setLoading(false);
      scheduleExpirySignOut(data.session ?? null);
    };

    initAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setRole(currentUser?.user_metadata?.role ?? null);
        setLoading(false);
        scheduleExpirySignOut(session);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
      clearExpiryTimer();
    };
  }, [scheduleExpirySignOut]);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        const { data } = await supabase.auth.getSession();
        const expiresAtSec = data.session?.expires_at ?? 0;
        if (!expiresAtSec || expiresAtSec * 1000 <= Date.now()) {
          await supabase.auth.signOut();
          setUser(null);
          setRole(null);
          clearExpiryTimer();
        } else {
          scheduleExpirySignOut(data.session ?? null);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [scheduleExpirySignOut]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        if (!data.user) throw new Error("No se pudo iniciar sesión");

        setUser(data.user);
        setRole(data.user.user_metadata?.role ?? null);
        const { data: sessionData } = await supabase.auth.getSession();
        scheduleExpirySignOut(sessionData.session ?? null);
        return data.user;
      } finally {
        setLoading(false);
      }
    },
    [scheduleExpirySignOut]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setRole(null);
      clearExpiryTimer();
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw new Error(error.message);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw new Error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      role,
      loading,
      login,
      logout,
      resetPassword,
      updatePassword,
      loginWithGoogle,
    }),
    [
      user,
      role,
      loading,
      login,
      logout,
      resetPassword,
      updatePassword,
      loginWithGoogle,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
}
