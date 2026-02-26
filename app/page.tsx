import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen  bg-zinc-50 text-black font-sans">
        <Image
          src='/image1.jpg'
          alt='red theme office'
          fill
          objectFit='cover'
        />
        <div className="px-5 py-5 border-b-2 border-gray-100 shadow absolute w-full h-full bg-black/20">
          <div className="text-center h-full flex flex-col my-auto space-y-5 md:w-1/2 mx-auto pt-16">
            <h3 className="text-5xl font-semibold text-white">SyncSpace</h3>
            <p className="text-white text-sm">A cloud-based software platform accessed through a browser that enables multiple users to work together in real-time on shared tasks, documents, or projects, regardless of their physical location. </p>
            <Link href='/login' className="bg-red-500 text-white px-10 py-3 rounded-md font-semibold">Get Started</Link>
          </div>
          
        </div>
    </div>
  );
}
