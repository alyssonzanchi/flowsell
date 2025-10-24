import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SequenceForm from "./SequenceForm";

export default function NewSequencePage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/sequences">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nova Sequência</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Sequência</CardTitle>
        </CardHeader>
        <CardContent>
          <SequenceForm />
        </CardContent>
      </Card>
    </div>
  );
}
