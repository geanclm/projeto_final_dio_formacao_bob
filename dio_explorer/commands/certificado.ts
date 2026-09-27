import { CommandResult, SlashCommand } from "../src/types";
import { executarCertificado } from "../src/services/certificadoLogic";

export const certificadoCommand: SlashCommand = {
  name: "certificado",
  description: "Gera um certificado de conclusão para uma trilha da DIO.",
  usage: "/certificado --id <ID> --nome <Nome Completo>",
  examples: [
    "/certificado --id TRL-001 --nome Maria Fernanda Costa",
    "/certificado --id TRL-005 --nome João Pedro Silva",
    "/certificado --id TRL-003 --nome Ana Beatriz",
  ],
  handler(args: string[]): CommandResult {
    try {
      const output = executarCertificado(args);
      return { success: true, output };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, output: `❌ Erro inesperado: ${message}` };
    }
  },
};
