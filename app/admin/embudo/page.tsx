import Link from 'next/link';
import BookingFunnel from '../components/BookingFunnel';
export default function EmbudoPage() {
  return <div className="min-h-screen bg-gray-50 text-gray-900"><div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6"><Link href="/admin" className="text-sm underline">Volver al administrador</Link><BookingFunnel/></div></div>;
}
