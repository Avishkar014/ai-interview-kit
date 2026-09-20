"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../services/auth.service";

export default function AuthGate({ children }) {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let active = true;
    authService.me().then((user) => active && setState({ loading: false, user })).catch(() => active && router.replace("/login"));
    return () => { active = false; };
  }, [router]);

  if (state.loading) return <div className="min-h-screen bg-[#f4f7f5] p-8"><div className="mx-auto max-w-6xl animate-pulse rounded-2xl bg-white p-8 shadow-sm"><div className="h-6 w-48 rounded bg-[#e3ebe6]" /><div className="mt-6 h-24 rounded bg-[#edf3ef]" /></div></div>;
  if (!state.user) return null;
  return children;
}