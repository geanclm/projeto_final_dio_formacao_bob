import { Trilha, TrilhaFiltros, ValidationError } from "../types";
import {
  filtrarTrilhas,
  listarCategorias,
  listarNiveis,
  listarTrilhas,
} from "./trailService";

const NIVEL_EMOJI: Record<string, string> = {
  iniciante: "🟢",
  intermediário: "🟡",
  avançado: "🔴",
};

function nivelEmoji(nivel: string): string {
  return NIVEL_EMOJI[nivel.toLowerCase()] ?? "⚪";
}

function formatarPromocao(trilha: Trilha): string {
  const { desconto_percentual, validade } = trilha.promocoes;
  if (desconto_percentual === 0) return "Sem promoção ativa";
  const valStr = validade ? ` (válido até ${validade})` : "";
  return `🏷️ **${desconto_percentual}% de desconto**${valStr}`;
}

/** Formata um card resumido de uma trilha. */
export function formatarCardTrilha(trilha: Trilha): string {
  const emoji = nivelEmoji(trilha.nivel);
  const promo = formatarPromocao(trilha);
  const acesso = trilha.vitalicio ? "✅ Vitalício" : "⏳ Por tempo limitado";

  return [
    `### ${emoji} ${trilha.nome} \`${trilha.id}\``,
    `> ${trilha.descricao}`,
    "",
    `| Campo | Detalhe |`,
    `|-------|---------|`,
    `| 📂 Categoria | ${trilha.categoria} |`,
    `| 🎯 Nível | ${trilha.nivel} |`,
    `| ⏱️ Duração | ${trilha.duracao_horas}h em ${trilha.modulos} módulos |`,
    `| ⚡ XP Total | ${trilha.xp_total.toLocaleString("pt-BR")} XP |`,
    `| 🎥 Lives ao Vivo | ${trilha.lives_ao_vivo} |`,
    `| 🔑 Acesso | ${acesso} |`,
    `| 📅 Lançamento | ${trilha.data_lancamento} |`,
    "",
    `**🛠️ Tecnologias:** ${trilha.tecnologia.join(" · ")}`,
    `**🏅 Badges:** ${trilha.badges.join(", ")}`,
    `**👨‍🏫 Instrutores:** ${trilha.instrutores.join(", ")}`,
    `**💰 Promoção:** ${promo}`,
  ].join("\n");
}

/** Formata uma lista compacta de trilhas. */
export function formatarListaTrilhas(trilhas: Trilha[]): string {
  const linhas = trilhas.map((t) => {
    const emoji = nivelEmoji(t.nivel);
    return `- ${emoji} **${t.nome}** \`${t.id}\` — ${t.categoria} · ${t.nivel} · ${t.duracao_horas}h`;
  });
  return linhas.join("\n");
}

/** Lógica principal: redireciona para a sub-operação correta. */
export function executarTrilha(args: string[]): string {
  if (args.length === 0 || args[0] === "--ajuda") {
    return ajudaTrilha();
  }

  if (args[0] === "--listar") {
    return listarTodasTrilhas(args.slice(1));
  }

  if (args[0] === "--id" && args[1]) {
    return detalharTrilhaPorId(args[1]);
  }

  if (args[0] === "--nivel" && args[1]) {
    return buscarPorNivel(args[1]);
  }

  if (args[0] === "--tecnologia" && args[1]) {
    return buscarPorTecnologia(args[1]);
  }

  if (args[0] === "--categoria" && args[1]) {
    return buscarPorCategoria(args[1]);
  }

  // Interpretação livre: busca pelo texto como tecnologia ou nome
  return buscaLivre(args.join(" "));
}

function ajudaTrilha(): string {
  const niveis = listarNiveis().join(", ");
  const cats = listarCategorias().join(", ");
  return [
    "## 📚 Comando `/trilha` — Assistente de Trilhas DIO",
    "",
    "Explore as trilhas de aprendizado disponíveis na plataforma.",
    "",
    "### Uso",
    "```",
    "/trilha                          — Exibe este menu de ajuda",
    "/trilha --listar                 — Lista todas as trilhas",
    "/trilha --listar --nivel <n>     — Filtra por nível",
    "/trilha --listar --categoria <c> — Filtra por categoria",
    "/trilha --id <ID>                — Detalhes de uma trilha específica",
    "/trilha --nivel <nivel>          — Busca por nível",
    "/trilha --tecnologia <tech>      — Busca por tecnologia",
    "/trilha --categoria <cat>        — Busca por categoria",
    "/trilha <texto livre>            — Busca por nome ou tecnologia",
    "```",
    "",
    `**Níveis disponíveis:** ${niveis}`,
    `**Categorias disponíveis:** ${cats}`,
  ].join("\n");
}

function listarTodasTrilhas(flags: string[]): string {
  const filtros: TrilhaFiltros = {};

  for (let i = 0; i < flags.length; i++) {
    if (flags[i] === "--nivel" && flags[i + 1]) {
      filtros.nivel = flags[++i];
    } else if (flags[i] === "--categoria" && flags[i + 1]) {
      filtros.categoria = flags[++i];
    } else if (flags[i] === "--tecnologia" && flags[i + 1]) {
      filtros.tecnologia = flags[++i];
    }
  }

  let trilhas;
  try {
    trilhas = filtrarTrilhas(filtros);
  } catch (e: unknown) {
    if (e instanceof ValidationError) return `❌ ${e.message}`;
    throw e;
  }
  if (trilhas.length === 0) {
    return "⚠️ Nenhuma trilha encontrada para os filtros informados.";
  }

  const total = listarTrilhas().length;
  const cabecalho =
    Object.keys(filtros).length > 0
      ? `## 📋 Trilhas encontradas (${trilhas.length} de ${total})\n`
      : `## 📋 Todas as Trilhas DIO (${trilhas.length} trilhas)\n`;

  return cabecalho + formatarListaTrilhas(trilhas);
}

function detalharTrilhaPorId(id: string): string {
  const trilha = filtrarTrilhas({ id })[0];
  if (!trilha) {
    return `❌ Trilha \`${id}\` não encontrada. Use \`/trilha --listar\` para ver os IDs disponíveis.`;
  }
  return `## 🔍 Detalhes da Trilha\n\n${formatarCardTrilha(trilha)}`;
}

function buscarPorNivel(nivel: string): string {
  try {
    const trilhas = filtrarTrilhas({ nivel });
    if (trilhas.length === 0) {
      return `⚠️ Nenhuma trilha encontrada para o nível **${nivel}**.`;
    }
    return `## 🎯 Trilhas — Nível: ${trilhas[0].nivel}\n\n${formatarListaTrilhas(trilhas)}`;
  } catch (e: unknown) {
    if (e instanceof ValidationError) return `❌ ${e.message}`;
    throw e;
  }
}

function buscarPorTecnologia(tech: string): string {
  const trilhas = filtrarTrilhas({ tecnologia: tech });
  if (trilhas.length === 0) {
    return `⚠️ Nenhuma trilha encontrada com a tecnologia **${tech}**.`;
  }
  return `## 🛠️ Trilhas com "${tech}"\n\n${formatarListaTrilhas(trilhas)}`;
}

function buscarPorCategoria(categoria: string): string {
  const trilhas = filtrarTrilhas({ categoria });
  if (trilhas.length === 0) {
    return `⚠️ Nenhuma trilha encontrada para a categoria **${categoria}**.`;
  }
  return `## 📂 Trilhas — Categoria: ${trilhas[0].categoria}\n\n${formatarListaTrilhas(trilhas)}`;
}

function buscaLivre(termo: string): string {
  const lower = termo.toLowerCase();
  const trilhas = listarTrilhas().filter(
    (t) =>
      t.nome.toLowerCase().includes(lower) ||
      t.tecnologia.some((tec) => tec.toLowerCase().includes(lower)) ||
      t.categoria.toLowerCase().includes(lower)
  );
  if (trilhas.length === 0) {
    return `⚠️ Nenhuma trilha encontrada para **"${termo}"**. Tente \`/trilha --listar\` para ver todas.`;
  }
  return `## 🔎 Resultados para "${termo}" (${trilhas.length} trilha(s))\n\n${formatarListaTrilhas(trilhas)}`;
}
