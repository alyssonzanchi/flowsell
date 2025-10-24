"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" disabled className="w-full">
        Carregando...
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600">Olá, {session.user?.name}</p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => signOut()}
          className="cursor-pointer"
        >
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button className="w-full cursor-pointer" onClick={() => signIn("google")}>
      Login com Google
    </Button>
  );
}
