import "./globals.css";

export const metadata = {
  title: "AI Interview Prep Kit",
  description: "Structured interview preparation workspace",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
