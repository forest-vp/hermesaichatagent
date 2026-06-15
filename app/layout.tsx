import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Goalify — AI-Powered Training Platform',
  description: 'Level up your skills with AI-generated training programs, personalized coaching, and a community of learners.',
  keywords: ['AI training', 'online learning', 'personal development', 'AI coach', 'certifications'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#111111', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' },
          }}
        />
      </body>
    </html>
  );
}
