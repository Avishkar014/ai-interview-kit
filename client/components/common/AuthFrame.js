import Link from "next/link";
import Footer from "./Footer";

export default function AuthFrame({ children }) {
  return <div className="min-h-screen bg-[var(--canvas)]"><header className="auth-header page-container"><Link href="/" className="brand-mark">AI<span>Prep</span></Link><Link href="/" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">Back to home</Link></header><main>{children}</main><Footer /></div>;
}
