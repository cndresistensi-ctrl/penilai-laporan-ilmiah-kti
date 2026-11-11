import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ruang Nilai — Penilaian Karya Ilmiah',
  description: 'Sistem penilaian laporan ilmiah dan Karya Tulis Ilmiah.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
