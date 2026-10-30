import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-grafite focus:px-4 focus:py-2 focus:text-marfim">Ir para o conteúdo</a>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
    </>
  );
}
