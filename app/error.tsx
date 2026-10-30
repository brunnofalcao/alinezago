"use client";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-site flex min-h-[60vh] flex-col items-start justify-center py-20">
      <h1 className="text-d-2 font-light text-grafite">Não foi possível carregar este módulo.</h1>
      <p className="mt-4 max-w-prose text-pedra-600">Algo falhou ao montar a página. Tente novamente; se persistir, a equipe técnica já tem o registro do erro.</p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn btn-md btn-primary">Tentar novamente</button>
        <Link href="/" className="btn btn-md btn-outline">Página inicial</Link>
      </div>
    </main>
  );
}
