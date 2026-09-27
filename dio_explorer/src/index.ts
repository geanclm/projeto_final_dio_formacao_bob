/**
 * DIO Explorer — Assistente de Carreira
 * Entry point: lê um slash command da linha de comando e exibe a resposta.
 *
 * Uso:
 *   npx ts-node src/index.ts "/trilha --listar"
 *   npx ts-node src/index.ts "/desafio --id TRL-001 --dificuldade difícil"
 *   npx ts-node src/index.ts "/certificado --id TRL-001 --nome Maria Silva"
 *   npx ts-node src/index.ts "/ajuda"
 */

import { dispatch } from "./commandRegistry";

function main(): void {
  // Lê todos os argumentos após "ts-node src/index.ts" como uma string única
  const input = process.argv.slice(2).join(" ").trim();

  if (!input) {
    const result = dispatch("/ajuda");
    console.log(result.output);
    process.exit(0);
  }

  const result = dispatch(input);
  console.log(result.output);
  process.exit(result.success ? 0 : 1);
}

main();
