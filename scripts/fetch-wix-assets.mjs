/**
 * Baixa as fotos originais do site antigo (Wix) para /public/images com os nomes
 * que o site novo espera. Rode UMA vez na sua máquina: npm run assets:wix
 * Depois, substitua pelas fotos finais quando quiser (mesmos nomes).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const base = "https://static.wixstatic.com/media/";
const files = {
  "isotipo.png": "5ede7b_2bad74d49f934f11ab56fd7803216d8c~mv2.png",
  "hero-home.jpg": "5ede7b_7408a036594d4eb897d72d26364af5df~mv2.jpg",
  "hero-sobre.jpg": "5ede7b_cd0285386bad4499a1f25fbcacd70d09~mv2.jpg",
  "atendimentos.jpg": "5ede7b_53bef4103a0f4692bae723e6791c422a~mv2.jpg",
  "palestra-1.jpg": "5ede7b_8a8cff341ffe4c48b5db0a0340cef1d9~mv2.jpg",
  "palestra-2.jpg": "5ede7b_355172fb59cd4b2f94295b9a9c7b424e~mv2.jpg",
  "palestra-3.jpg": "5ede7b_0bba1a76d96f4e9588db732a3de7b232~mv2.jpg",
  "palestra-4.jpg": "5ede7b_da2fd7ea5ece42f1942d629af0e17531~mv2.jpg",
  "palestra-5.jpg": "5ede7b_be8af52ed33f46a6b45f7f066cb7e022~mv2.jpg",
  "palestra-6.jpg": "5ede7b_d088bd8955604feb86f89c3cb58c2628~mv2.jpg",
};

const dir = join(process.cwd(), "public", "images");
await mkdir(dir, { recursive: true });
for (const [name, id] of Object.entries(files)) {
  const res = await fetch(base + id);
  if (!res.ok) { console.error(`Falhou ${name}: ${res.status}`); continue; }
  await writeFile(join(dir, name), Buffer.from(await res.arrayBuffer()));
  console.log(`ok  ${name}`);
}
console.log("Pronto. Fotos em public/images.");
