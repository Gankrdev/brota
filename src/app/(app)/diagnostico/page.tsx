"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DiagnosisUploader } from "@/components/diagnosis/diagnosis-uploader";
import { DiagnosisResult } from "@/components/diagnosis/diagnosis-result";
import type { DiagnosisResponse } from "@/app/api/diagnosis/route";

export default function DiagnosticoPage() {
  const searchParams = useSearchParams();
  const plantId = searchParams.get("plantId") ?? undefined;
  const speciesName = searchParams.get("speciesName") ?? undefined;

  const [result, setResult] = useState<DiagnosisResponse | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  function handleResult(data: DiagnosisResponse, url: string) {
    setResult(data);
    setPhotoUrl(url);
  }

  function handleReset() {
    setResult(null);
    setPhotoUrl(null);
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 pb-32 pt-8 md:px-16 md:pb-16">
      {result && photoUrl ? (
        <DiagnosisResult result={result} photoUrl={photoUrl} onReset={handleReset} />
      ) : (
        <DiagnosisUploader onResult={handleResult} plantId={plantId} speciesName={speciesName} />
      )}
    </main>
  );
}
