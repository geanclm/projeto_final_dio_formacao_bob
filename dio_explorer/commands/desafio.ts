import { CommandResult, SlashCommand } from "../src/types";
import { executarDesafio } from "../src/services/desafioLogic";

export const desafioCommand: SlashCommand = {
  name: "desafio",
  description: "Gera um desafio prático personalizado para uma trilha da DIO.",
  usage: "/desafio --id <ID> [--dificuldade fácil|médio|difícil]",
  examples: [
    "/desafio --id TRL-001",
    "/desafio --id TRL-001 --dificuldade fácil",
    "/desafio --id TRL-005 --dificuldade difícil",
    "/desafio TRL-003 --dificuldade médio",
  ],
  handler(args: string[]): CommandResult {
    try {
      const output = executarDesafio(args);
      return { success: true, output };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, output: `❌ Erro inesperado: ${message}` };
    }
  },
};
