/**
 * Testes Unitários — commandRegistry / dispatch
 * Cobre: registro, getCommand, dispatch válido/inválido, /ajuda, comando não encontrado
 *
 * IMPORTANTE: importar commandRegistry inicializa o módulo e registra os três
 * comandos padrão. Os testes rodam na mesma instância do registry (singleton),
 * por isso verificamos presença sem assumir exclusividade.
 */

import { dispatch, getCommand, getCommands } from "../../src/commandRegistry";

// ─────────────────────────────────────────────────────────────────────────────
// Registry — estado inicial
// ─────────────────────────────────────────────────────────────────────────────
describe("commandRegistry — estado inicial", () => {
  it("três comandos padrão estão registrados", () => {
    const names = getCommands().map((c) => c.name);
    expect(names).toContain("trilha");
    expect(names).toContain("desafio");
    expect(names).toContain("certificado");
  });

  it("getCommand('trilha') retorna o comando correto", () => {
    const cmd = getCommand("trilha");
    expect(cmd).toBeDefined();
    expect(cmd!.name).toBe("trilha");
  });

  it("getCommand é case-insensitive", () => {
    expect(getCommand("TRILHA")).toBeDefined();
    expect(getCommand("Desafio")).toBeDefined();
  });

  it("getCommand de nome inexistente retorna undefined", () => {
    expect(getCommand("nao_existe_xyz")).toBeUndefined();
  });

  it("cada comando registrado tem description, usage e examples preenchidos", () => {
    getCommands().forEach((c) => {
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.usage.length).toBeGreaterThan(0);
      expect(Array.isArray(c.examples)).toBe(true);
      expect(c.examples.length).toBeGreaterThan(0);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — entrada inválida
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — entrada inválida", () => {
  it("string sem / retorna success=false", () => {
    const r = dispatch("trilha");
    expect(r.success).toBe(false);
    expect(r.output).toContain("❌");
    expect(r.output).toContain("devem começar com");
  });

  it("string vazia retorna success=false", () => {
    expect(dispatch("").success).toBe(false);
  });

  it("espaços apenas retornam success=false", () => {
    expect(dispatch("   ").success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — comando não encontrado
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — comando não encontrado", () => {
  it("comando inexistente retorna success=false com lista disponível", () => {
    const r = dispatch("/naoexiste");
    expect(r.success).toBe(false);
    expect(r.output).toContain("❌");
    expect(r.output).toContain("não encontrado");
    expect(r.output).toContain("/trilha");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — /ajuda e /help
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — /ajuda e /help", () => {
  it("/ajuda retorna success=true", () => {
    expect(dispatch("/ajuda").success).toBe(true);
  });

  it("/ajuda contém os três comandos", () => {
    const r = dispatch("/ajuda");
    expect(r.output).toContain("/trilha");
    expect(r.output).toContain("/desafio");
    expect(r.output).toContain("/certificado");
  });

  it("/help é alias de /ajuda", () => {
    const ajuda = dispatch("/ajuda");
    const help = dispatch("/help");
    expect(ajuda.success).toBe(help.success);
    expect(ajuda.output).toBe(help.output);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — /trilha
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — /trilha", () => {
  it("/trilha retorna success=true (modo ajuda)", () => {
    expect(dispatch("/trilha").success).toBe(true);
  });

  it("/trilha --listar retorna success=true", () => {
    expect(dispatch("/trilha --listar").success).toBe(true);
  });

  it("/trilha --id TRL-005 retorna success=true", () => {
    const r = dispatch("/trilha --id TRL-005");
    expect(r.success).toBe(true);
    expect(r.output).toContain("TRL-005");
  });

  it("/trilha --id TRL-999 retorna success=true com mensagem de erro no output", () => {
    // O handler de /trilha absorve erros e retorna success=true com ❌
    const r = dispatch("/trilha --id TRL-999");
    expect(r.output).toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — /desafio
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — /desafio", () => {
  it("/desafio sem args retorna success=true (modo ajuda)", () => {
    expect(dispatch("/desafio").success).toBe(true);
  });

  it("/desafio --id TRL-005 retorna success=true", () => {
    const r = dispatch("/desafio --id TRL-005");
    expect(r.success).toBe(true);
    expect(r.output).toContain("🏆 Desafio");
  });

  it("/desafio --id TRL-999 retorna erro no output", () => {
    const r = dispatch("/desafio --id TRL-999");
    expect(r.output).toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — /certificado
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — /certificado", () => {
  it("/certificado sem args retorna success=true (modo ajuda)", () => {
    expect(dispatch("/certificado").success).toBe(true);
  });

  it("/certificado --id TRL-005 --nome Gean Lima retorna success=true", () => {
    const r = dispatch("/certificado --id TRL-005 --nome Gean Lima");
    expect(r.success).toBe(true);
    expect(r.output).toContain("Gean Lima");
    expect(r.output).toContain("DIO-CERT-");
  });

  it("/certificado --id TRL-999 --nome Gean Lima retorna erro no output", () => {
    const r = dispatch("/certificado --id TRL-999 --nome Gean Lima");
    expect(r.output).toContain("❌");
  });

  it("/certificado com nome inválido retorna erro no output", () => {
    const r = dispatch("/certificado --id TRL-005 --nome A");
    expect(r.output).toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — trimming e case
// ─────────────────────────────────────────────────────────────────────────────
describe("dispatch() — normalização de entrada", () => {
  it("espaços extras ao redor são ignorados", () => {
    const r = dispatch("  /trilha --listar  ");
    expect(r.success).toBe(true);
  });

  it("nome do comando em maiúsculas é aceito", () => {
    const r = dispatch("/TRILHA --listar");
    expect(r.success).toBe(true);
  });
});
