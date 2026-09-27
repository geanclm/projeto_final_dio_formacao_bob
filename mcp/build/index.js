#!/usr/bin/env node
/**
 * DIO Explorer — MCP Server
 *
 * Exposes the three core slash-command capabilities (trilha, desafio, certificado)
 * as MCP tools so any MCP-compatible client (IBM Bob, Claude Desktop, etc.) can
 * call them via stdio, HTTPS/SSE or any other MCP transport.
 *
 * Transport: stdio (default). For HTTP/SSE wrap with a StreamableHTTPServerTransport.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { z } from "zod";
// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Data file is copied alongside the build — see package.json "files"
const DATA_PATH = resolve(__dirname, "../data/trilhas_dio.json");
// ---------------------------------------------------------------------------
// Data layer
// ---------------------------------------------------------------------------
let _cache = null;
function carregarTrilhas() {
    if (_cache)
        return _cache;
    _cache = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
    return _cache;
}
function buscarPorId(id) {
    return carregarTrilhas().find((t) => t.id.toUpperCase() === id.trim().toUpperCase());
}
function filtrarTrilhas(opts) {
    let trilhas = carregarTrilhas();
    if (opts.nivel)
        trilhas = trilhas.filter((t) => t.nivel.toLowerCase().includes(opts.nivel.toLowerCase()));
    if (opts.tecnologia)
        trilhas = trilhas.filter((t) => t.tecnologia.some((tec) => tec.toLowerCase().includes(opts.tecnologia.toLowerCase())));
    if (opts.categoria)
        trilhas = trilhas.filter((t) => t.categoria.toLowerCase().includes(opts.categoria.toLowerCase()));
    return trilhas;
}
// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const NIVEL_EMOJI = {
    iniciante: "🟢",
    intermediário: "🟡",
    avançado: "🔴",
};
function nivelEmoji(nivel) {
    return NIVEL_EMOJI[nivel.toLowerCase()] ?? "⚪";
}
function formatarCardTrilha(t) {
    const emoji = nivelEmoji(t.nivel);
    const { desconto_percentual, validade } = t.promocoes;
    const promo = desconto_percentual === 0
        ? "Sem promoção ativa"
        : `${desconto_percentual}% de desconto${validade ? ` (válido até ${validade})` : ""}`;
    const acesso = t.vitalicio ? "Vitalício" : "Por tempo limitado";
    return [
        `### ${emoji} ${t.nome} [${t.id}]`,
        `> ${t.descricao}`,
        "",
        `| Campo | Detalhe |`,
        `|-------|---------|`,
        `| Categoria | ${t.categoria} |`,
        `| Nível | ${t.nivel} |`,
        `| Duração | ${t.duracao_horas}h em ${t.modulos} módulos |`,
        `| XP Total | ${t.xp_total.toLocaleString("pt-BR")} XP |`,
        `| Lives ao Vivo | ${t.lives_ao_vivo} |`,
        `| Acesso | ${acesso} |`,
        `| Lançamento | ${t.data_lancamento} |`,
        "",
        `**Tecnologias:** ${t.tecnologia.join(" · ")}`,
        `**Badges:** ${t.badges.join(", ")}`,
        `**Instrutores:** ${t.instrutores.join(", ")}`,
        `**Promoção:** ${promo}`,
    ].join("\n");
}
function formatarListaTrilhas(trilhas) {
    return trilhas
        .map((t) => `- ${nivelEmoji(t.nivel)} **${t.nome}** [${t.id}] — ${t.categoria} · ${t.nivel} · ${t.duracao_horas}h`)
        .join("\n");
}
function gerarDesafio(trilha, dificuldade) {
    const tech = trilha.tecnologia[0] ?? "tecnologia da trilha";
    const techLista = trilha.tecnologia.slice(0, 3).join(", ");
    const xpBase = Math.round(trilha.xp_total / trilha.modulos);
    const mult = { fácil: 0.5, médio: 1.0, difícil: 1.8 };
    const xp = Math.round(xpBase * mult[dificuldade]);
    const LEVEL_LABEL = {
        fácil: "🟢 Fácil",
        médio: "🟡 Médio",
        difícil: "🔴 Difícil",
    };
    const templates = {
        fácil: {
            titulo: `Primeiros Passos com ${tech}`,
            objetivo: `Criar um projeto de introdução utilizando ${tech} que demonstre os conceitos fundamentais apresentados nos primeiros módulos da trilha **${trilha.nome}**.`,
            entregaveis: [
                "Repositório público no GitHub com código-fonte",
                "README.md explicando o projeto e como executar",
                `Pelo menos 3 funcionalidades básicas implementadas com ${tech}`,
            ],
            criterios: [
                "Código funcional e sem erros críticos",
                "README claro e objetivo",
                `Uso correto das tecnologias: ${techLista}`,
                "Commits organizados com mensagens descritivas",
            ],
            badge: trilha.badges[0] ?? "Desafio Concluído",
            dica: `Consulte a documentação oficial de ${tech} e foque nos exemplos do módulo 1 da trilha.`,
        },
        médio: {
            titulo: `Projeto Prático: ${trilha.nome.split(" ").slice(0, 3).join(" ")}`,
            objetivo: `Desenvolver uma aplicação funcional que integre pelo menos duas tecnologias da trilha (${techLista}) e resolva um problema real do contexto de **${trilha.categoria}**.`,
            entregaveis: [
                "Repositório no GitHub com código-fonte e histórico de commits",
                "README.md com descrição, arquitetura e instruções de instalação",
                "Aplicação funcionando com pelo menos 5 features implementadas",
                "Testes automatizados cobrindo as funcionalidades principais",
            ],
            criterios: [
                "Arquitetura bem estruturada e código limpo",
                `Integração correta entre as tecnologias: ${techLista}`,
                "Tratamento de erros implementado",
                "Testes com cobertura mínima de 60%",
                "Documentação técnica no README",
            ],
            badge: trilha.badges[1] ?? trilha.badges[0] ?? "Desafio Intermediário",
            dica: `Aplique os padrões de projeto ensinados nos módulos intermediários. Use os projetos dos instrutores (${trilha.instrutores.join(", ")}) como referência.`,
        },
        difícil: {
            titulo: `Desafio Avançado: Sistema Completo com ${techLista}`,
            objetivo: `Projetar e implementar uma solução completa e de produção utilizando todas as tecnologias da trilha **${trilha.nome}** (${trilha.tecnologia.join(", ")}), demonstrando domínio dos conceitos avançados.`,
            entregaveis: [
                "Repositório no GitHub com código-fonte, CI/CD e documentação completa",
                "README.md com arquitetura, decisões técnicas e demonstração",
                "Sistema funcional com deploy em ambiente de nuvem (link obrigatório)",
                "Cobertura de testes acima de 80%",
                "Apresentação em vídeo (3–5 min) demonstrando o projeto",
                "Diagrama de arquitetura da solução",
            ],
            criterios: [
                "Solução escalável e segura",
                `Uso avançado de: ${trilha.tecnologia.join(", ")}`,
                "Deploy funcional em produção",
                "Qualidade de código (linting, formatação, documentação inline)",
                "Cobertura de testes ≥ 80%",
                "Inovação e criatividade na solução proposta",
            ],
            badge: trilha.badges[trilha.badges.length - 1] ?? "Expert Badge",
            dica: `Explore os ${trilha.lives_ao_vivo} lives ao vivo da trilha — eles cobrem cenários reais de mercado. Candidate-se ao peer review da comunidade DIO.`,
        },
    };
    const tmpl = templates[dificuldade];
    const entregaveisStr = tmpl.entregaveis.map((e) => `- [ ] ${e}`).join("\n");
    const criteriosStr = tmpl.criterios.map((c) => `- ✅ ${c}`).join("\n");
    return [
        `## 🏆 Desafio — ${tmpl.titulo}`,
        "",
        `| Campo | Info |`,
        `|-------|------|`,
        `| Trilha | ${trilha.nome} [${trilha.id}] |`,
        `| Categoria | ${trilha.categoria} |`,
        `| Dificuldade | ${LEVEL_LABEL[dificuldade]} |`,
        `| Recompensa | **${xp.toLocaleString("pt-BR")} XP** |`,
        `| Badge ao Concluir | ${tmpl.badge} |`,
        "",
        `### 🎯 Objetivo`,
        tmpl.objetivo,
        "",
        `### 📦 Entregáveis`,
        entregaveisStr,
        "",
        `### 📊 Critérios de Avaliação`,
        criteriosStr,
        "",
        `> 💡 **Dica:** ${tmpl.dica}`,
        "",
        `---`,
        `> 🚀 Submeta seu projeto no perfil da DIO com a hashtag \`#DIOChallenge\``,
    ].join("\n");
}
function gerarCertificado(trilha, nomeEstudante) {
    const hoje = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
    const hash = Buffer.from(`${nomeEstudante}:${trilha.id}:${Date.now()}`)
        .toString("base64")
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase()
        .slice(0, 16);
    const numCert = `DIO-CERT-${hash}`;
    return [
        `## 🎓 Certificado de Conclusão — DIO`,
        "",
        `| Campo | Informação |`,
        `|-------|------------|`,
        `| Estudante | **${nomeEstudante}** |`,
        `| Trilha | ${trilha.nome} [${trilha.id}] |`,
        `| Categoria | ${trilha.categoria} |`,
        `| Nível | ${trilha.nivel} |`,
        `| Carga Horária | ${trilha.duracao_horas} horas |`,
        `| Módulos | ${trilha.modulos} módulos |`,
        `| XP Conquistado | ${trilha.xp_total.toLocaleString("pt-BR")} XP |`,
        `| Tecnologias | ${trilha.tecnologia.join(", ")} |`,
        `| Data de Emissão | ${hoje} |`,
        `| Número do Certificado | \`${numCert}\` |`,
        "",
        `### 🏅 Badges Conquistadas`,
        `> ${trilha.badges.map((b) => `\`${b}\``).join(" · ")}`,
        "",
        `### 👨‍🏫 Instrutores`,
        trilha.instrutores.map((i) => `- ${i}`).join("\n"),
        "",
        `---`,
        `> 📢 Compartilhe no LinkedIn com a hashtag \`#DIOCertificado\` e mencione \`@digitalinnovationone\``,
        `> 🔗 Valide o certificado em: https://www.dio.me/certificate/${numCert}`,
    ].join("\n");
}
// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------
const server = new McpServer({ name: "dio-explorer-mcp", version: "1.0.0" });
// ── Tool 1: trilha_listar ──────────────────────────────────────────────────
server.tool("trilha_listar", "Lista as trilhas de aprendizado disponíveis na DIO, com filtros opcionais por nível, tecnologia ou categoria.", {
    nivel: z
        .string()
        .optional()
        .describe('Filtra por nível de dificuldade: "Iniciante", "Intermediário" ou "Avançado"'),
    tecnologia: z
        .string()
        .optional()
        .describe('Filtra por tecnologia (ex.: "Python", "React", "AWS")'),
    categoria: z
        .string()
        .optional()
        .describe('Filtra por categoria (ex.: "IA & Machine Learning", "Cloud")'),
}, async ({ nivel, tecnologia, categoria }) => {
    const trilhas = filtrarTrilhas({ nivel, tecnologia, categoria });
    if (trilhas.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "⚠️ Nenhuma trilha encontrada para os filtros informados.",
                },
            ],
        };
    }
    const total = carregarTrilhas().length;
    const cabecalho = nivel || tecnologia || categoria
        ? `## 📋 Trilhas encontradas (${trilhas.length} de ${total})\n\n`
        : `## 📋 Todas as Trilhas DIO (${trilhas.length} trilhas)\n\n`;
    return {
        content: [{ type: "text", text: cabecalho + formatarListaTrilhas(trilhas) }],
    };
});
// ── Tool 2: trilha_detalhar ───────────────────────────────────────────────
server.tool("trilha_detalhar", "Retorna os detalhes completos de uma trilha específica a partir do seu ID (ex.: TRL-001).", {
    id: z.string().describe("ID único da trilha, ex.: TRL-001"),
}, async ({ id }) => {
    const trilha = buscarPorId(id);
    if (!trilha) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Trilha \`${id}\` não encontrada. Use a ferramenta \`trilha_listar\` para ver os IDs disponíveis.`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [
            { type: "text", text: `## 🔍 Detalhes da Trilha\n\n${formatarCardTrilha(trilha)}` },
        ],
    };
});
// ── Tool 3: desafio_gerar ─────────────────────────────────────────────────
server.tool("desafio_gerar", 'Gera um desafio prático personalizado para uma trilha. Dificuldade padrão: "médio".', {
    id: z.string().describe("ID da trilha para a qual o desafio será gerado (ex.: TRL-001)"),
    dificuldade: z
        .enum(["fácil", "médio", "difícil"])
        .optional()
        .default("médio")
        .describe('Nível do desafio: "fácil", "médio" (padrão) ou "difícil"'),
}, async ({ id, dificuldade }) => {
    const trilha = buscarPorId(id);
    if (!trilha) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Trilha \`${id}\` não encontrada. Use a ferramenta \`trilha_listar\` para ver os IDs disponíveis.`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [{ type: "text", text: gerarDesafio(trilha, dificuldade) }],
    };
});
// ── Tool 4: certificado_gerar ─────────────────────────────────────────────
server.tool("certificado_gerar", "Gera um certificado de conclusão para um estudante que completou uma trilha da DIO.", {
    id: z.string().describe("ID da trilha concluída (ex.: TRL-001)"),
    nome: z
        .string()
        .min(3)
        .max(80)
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Use apenas letras, espaços, hífens e apóstrofos.")
        .describe("Nome completo do estudante (3–80 caracteres, apenas letras)"),
}, async ({ id, nome }) => {
    const trilha = buscarPorId(id);
    if (!trilha) {
        return {
            content: [
                {
                    type: "text",
                    text: `❌ Trilha \`${id}\` não encontrada. Use a ferramenta \`trilha_listar\` para ver os IDs disponíveis.`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [{ type: "text", text: gerarCertificado(trilha, nome.trim()) }],
    };
});
// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("dio-explorer-mcp running on stdio");
}
main().catch((err) => {
    console.error("Fatal error in dio-explorer-mcp:", err);
    process.exit(1);
});
