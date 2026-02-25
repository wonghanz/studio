import type { Metadata } from 'next';
import './globals.css';
import { BottomNav, Sidebar } from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'NATIVE - Your AI English Companion',
  description: 'AI-powered English proficiency preparation for MUET and SPM level English.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 mb-16 md:mb-0">
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
