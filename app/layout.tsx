import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sivic - Security Dashboard",
  description: "Solana Security Dashboard - Protect your investments with advanced security analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased bg-[#0a0a0a] text-[#ededed]"
        style={{ fontFamily: "'Nohemi', system-ui, sans-serif" }}
      >
        <script src="https://js.puter.com/v2/"></script>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(23, 23, 23, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              backdropFilter: 'blur(12px)',
            },
            classNames: {
              toast: 'text-white',
              title: 'text-white font-semibold',
              description: '!text-white opacity-80',
              error: 'bg-red-900/30 border-red-500/40 text-white',
              success: 'bg-green-900/30 border-green-500/40 text-white',
              warning: 'bg-yellow-900/30 border-yellow-500/40 text-white',
              info: 'bg-blue-900/30 border-blue-500/40 text-white',
            },
          }}
        />
      </body>
    </html>
  );
}
