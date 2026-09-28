import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ToastProvider } from '@/components/Notification/ToastContext';

export const metadata: Metadata = {
  title: 'Orbit Mentor AI - Autonomous AI Learning, Coding & Career Platform',
  description: 'Production-ready dark-themed all-in-one AI mentor, chatbot, task manager, coding lab, exam platform, scoreboard, and career roadmap assistant.',
  keywords: 'AI mentor, coding lab, developer productivity, tech career roadmap, python sandbox, system design quiz',
  authors: [{ name: 'Orbit Mentor AI Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
