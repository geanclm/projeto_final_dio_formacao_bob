import { CommandResult, SlashCommand } from "../src/types";
import { executarTrilha } from "../src/services/trilhaLogic";

export const trilhaCommand: SlashCommand = {
  name: "trilha",
  description: "Explore e filtre trilhas de aprendizado da DIO.",
  usage: "/trilha [--listar] [--id <ID>] [--nivel <n>] [--tecnologia <t>] [--categoria <c>] [<busca livre>]",
  examples: [
    "/trilha --listar",
    "/trilha --listar --nivel Iniciante",
    "/trilha --id TRL-001",
    "/trilha --nivel Avançado",
    "/trilha --tecnologia Python",
    "/trilha --categoria Cloud",
    "/trilha machine learning",
  ],
  handler(args: string[]): CommandResult {
    try {
      const output = executarTrilha(args);
      return { success: true, output };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, output: `❌ Erro inesperado: ${message}` };
    }
  },
};
