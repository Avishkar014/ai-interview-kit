import "./globals.css";
import CookieConsent from "../components/common/CookieConsent";

export const metadata = {
  title: "AI Interview Prep Kit",
  description: "Structured interview preparation workspace",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}<CookieConsent /></body></html>;
}
