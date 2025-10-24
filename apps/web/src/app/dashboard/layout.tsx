import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LoginButton from "../components/LoginButton";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-100 dark:bg-slate-900 p-6 border-r border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-8">Flowsell</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <a
                href="/dashboard"
                className="text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white font-semibold"
              >
                Visão Geral
              </a>
            </li>
            <li className="mb-4">
              <Link
                href="/dashboard/sequences"
                className="text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
              >
                Sequências
              </Link>
            </li>
            <li className="mb-4">
              <a
                href="#"
                className="text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
              >
                Configurações
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex justify-end items-center p-4 border-b border-slate-200 dark:border-slate-800">
          <LoginButton />
        </header>
        <section className="flex-1 p-8 bg-white dark:bg-slate-950">
          {children}
        </section>
      </main>
    </div>
  );
}
