import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
        <Link href="/" className="text-lg font-semibold">
          TreePod
        </Link>
      </div>
    </header>
  );
}
