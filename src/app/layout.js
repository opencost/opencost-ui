import { Inter } from 'next/font/google';
import './globals.scss';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'OpenCost - Cost Intelligence Platform',
  description: 'Carbon Design System powered cost monitoring dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
