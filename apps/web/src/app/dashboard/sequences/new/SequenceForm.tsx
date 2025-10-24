"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle } from "lucide-react";

interface SequenceFormProps {
  initialData?: {
    id: string;
    name: string;
    steps: Array<Omit<StepFormData, "id">>;
  } | null;
}

type StepFormData = {
  id: string;
  delayNumber: number;
  delayUnit: "DIAS" | "HORAS";
  trigger: "APOS_PAGAMENTO" | "APOS_ENTREGRA";
  channel: "WHATSAPP" | "EMAIL";
  messageTemplate: string;
};

const defaultStep: Omit<StepFormData, "id"> = {
  delayNumber: 1,
  delayUnit: "DIAS",
  trigger: "APOS_PAGAMENTO",
  channel: "WHATSAPP",
  messageTemplate: "",
};

export default function SequenceForm({
  initialData = null,
}: SequenceFormProps) {
  const baseId = useId();
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [steps, setSteps] = useState<StepFormData[]>(
    initialData?.steps.map((step) => ({
      ...step,
      id: crypto.randomUUID(),
    })) || [{ ...defaultStep, id: crypto.randomUUID() }]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStep = () => {
    setSteps((currentSteps) => [
      ...currentSteps,
      { ...defaultStep, id: crypto.randomUUID() },
    ]);
  };

  const handleRemoveStep = (idToRemove: string) => {
    setSteps((currentSteps) =>
      currentSteps.filter((step) => step.id !== idToRemove)
    );
  };

  const handleStepChange = (
    id: string,
    field: keyof Omit<StepFormData, "id">,
    value: string | number
  ) => {
    setSteps((currentSteps) =>
      currentSteps.map((step) => {
        if (step.id === id) {
          if (field === "delayNumber") {
            const numValue = parseInt(value as string, 10);
            return { ...step, [field]: isNaN(numValue) ? 0 : numValue };
          }
          return { ...step, [field]: value };
        }
        return step;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      name: name,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      steps: steps.map(({ id: _id, ...rest }) => rest),
    };

    try {
      const url = initialData?.id
        ? `/api/server/sequences/${initialData.id}`
        : "/api/server/sequences";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData
            ? String(errorData.message)
            : `Erro ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      console.log(
        `Sequência ${initialData?.id ? "atualizada" : "salva"} com sucesso:`,
        await response.json()
      );
      router.push("/dashboard/sequences");
      router.refresh();
    } catch (err: unknown) {
      console.error(
        `Erro ao ${initialData?.id ? "atualizar" : "salvar"} sequência:`,
        err
      );
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          `Ocorreu um erro desconhecido ao ${initialData?.id ? "atualizar" : "salvar"} a sequência.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <Label htmlFor="sequenceName">Nome da Sequência</Label>
        <Input
          id="sequenceName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Boas-vindas Pós-Compra"
          required
          className="mt-1"
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Etapas</h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card key={step.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Etapa {index + 1}
              </CardTitle>
              {steps.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemoveStep(step.id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <Label htmlFor={`trigger-${baseId}-${index}`}>Gatilho</Label>
                  <Select
                    value={step.trigger}
                    onValueChange={(value) =>
                      handleStepChange(step.id, "trigger", value)
                    }
                  >
                    <SelectTrigger id={`trigger-${baseId}-${index}`}>
                      <SelectValue placeholder="Selecione o gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APOS_PAGAMENTO">
                        Após Pagamento
                      </SelectItem>
                      <SelectItem value="APOS_ENTREGA">Após Entrega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Aguardar</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`delayNumber-${baseId}-${index}`}
                      type="number"
                      min="0"
                      value={step.delayNumber}
                      onChange={(e) =>
                        handleStepChange(step.id, "delayNumber", e.target.value)
                      }
                      className="w-20"
                      required
                    />
                    <Select
                      value={step.delayUnit}
                      onValueChange={(value) =>
                        handleStepChange(step.id, "delayUnit", value)
                      }
                    >
                      <SelectTrigger id={`delayUnit-${baseId}-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DIAS">Dias</SelectItem>
                        <SelectItem value="HORAS">Horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-1">
                <Label htmlFor={`channel-${baseId}-${index}`}>Canal</Label>
                <Select
                  value={step.channel}
                  onValueChange={(value) =>
                    handleStepChange(step.id, "channel", value)
                  }
                >
                  <SelectTrigger id={`channel-${baseId}-${index}`}>
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`messageTemplate-${baseId}-${index}`}>
                  Mensagem
                </Label>
                <Textarea
                  id={`messageTemplate-${baseId}-${index}`}
                  placeholder="Digite sua mensagem aqui. Use {customer.firstName}, {order.name}, etc."
                  value={step.messageTemplate}
                  onChange={(e) =>
                    handleStepChange(step.id, "messageTemplate", e.target.value)
                  }
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddStep}
        className="mt-6 w-full cursor-pointer"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Etapa
      </Button>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={isLoading}
        className="mt-8 w-full cursor-pointer"
      >
        {isLoading ? "Salvando..." : "Salvar Sequência"}
      </Button>
    </form>
  );
}
