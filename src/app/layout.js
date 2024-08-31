import { Navbar, Footer } from '@/components';
import './globals.css';

export const metadata = {
  title: 'TMUCSA',
  description: '... a chinese student association',
  icons: [{ url: '/icons/icon.ico', rel: 'icon' }]
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-default">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
