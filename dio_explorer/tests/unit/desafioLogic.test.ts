/**
 * Testes Unitários — desafioLogic / executarDesafio
 * Cobre: ajuda, geração de desafio por dificuldade, cálculo de XP,
 *        validação de ID, validação de dificuldade, forma abreviada
 */

import { executarDesafio } from "../../src/services/desafioLogic";

const ID_JAVA = "TRL-005";
const ID_INICIANTE = "TRL-003";
const ID_INVALIDO = "TRL-999";

// ─────────────────────────────────────────────────────────────────────────────
// ajuda
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — ajuda", () => {
  it("args vazio retorna menu de ajuda", () => {
    const saida = executarDesafio([]);
    expect(saida).toContain("Gerador de Desafios DIO");
    expect(saida).toContain("--id");
    expect(saida).toContain("--dificuldade");
  });

  it("--ajuda retorna menu de ajuda", () => {
    expect(executarDesafio(["--ajuda"])).toContain("Gerador de Desafios DIO");
  });

  it("ajuda lista as três dificuldades", () => {
    const saida = executarDesafio([]);
    expect(saida).toContain("fácil");
    expect(saida).toContain("médio");
    expect(saida).toContain("difícil");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sem --id
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — sem --id", () => {
  it("retorna erro ❌ quando --id não é informado", () => {
    const saida = executarDesafio(["--dificuldade", "médio"]);
    expect(saida).toContain("❌");
    expect(saida).toContain("Informe o ID da trilha");
  });

  it("retorna erro ❌ com apenas flag desconhecida", () => {
    const saida = executarDesafio(["--foo"]);
    expect(saida).toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ID inválido
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — ID inválido", () => {
  it("retorna erro ❌ para ID inexistente", () => {
    const saida = executarDesafio(["--id", ID_INVALIDO]);
    expect(saida).toContain("❌");
    expect(saida).toContain(ID_INVALIDO);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dificuldade inválida
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — dificuldade inválida", () => {
  it("retorna erro ❌ para dificuldade 'super'", () => {
    const saida = executarDesafio(["--id", ID_JAVA, "--dificuldade", "super"]);
    expect(saida).toContain("❌");
    expect(saida).toContain("Dificuldade inválida");
    expect(saida).toContain("super");
  });

  it("retorna erro ❌ para dificuldade vazia string", () => {
    const saida = executarDesafio(["--id", ID_JAVA, "--dificuldade", ""]);
    expect(saida).toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dificuldade fácil
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — dificuldade fácil", () => {
  let saida: string;
  beforeAll(() => {
    saida = executarDesafio(["--id", ID_JAVA, "--dificuldade", "fácil"]);
  });

  it("contém cabeçalho do desafio", () => {
    expect(saida).toContain("🏆 Desafio");
  });

  it("contém 'Fácil' na tabela", () => {
    expect(saida).toContain("🟢 Fácil");
  });

  it("contém o ID e nome da trilha Java", () => {
    expect(saida).toContain("TRL-005");
    expect(saida).toContain("Desenvolvedor Full Stack Java");
  });

  it("contém entregáveis como checklist", () => {
    expect(saida).toContain("- [ ]");
  });

  it("contém critérios de avaliação", () => {
    expect(saida).toContain("- ✅");
  });

  it("contém hashtag DIOChallenge", () => {
    expect(saida).toContain("#DIOChallenge");
  });

  it("XP de recompensa é metade do xp por módulo (0.5×)", () => {
    // TRL-005: xp_total=12000, modulos=20 → base=600 → fácil=300
    expect(saida).toContain("300");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dificuldade médio (padrão)
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — dificuldade médio (padrão)", () => {
  let saida: string;
  beforeAll(() => {
    saida = executarDesafio(["--id", ID_JAVA]);
  });

  it("dificuldade padrão é médio", () => {
    expect(saida).toContain("🟡 Médio");
  });

  it("contém pelo menos 4 entregáveis no médio", () => {
    const count = (saida.match(/- \[ \]/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(4);
  });

  it("XP de recompensa é 1× o xp por módulo", () => {
    // TRL-005: xp_total=12000, modulos=20 → base=600 → médio=600
    expect(saida).toContain("600");
  });

  it("menciona tecnologias da trilha Java no objetivo", () => {
    expect(saida).toContain("Java");
    expect(saida).toContain("Spring Boot");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dificuldade difícil
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — dificuldade difícil", () => {
  let saida: string;
  beforeAll(() => {
    saida = executarDesafio(["--id", ID_JAVA, "--dificuldade", "difícil"]);
  });

  it("contém 'Difícil' na tabela", () => {
    expect(saida).toContain("🔴 Difícil");
  });

  it("exige deploy em produção no entregável", () => {
    expect(saida).toContain("deploy");
  });

  it("exige cobertura de testes ≥ 80%", () => {
    expect(saida).toContain("80%");
  });

  it("XP de recompensa é 1.8× o xp por módulo", () => {
    // TRL-005: xp_total=12000, modulos=20 → base=600 → difícil=1080
    expect(saida).toContain("1");   // 1.080
    expect(saida).toContain("080");
  });

  it("tem 6 entregáveis no difícil", () => {
    const count = (saida.match(/- \[ \]/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// forma abreviada (ID posicional)
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — forma abreviada", () => {
  it("aceita ID posicional sem --id", () => {
    const saida = executarDesafio([ID_JAVA]);
    expect(saida).toContain("🏆 Desafio");
    expect(saida).toContain("TRL-005");
  });

  it("aceita ID posicional + --dificuldade", () => {
    const saida = executarDesafio([ID_INICIANTE, "--dificuldade", "fácil"]);
    expect(saida).toContain("TRL-003");
    expect(saida).toContain("🟢 Fácil");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// trilha iniciante
// ─────────────────────────────────────────────────────────────────────────────
describe("executarDesafio() — trilha Iniciante (TRL-003)", () => {
  it("gera desafio para trilha de nível Iniciante", () => {
    const saida = executarDesafio(["--id", ID_INICIANTE]);
    expect(saida).toContain("TRL-003");
    expect(saida).toContain("AWS");
  });

  it("badge ao concluir é da trilha AWS", () => {
    const saida = executarDesafio(["--id", ID_INICIANTE, "--dificuldade", "fácil"]);
    expect(saida).toContain("AWS Beginner");
  });
});
