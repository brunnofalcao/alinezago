import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-site flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="font-display text-sm font-medium tracking-[0.12em] text-taupe-deep">Erro 404</p>
      <h1 className="mt-4 text-d-2 font-light text-grafite">Esta página não existe.</h1>
      <p className="mt-4 max-w-prose text-pedra-600">O endereço pode ter mudado. Volte para a página inicial ou fale com a equipe pelo WhatsApp.</p>
      <Link href="/" className="btn btn-md btn-primary mt-8">Ir para a página inicial</Link>
    </main>
  );
}
