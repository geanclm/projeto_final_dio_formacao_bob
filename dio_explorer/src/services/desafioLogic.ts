import { DesafioContexto, Trilha, ValidationError } from "../types";
import { validarIdTrilha } from "./trailService";

type Dificuldade = DesafioContexto["dificuldade"];

const DIFICULDADES_VALIDAS: Dificuldade[] = ["fácil", "médio", "difícil"];

interface DesafioTemplate {
  titulo: string;
  objetivo: string;
  entregaveis: string[];
  criterios: string[];
  xpRecompensa: number;
  badge: string;
  dica: string;
}

/** Gera um template de desafio adaptado ao nível e tecnologias da trilha. */
function gerarTemplate(trilha: Trilha, dificuldade: Dificuldade): DesafioTemplate {
  const tech = trilha.tecnologia[0] ?? "tecnologia da trilha";
  const techLista = trilha.tecnologia.slice(0, 3).join(", ");
  const xpBase = Math.round(trilha.xp_total / trilha.modulos);

  const multiplicadores: Record<Dificuldade, number> = {
    fácil: 0.5,
    médio: 1.0,
    difícil: 1.8,
  };

  const xpRecompensa = Math.round(xpBase * multiplicadores[dificuldade]);

  const templates: Record<Dificuldade, DesafioTemplate> = {
    fácil: {
      titulo: `Primeiros Passos com ${tech}`,
      objetivo: `Criar um projeto de introdução utilizando ${tech} que demonstre os conceitos fundamentais apresentados nos primeiros módulos da trilha **${trilha.nome}**.`,
      entregaveis: [
        `Repositório público no GitHub com código-fonte`,
        `README.md explicando o projeto e como executar`,
        `Pelo menos 3 funcionalidades básicas implementadas com ${tech}`,
      ],
      criterios: [
        "Código funcional e sem erros críticos",
        "README claro e objetivo",
        "Uso correto das tecnologias: " + techLista,
        "Commits organizados com mensagens descritivas",
      ],
      xpRecompensa,
      badge: trilha.badges[0] ?? "Desafio Concluído",
      dica: `💡 **Dica:** Consulte a documentação oficial de ${tech} e foque nos exemplos do módulo 1 da trilha.`,
    },
    médio: {
      titulo: `Projeto Prático: ${trilha.nome.split(" ").slice(0, 3).join(" ")}`,
      objetivo: `Desenvolver uma aplicação funcional que integre pelo menos duas tecnologias da trilha (${techLista}) e resolva um problema real do contexto de **${trilha.categoria}**.`,
      entregaveis: [
        `Repositório no GitHub com código-fonte e histórico de commits`,
        `README.md com descrição, arquitetura e instruções de instalação`,
        `Aplicação funcionando com pelo menos 5 features implementadas`,
        `Testes automatizados cobrindo as funcionalidades principais`,
      ],
      criterios: [
        "Arquitetura bem estruturada e código limpo",
        "Integração correta entre as tecnologias: " + techLista,
        "Tratamento de erros implementado",
        "Testes com cobertura mínima de 60%",
        "Documentação técnica no README",
      ],
      xpRecompensa,
      badge: trilha.badges[1] ?? trilha.badges[0] ?? "Desafio Intermediário",
      dica: `💡 **Dica:** Aplique os padrões de projeto ensinados nos módulos intermediários. Use os projetos dos instrutores (${trilha.instrutores.join(", ")}) como referência.`,
    },
    difícil: {
      titulo: `Desafio Avançado: Sistema Completo com ${techLista}`,
      objetivo: `Projetar e implementar uma solução completa e de produção utilizando todas as tecnologias da trilha **${trilha.nome}** (${trilha.tecnologia.join(", ")}), demonstrando domínio dos conceitos avançados.`,
      entregaveis: [
        `Repositório no GitHub com código-fonte, CI/CD e documentação completa`,
        `README.md com arquitetura, decisões técnicas e demonstração`,
        `Sistema funcional com deploy em ambiente de nuvem (link obrigatório)`,
        `Cobertura de testes acima de 80%`,
        `Apresentação em vídeo (3–5 min) demonstrando o projeto`,
        `Diagrama de arquitetura da solução`,
      ],
      criterios: [
        "Solução escalável e segura",
        "Uso avançado de: " + trilha.tecnologia.join(", "),
        "Deploy funcional em produção",
        "Qualidade de código (linting, formatação, documentação inline)",
        "Cobertura de testes ≥ 80%",
        "Inovação e criatividade na solução proposta",
      ],
      xpRecompensa,
      badge: trilha.badges[trilha.badges.length - 1] ?? "Expert Badge",
      dica: `💡 **Dica:** Explore os ${trilha.lives_ao_vivo} lives ao vivo da trilha — eles cobrem cenários reais de mercado. Candidate-se ao peer review da comunidade DIO.`,
    },
  };

  return templates[dificuldade];
}

/** Formata o desafio em Markdown. */
function formatarDesafio(ctx: DesafioContexto, template: DesafioTemplate): string {
  const NIVEL_DIFI: Record<Dificuldade, string> = {
    fácil: "🟢 Fácil",
    médio: "🟡 Médio",
    difícil: "🔴 Difícil",
  };

  const entregaveisStr = template.entregaveis.map((e) => `- [ ] ${e}`).join("\n");
  const criteriosStr = template.criterios.map((c) => `- ✅ ${c}`).join("\n");

  return [
    `## 🏆 Desafio — ${template.titulo}`,
    "",
    `| Campo | Info |`,
    `|-------|------|`,
    `| 🎓 Trilha | ${ctx.trilha.nome} \`${ctx.trilha.id}\` |`,
    `| 📂 Categoria | ${ctx.trilha.categoria} |`,
    `| ⚡ Dificuldade | ${NIVEL_DIFI[ctx.dificuldade]} |`,
    `| 💎 Recompensa | **${template.xpRecompensa.toLocaleString("pt-BR")} XP** |`,
    `| 🏅 Badge ao Concluir | ${template.badge} |`,
    "",
    `### 🎯 Objetivo`,
    template.objetivo,
    "",
    `### 📦 Entregáveis`,
    entregaveisStr,
    "",
    `### 📊 Critérios de Avaliação`,
    criteriosStr,
    "",
    template.dica,
    "",
    `---`,
    `> 🚀 Submeta seu projeto no perfil da DIO e compartilhe na comunidade com a hashtag \`#DIOChallenge\``,
  ].join("\n");
}

/** Lógica principal do comando /desafio. */
export function executarDesafio(args: string[]): string {
  if (args.length === 0 || args[0] === "--ajuda") {
    return ajudaDesafio();
  }

  let idTrilha: string | undefined;
  let dificuldade: Dificuldade = "médio";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--id" && args[i + 1]) {
      idTrilha = args[++i];
    } else if (args[i] === "--dificuldade" && args[i + 1]) {
      const d = args[++i].toLowerCase() as Dificuldade;
      if (!DIFICULDADES_VALIDAS.includes(d)) {
        return `❌ Dificuldade inválida: **"${d}"**. Use: ${DIFICULDADES_VALIDAS.join(", ")}.`;
      }
      dificuldade = d;
    } else if (!args[i].startsWith("--")) {
      // argumento posicional: ID da trilha
      idTrilha = args[i];
    }
  }

  if (!idTrilha) {
    return `❌ Informe o ID da trilha. Exemplo: \`/desafio --id TRL-001\`\nUse \`/trilha --listar\` para ver os IDs disponíveis.`;
  }

  try {
    const trilha = validarIdTrilha(idTrilha);
    const template = gerarTemplate(trilha, dificuldade);
    const ctx: DesafioContexto = { trilha, dificuldade };
    return formatarDesafio(ctx, template);
  } catch (e: unknown) {
    if (e instanceof ValidationError) return `❌ ${e.message}`;
    throw e;
  }
}

function ajudaDesafio(): string {
  return [
    "## 🏆 Comando `/desafio` — Gerador de Desafios DIO",
    "",
    "Gera um desafio prático personalizado para uma trilha específica.",
    "",
    "### Uso",
    "```",
    "/desafio --id <ID>                          — Desafio médio para a trilha",
    "/desafio --id <ID> --dificuldade <nivel>    — Desafio com dificuldade específica",
    "/desafio <ID>                               — Forma abreviada",
    "```",
    "",
    "### Dificuldades disponíveis",
    "| Código | Descrição |",
    "|--------|-----------|",
    "| `fácil` | Projeto introdutório, conceitos básicos |",
    "| `médio` | Aplicação funcional com integração de tecnologias |",
    "| `difícil` | Sistema completo com deploy e testes avançados |",
    "",
    "### Exemplos",
    "```",
    "/desafio --id TRL-001",
    "/desafio --id TRL-005 --dificuldade difícil",
    "/desafio TRL-003 --dificuldade fácil",
    "```",
  ].join("\n");
}
