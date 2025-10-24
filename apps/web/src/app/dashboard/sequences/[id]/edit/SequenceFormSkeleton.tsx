import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SequenceFormSkeleton() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-md" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <Skeleton className="h-6 w-24 mb-4 rounded-md" />

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-20 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-20 rounded-md" />
                    <Skeleton className="h-10 flex-1 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>

          <Skeleton className="h-10 w-full mt-6 rounded-md" />
          <Skeleton className="h-10 w-full mt-8 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
