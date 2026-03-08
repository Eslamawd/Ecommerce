import { inter } from 'next/font/google';

const font = inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={` ${font.className} flex flex-col items-center justify-center min-h-screen p-5`}>  
      <h1 className="text-3xl font-bold">Welcome to our E-commerce App</h1>
      <p className="mt-4">Shop the latest trends!</p>
    </main>
  );
}