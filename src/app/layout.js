import { Inter } from 'next/font/google';
import { Navbar, Footer } from '@/components';
import './globals.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TMUCSA',
  description: '... a chinese student association',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Navbar />
      <body className={inter.className}>{children}</body>
      <Footer />
    </html>
  )
}
