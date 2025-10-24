import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { SequenceActions } from "./SequenceActions";

type SequenceStep = {
  id: string;
  delayNumber: number;
  delayUnit: string;
  trigger: string;
  channel: string;
  messageTemplate: string;
};

type SequenceWithSteps = {
  id: string;
  name: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  steps: SequenceStep[];
};

async function getSequences(): Promise<SequenceWithSteps[]> {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch("http://localhost:3000/api/server/sequences", {
    headers: { Cookie: cookieString },
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch sequences:", await response.text());
    return [];
  }

  const sequences = await response.json();
  return sequences;
}

export default async function SequencesListPage() {
  const sequences = await getSequences();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Suas Sequências</h1>
        <Button asChild>
          <Link href="/dashboard/sequences/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Sequência
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nº de Etapas</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sequences && sequences.length > 0 ? (
                sequences.map((sequence) => (
                  <TableRow key={sequence.id}>
                    <TableCell className="font-medium">
                      {sequence.name}
                    </TableCell>
                    <TableCell>{sequence.steps.length}</TableCell>
                    <TableCell>
                      {new Date(sequence.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <SequenceActions sequenceId={sequence.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    Nenhuma sequência criada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
