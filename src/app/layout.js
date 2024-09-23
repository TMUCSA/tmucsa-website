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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Jost:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-default">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
