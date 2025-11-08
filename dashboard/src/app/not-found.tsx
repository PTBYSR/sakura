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
        className="inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white"
        style={{
          background: 'linear-gradient(135deg, #EE66AA 0%, #8a2be2 100%)',
          boxShadow: '0 10px 25px rgba(238, 102, 170, 0.2)'
        }}
      >
        Go back home
      </Link>
    </div>
  );
}
