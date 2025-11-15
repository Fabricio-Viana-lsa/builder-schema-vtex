'use client'
 
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();

  const goToCreate = () => {
    router.push("/create");
  }

  return (
    <section className="flex items-center m-auto justify-center flex-col gap-4">
      <h1 className="text-4xl font-bold">
        Welcome to Builder Schema Vtex!
      </h1>
      <p>This Project is make for comunity and to comunity!</p>
      <button type="button" onClick={goToCreate} className="border text-gray-700 border-gray-700 p-2 rounded-lg cursor-pointer hover:border-gray-900 hover:font-black transition">
        Start Create
      </button>
    </section>
  );
}
