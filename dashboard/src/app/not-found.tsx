import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 py-12 text-center bg-transparent">
      <div>
        <span className="text-6xl font-bold tracking-widest">404</span>
        <p className="mt-2 text-xl font-semibold">Page not found</p>
      </div>
      <p className="max-w-[420px] leading-relaxed text-[#cfd8dc]">
        The page you are looking for doesn&apos;t exist or has been moved. If you think this is a
        mistake, please contact support.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-sakura-500 to-sakura-600 hover:from-sakura-600 hover:to-sakura-700 hover:shadow-lg hover:shadow-sakura-500/50 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 focus:ring-offset-dark-bg"
      >
        Go back home
      </Link>
    </div>
  );
}
