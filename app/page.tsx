import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Image
        src="/image1.jpg"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-xl font-semibold text-white">SyncSpace</span>
          <Link
            href="/login"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Sign in
          </Link>
        </header>
        <main className="mx-auto flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Real-time collaboration,
            <br />
            in the browser
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            A cloud-based platform that lets your team work together on shared tasks and
            projects in real time—from anywhere.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:opacity-95"
            >
              Get started
            </Link>
            <span className="text-sm text-white/70">
              No signup—use your team account to sign in.
            </span>
          </div>
          <ul className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3 sm:gap-8">
            <li className="rounded-lg bg-white/5 p-4 backdrop-blur-sm">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Live presence
              </span>
              <p className="mt-1 text-sm text-white/90">
                See who’s online and when messages were last edited.
              </p>
            </li>
            <li className="rounded-lg bg-white/5 p-4 backdrop-blur-sm">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Channels
              </span>
              <p className="mt-1 text-sm text-white/90">
                Organize work by workspace and channel.
              </p>
            </li>
            <li className="rounded-lg bg-white/5 p-4 backdrop-blur-sm">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Enterprise-ready
              </span>
              <p className="mt-1 text-sm text-white/90">
                Built for teams that need clarity and control.
              </p>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
}
