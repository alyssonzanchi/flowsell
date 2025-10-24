import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ocorreu um Erro</AlertTitle>
        <AlertDescription>
          {message || "Não foi possível carregar os dados da sequência."}
        </AlertDescription>
      </Alert>
      <Button variant="outline" asChild className="mt-4">
        <Link href="/dashboard/sequences">Voltar para a Lista</Link>
      </Button>
    </div>
  );
}
