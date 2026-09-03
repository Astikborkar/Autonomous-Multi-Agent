import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autonomous Multi-Agent Workflow Orchestrator',
  description: 'Enterprise-grade Autonomous Multi-Agent AI SaaS Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#070a12] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
