import Header from './Header';
import Footer from './Footer';
import { Quicksand } from 'next/font/google';

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
  weight: ['300', '400', '500', '600', '700'],
});

export default function Page({ children }) {
  return (
    <div className={quicksand.className}>
      <Header />
      <div className="container">
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
