import { CertificadoContexto, ValidationError } from "../types";
import { validarIdTrilha } from "./trailService";

const NOME_MIN_LEN = 3;
const NOME_MAX_LEN = 80;

/** Valida o nome do estudante. */
function validarNome(nome: string): string {
  const nomeNormalizado = nome.trim();
  if (nomeNormalizado.length < NOME_MIN_LEN) {
    throw new ValidationError(
      `Nome muito curto. Informe pelo menos ${NOME_MIN_LEN} caracteres.`
    );
  }
  if (nomeNormalizado.length > NOME_MAX_LEN) {
    throw new ValidationError(
      `Nome muito longo. Máximo de ${NOME_MAX_LEN} caracteres permitidos.`
    );
  }
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(nomeNormalizado)) {
    throw new ValidationError(
      `Nome inválido. Use apenas letras, espaços, hífens e apóstrofos.`
    );
  }
  return nomeNormalizado;
}

/** Retorna a data atual formatada em pt-BR. */
function dataAtual(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Gera o número de certificado simulado. */
function gerarNumeroCertificado(nomeEstudante: string, idTrilha: string): string {
  const hash = Buffer.from(`${nomeEstudante}:${idTrilha}:${Date.now()}`)
    .toString("base64")
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 16);
  return `DIO-CERT-${hash}`;
}

/** Formata o certificado em Markdown. */
function formatarCertificado(ctx: CertificadoContexto, numCert: string): string {
  const { trilha, nomeEstudante } = ctx;
  const hoje = dataAtual();

  const badgesStr = trilha.badges.map((b) => `\`${b}\``).join(" · ");
  const techStr = trilha.tecnologia.join(", ");

  return [
    `## 🎓 Certificado de Conclusão — DIO`,
    "",
    `\`\`\``,
    `╔══════════════════════════════════════════════════════════════╗`,
    `║           DIGITAL INNOVATION ONE — CERTIFICADO              ║`,
    `║                    DE CONCLUSÃO                             ║`,
    `╠══════════════════════════════════════════════════════════════╣`,
    `║                                                              ║`,
    `║  Certificamos que                                           ║`,
    `║                                                              ║`,
    `║  ${nomeEstudante.padEnd(60)}║`,
    `║                                                              ║`,
    `║  concluiu com êxito a trilha:                               ║`,
    `║                                                              ║`,
    `║  ${trilha.nome.padEnd(60)}║`,
    `║                                                              ║`,
    `║  Carga horária: ${String(trilha.duracao_horas + "h").padEnd(44)}║`,
    `║  Módulos: ${String(trilha.modulos).padEnd(51)}║`,
    `║  XP Total: ${String(trilha.xp_total.toLocaleString("pt-BR") + " XP").padEnd(50)}║`,
    `║                                                              ║`,
    `║  Data de emissão: ${hoje.padEnd(43)}║`,
    `║  Número: ${numCert.padEnd(52)}║`,
    `║                                                              ║`,
    `╚══════════════════════════════════════════════════════════════╝`,
    `\`\`\``,
    "",
    `### 📋 Detalhes do Certificado`,
    "",
    `| Campo | Informação |`,
    `|-------|------------|`,
    `| 🎓 Estudante | **${nomeEstudante}** |`,
    `| 📚 Trilha | ${trilha.nome} \`${trilha.id}\` |`,
    `| 📂 Categoria | ${trilha.categoria} |`,
    `| 🎯 Nível | ${trilha.nivel} |`,
    `| ⏱️ Carga Horária | ${trilha.duracao_horas} horas |`,
    `| 🧩 Módulos | ${trilha.modulos} módulos |`,
    `| ⚡ XP Conquistado | ${trilha.xp_total.toLocaleString("pt-BR")} XP |`,
    `| 🛠️ Tecnologias | ${techStr} |`,
    `| 📅 Data de Emissão | ${hoje} |`,
    `| 🔑 Número do Certificado | \`${numCert}\` |`,
    "",
    `### 🏅 Badges Conquistadas`,
    `> ${badgesStr}`,
    "",
    `### 👨‍🏫 Instrutores`,
    trilha.instrutores.map((i) => `- ${i}`).join("\n"),
    "",
    `---`,
    `> 📢 **Compartilhe seu certificado** no LinkedIn e na comunidade DIO!`,
    `> Use a hashtag \`#DIOCertificado\` e mencione \`@digitalinnovationone\``,
    "",
    `> 🔗 Para validar o certificado, acesse: \`https://www.dio.me/certificate/${numCert}\``,
  ].join("\n");
}

/** Lógica principal do comando /certificado. */
export function executarCertificado(args: string[]): string {
  if (args.length === 0 || args[0] === "--ajuda") {
    return ajudaCertificado();
  }

  let idTrilha: string | undefined;
  let nomeEstudante: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) {
      idTrilha = args[++i];
    } else if (args[i] === "--nome") {
      // nome pode ter múltiplos tokens até o próximo flag
      const nomePartes: string[] = [];
      i++;
      while (i < args.length && !args[i].startsWith("--")) {
        nomePartes.push(args[i]);
        i++;
      }
      i--; // volta um passo para o loop incrementar corretamente
      nomeEstudante = nomePartes.join(" ");
    }
  }

  if (!idTrilha) {
    return `❌ Informe o ID da trilha. Exemplo: \`/certificado --id TRL-001 --nome João Silva\``;
  }
  if (!nomeEstudante) {
    return `❌ Informe seu nome. Exemplo: \`/certificado --id TRL-001 --nome João Silva\``;
  }

  try {
    const nomeLimpo = validarNome(nomeEstudante);
    const trilha = validarIdTrilha(idTrilha);
    const numCert = gerarNumeroCertificado(nomeLimpo, trilha.id);
    const ctx: CertificadoContexto = { trilha, nomeEstudante: nomeLimpo };
    return formatarCertificado(ctx, numCert);
  } catch (e: unknown) {
    if (e instanceof ValidationError) return `❌ ${e.message}`;
    throw e;
  }
}

function ajudaCertificado(): string {
  return [
    "## 🎓 Comando `/certificado` — Emissão de Certificado DIO",
    "",
    "Gera um certificado de conclusão formatado para uma trilha da DIO.",
    "",
    "### Uso",
    "```",
    "/certificado --id <ID> --nome <Seu Nome>",
    "```",
    "",
    "### Parâmetros",
    "| Parâmetro | Obrigatório | Descrição |",
    "|-----------|-------------|-----------|",
    "| `--id` | ✅ Sim | ID da trilha concluída (ex.: `TRL-001`) |",
    "| `--nome` | ✅ Sim | Seu nome completo (3–80 caracteres, somente letras) |",
    "",
    "### Exemplos",
    "```",
    "/certificado --id TRL-001 --nome Maria Fernanda Costa",
    "/certificado --id TRL-005 --nome João Pedro Silva",
    "/certificado --id TRL-003 --nome Ana Beatriz",
    "```",
    "",
    "> 💡 Use `/trilha --listar` para encontrar o ID da trilha que você concluiu.",
  ].join("\n");
}
