"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SequenceActionsProps {
  sequenceId: string;
}

export function SequenceActions({ sequenceId }: SequenceActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/server/sequences/${sequenceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro desconhecido ao excluir." }));
        throw new Error(
          errorData.message || `Erro ${response.status}: ${response.statusText}`
        );
      }

      console.log(`Sequência ${sequenceId} excluída com sucesso.`);
      setIsDialogOpen(false);
      router.refresh();
    } catch (err: unknown) {
      console.error(`Erro ao excluir sequência ${sequenceId}:`, err);
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro ao excluir."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="icon" asChild title="Editar">
        <Link href={`/dashboard/sequences/${sequenceId}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 cursor-pointer"
            title="Excluir"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a
              sequência.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
