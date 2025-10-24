"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SequenceForm from "../../new/SequenceForm";
import { SequenceFormSkeleton } from "./SequenceFormSkeleton";
import { ErrorDisplay } from "./ErrorDisplay";

type StepData = {
  id: string;
  delayNumber: number;
  delayUnit: "DIAS" | "HORAS";
  trigger: "APOS_PAGAMENTO" | "APOS_ENTREGRA";
  channel: "WHATSAPP" | "EMAIL";
  messageTemplate: string;
};

type SequenceWithSteps = {
  id: string;
  name: string;
  steps: StepData[];
};

export default function EditSequencePage() {
  const params = useParams();
  const sequenceId = params.id as string;

  const [sequenceData, setSequenceData] = useState<SequenceWithSteps | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSequenceData() {
      if (!sequenceId) {
        setLoading(false);
        setError("ID da sequência não encontrado na URL.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/server/sequences/${sequenceId}`);

        if (!response.ok) {
          if (response.status === 404 || response.status === 403) {
            notFound();
          }
          throw new Error(`Falha ao carregar dados: ${response.statusText}`);
        }

        const data = (await response.json()) as SequenceWithSteps;
        setSequenceData(data);
      } catch (err) {
        console.error("Erro ao buscar sequência:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    loadSequenceData();
  }, [sequenceId]);

  if (loading) {
    return <SequenceFormSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!sequenceData) {
    return notFound();
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/sequences">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar Sequência</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Sequência</CardTitle>
        </CardHeader>
        <CardContent>
          <SequenceForm initialData={sequenceData} />
        </CardContent>
      </Card>
    </div>
  );
}
