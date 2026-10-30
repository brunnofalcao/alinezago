import { NextResponse, type NextRequest } from "next/server";
import { existsSync } from "node:fs";
import path from "node:path";
import { site } from "@/content/site";

/** Entrega a foto oficial: arquivo local se já existir em /public/images, senão o original de reserva. */
export async function GET(request: NextRequest) {
  const f = (request.nextUrl.searchParams.get("f") || "").replace(/[^a-z0-9.-]/gi, "");
  if (!f) return new NextResponse("Arquivo não informado", { status: 400 });
  const all = [site.images.heroHome, site.images.heroSobre, site.images.atendimentos, ...site.images.palestras];
  const match = all.find((i) => i.local === `/images/${f}`);
  if (!match) return new NextResponse("Foto não encontrada", { status: 404 });
  const local = path.join(process.cwd(), "public", "images", f);
  if (existsSync(local)) return NextResponse.redirect(new URL(match.local, request.url));
  if (match.remote) return NextResponse.redirect(match.remote);
  return new NextResponse("Foto ainda não disponível", { status: 404 });
}
