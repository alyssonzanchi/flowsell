import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginButton from "./components/LoginButton";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <Card className="w-[380px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Bem-vindo ao Flowsell
          </CardTitle>
          <CardDescription>
            Faça login com sua conta Google para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
