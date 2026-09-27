/**
 * Testes Unitários — trilhaLogic / executarTrilha
 * Cobre: ajuda, --listar, --listar com filtros, --id, --nivel,
 *         --tecnologia, --categoria, busca livre, erros de validação
 */

import { executarTrilha, formatarCardTrilha, formatarListaTrilhas } from "../../src/services/trilhaLogic";
import { TRILHA_JAVA, TRILHA_INICIANTE, TRILHA_NAO_VITALICIA, TRILHA_SEM_PROMO } from "../fixtures/trilha-java";

// ─────────────────────────────────────────────────────────────────────────────
// formatarCardTrilha
// ─────────────────────────────────────────────────────────────────────────────
describe("formatarCardTrilha()", () => {
  it("contém o ID e nome da trilha", () => {
    const card = formatarCardTrilha(TRILHA_JAVA);
    expect(card).toContain("TRL-005");
    expect(card).toContain("Desenvolvedor Full Stack Java");
  });

  it("exibe emoji 🟡 para nível Intermediário", () => {
    expect(formatarCardTrilha(TRILHA_JAVA)).toContain("🟡");
  });

  it("exibe emoji 🟢 para nível Iniciante", () => {
    expect(formatarCardTrilha(TRILHA_INICIANTE)).toContain("🟢");
  });

  it("exibe emoji 🔴 para nível Avançado", () => {
    expect(formatarCardTrilha(TRILHA_SEM_PROMO)).toContain("🔴");
  });

  it("mostra '✅ Vitalício' quando vitalicio = true", () => {
    expect(formatarCardTrilha(TRILHA_JAVA)).toContain("✅ Vitalício");
  });

  it("mostra '⏳ Por tempo limitado' quando vitalicio = false", () => {
    expect(formatarCardTrilha(TRILHA_NAO_VITALICIA)).toContain("⏳ Por tempo limitado");
  });

  it("mostra promoção ativa com percentual", () => {
    const card = formatarCardTrilha(TRILHA_JAVA);
    expect(card).toContain("25% de desconto");
    expect(card).toContain("2025-08-31");
  });

  it("mostra 'Sem promoção ativa' quando desconto = 0", () => {
    expect(formatarCardTrilha(TRILHA_SEM_PROMO)).toContain("Sem promoção ativa");
  });

  it("lista as tecnologias da trilha", () => {
    const card = formatarCardTrilha(TRILHA_JAVA);
    expect(card).toContain("Java");
    expect(card).toContain("Spring Boot");
  });

  it("lista os instrutores", () => {
    const card = formatarCardTrilha(TRILHA_JAVA);
    expect(card).toContain("Bruno Rodrigues");
    expect(card).toContain("Patricia Mendes");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// formatarListaTrilhas
// ─────────────────────────────────────────────────────────────────────────────
describe("formatarListaTrilhas()", () => {
  it("formata array de trilhas com marcadores", () => {
    const saida = formatarListaTrilhas([TRILHA_JAVA, TRILHA_INICIANTE]);
    expect(saida).toContain("TRL-005");
    expect(saida).toContain("TRL-003");
    expect(saida).toContain("- 🟡");
    expect(saida).toContain("- 🟢");
  });

  it("retorna string vazia para array vazio", () => {
    expect(formatarListaTrilhas([])).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — ajuda
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — ajuda", () => {
  it("args vazio retorna menu de ajuda", () => {
    const saida = executarTrilha([]);
    expect(saida).toContain("Assistente de Trilhas DIO");
    expect(saida).toContain("--listar");
    expect(saida).toContain("--id");
  });

  it("--ajuda retorna menu de ajuda", () => {
    const saida = executarTrilha(["--ajuda"]);
    expect(saida).toContain("Assistente de Trilhas DIO");
  });

  it("ajuda contém níveis disponíveis", () => {
    const saida = executarTrilha([]);
    expect(saida).toContain("Iniciante");
    expect(saida).toContain("Intermediário");
    expect(saida).toContain("Avançado");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — --listar
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — --listar", () => {
  it("lista todas as trilhas com cabeçalho", () => {
    const saida = executarTrilha(["--listar"]);
    expect(saida).toContain("Todas as Trilhas DIO");
    expect(saida).toContain("TRL-005");
  });

  it("--listar --nivel Iniciante filtra corretamente", () => {
    const saida = executarTrilha(["--listar", "--nivel", "Iniciante"]);
    expect(saida).toContain("Trilhas encontradas");
    expect(saida).toContain("🟢");
    expect(saida).not.toContain("🔴");
  });

  it("--listar --categoria Cloud filtra por categoria", () => {
    const saida = executarTrilha(["--listar", "--categoria", "Cloud"]);
    expect(saida).toContain("Trilhas encontradas");
  });

  it("--listar --tecnologia Java retorna trilhas Java", () => {
    const saida = executarTrilha(["--listar", "--tecnologia", "Java"]);
    expect(saida).toContain("TRL-005");
  });

  it("--listar com nível inválido retorna mensagem de erro", () => {
    const saida = executarTrilha(["--listar", "--nivel", "Mestre"]);
    expect(saida).toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — --id
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — --id", () => {
  it("--id TRL-005 retorna detalhes da trilha Java", () => {
    const saida = executarTrilha(["--id", "TRL-005"]);
    expect(saida).toContain("🔍 Detalhes da Trilha");
    expect(saida).toContain("Desenvolvedor Full Stack Java");
    expect(saida).toContain("TRL-005");
  });

  it("--id inexistente retorna mensagem de erro formatada", () => {
    const saida = executarTrilha(["--id", "TRL-999"]);
    expect(saida).toContain("❌");
    expect(saida).toContain("TRL-999");
    expect(saida).toContain("não encontrada");
  });

  it("card gerado contém dados corretos da trilha Java", () => {
    const saida = executarTrilha(["--id", "TRL-005"]);
    expect(saida).toContain("120");       // duracao_horas
    expect(saida).toContain("20");        // modulos
    expect(saida).toContain("Java");
    expect(saida).toContain("Spring Boot");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — --nivel
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — --nivel", () => {
  it("retorna trilhas do nível informado", () => {
    const saida = executarTrilha(["--nivel", "Iniciante"]);
    expect(saida).toContain("Nível: Iniciante");
    expect(saida).toContain("🟢");
  });

  it("nível inválido retorna mensagem de erro", () => {
    const saida = executarTrilha(["--nivel", "Especialista"]);
    expect(saida).toContain("❌");
    expect(saida).toContain("não encontrado");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — --tecnologia
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — --tecnologia", () => {
  it("retorna trilhas com Java", () => {
    const saida = executarTrilha(["--tecnologia", "Java"]);
    expect(saida).toContain("Java");
    expect(saida).toContain("TRL-005");
  });

  it("tecnologia inexistente retorna aviso ⚠️", () => {
    const saida = executarTrilha(["--tecnologia", "COBOL_FORA"]);
    expect(saida).toContain("⚠️");
    expect(saida).toContain("COBOL_FORA");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — --categoria
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — --categoria", () => {
  it("retorna trilhas de Back-end", () => {
    const saida = executarTrilha(["--categoria", "Back-end"]);
    expect(saida).toContain("Categoria");
    expect(saida).toContain("TRL-005");
  });

  it("categoria inexistente retorna aviso ⚠️", () => {
    const saida = executarTrilha(["--categoria", "Categoria_Inexistente_XYZ"]);
    expect(saida).toContain("⚠️");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// executarTrilha — busca livre
// ─────────────────────────────────────────────────────────────────────────────
describe("executarTrilha() — busca livre", () => {
  it("encontra trilhas por termo Java", () => {
    const saida = executarTrilha(["Java"]);
    expect(saida).toContain("Resultados para");
    expect(saida).toContain("TRL-005");
  });

  it("busca sem resultado retorna aviso ⚠️", () => {
    const saida = executarTrilha(["termoqueNaoExiste99"]);
    expect(saida).toContain("⚠️");
    expect(saida).toContain("termoqueNaoExiste99");
  });

  it("múltiplos termos são concatenados e buscados", () => {
    const saida = executarTrilha(["machine", "learning"]);
    expect(saida).toContain("machine learning");
  });
});
