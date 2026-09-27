import { CommandResult, SlashCommand } from "./types";
import { trilhaCommand } from "../commands/trilha";
import { desafioCommand } from "../commands/desafio";
import { certificadoCommand } from "../commands/certificado";

/** Registro central de todos os slash commands disponíveis. */
const registry = new Map<string, SlashCommand>();

/** Registra um comando no registry. Lança erro se o nome já estiver em uso. */
export function registerCommand(command: SlashCommand): void {
  if (registry.has(command.name)) {
    throw new Error(`Comando "${command.name}" já está registrado.`);
  }
  registry.set(command.name, command);
}

/** Retorna todos os comandos registrados. */
export function getCommands(): SlashCommand[] {
  return Array.from(registry.values());
}

/** Retorna um comando pelo nome, ou undefined se não existir. */
export function getCommand(name: string): SlashCommand | undefined {
  return registry.get(name.toLowerCase());
}

/**
 * Processa uma string de entrada no formato "/comando arg1 arg2 ..."
 * e despacha para o handler correto.
 */
export function dispatch(input: string): CommandResult {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return {
      success: false,
      output: `❌ Entrada inválida. Comandos devem começar com \`/\`. Use \`/ajuda\` para ver os comandos disponíveis.`,
    };
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (commandName === "ajuda" || commandName === "help") {
    return { success: true, output: gerarAjudaGeral() };
  }

  const command = getCommand(commandName);
  if (!command) {
    const available = getCommands()
      .map((c) => `\`/${c.name}\``)
      .join(", ");
    return {
      success: false,
      output: `❌ Comando \`/${commandName}\` não encontrado.\n\n**Comandos disponíveis:** ${available}\n\nUse \`/ajuda\` para mais informações.`,
    };
  }

  return command.handler(args);
}

/** Gera a mensagem de ajuda geral com todos os comandos registrados. */
function gerarAjudaGeral(): string {
  const commands = getCommands();
  const linhas = commands.map(
    (c) =>
      `### \`/${c.name}\`\n${c.description}\n\n**Uso:** \`${c.usage}\`\n\n**Exemplos:**\n${c.examples.map((e) => `- \`${e}\``).join("\n")}`
  );

  return [
    "# 🚀 DIO Explorer — Assistente de Carreira",
    "",
    "Bem-vindo ao assistente de carreira da Digital Innovation One!",
    "Use os slash commands abaixo para explorar trilhas, gerar desafios e emitir certificados.",
    "",
    "---",
    "",
    ...linhas.flatMap((l) => [l, ""]),
    "---",
    "",
    `> 💡 Adicione \`--ajuda\` a qualquer comando para ver sua documentação completa.`,
    `> Exemplo: \`/trilha --ajuda\``,
  ].join("\n");
}

// Registro automático dos comandos padrão
registerCommand(trilhaCommand);
registerCommand(desafioCommand);
registerCommand(certificadoCommand);
