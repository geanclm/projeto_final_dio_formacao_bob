/**
 * Testes Unitários — trailService
 * Cobre: carregarTrilhas, listarTrilhas, buscarPorId, filtrarTrilhas,
 *         listarCategorias, listarNiveis, validarIdTrilha
 */

import {
  buscarPorId,
  carregarTrilhas,
  filtrarTrilhas,
  listarCategorias,
  listarNiveis,
  listarTrilhas,
  validarIdTrilha,
} from "../../src/services/trailService";
import { ValidationError } from "../../src/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const TOTAL_TRILHAS = 30;
const ID_JAVA = "TRL-005";
const ID_INEXISTENTE = "TRL-999";

// ─────────────────────────────────────────────────────────────────────────────
// carregarTrilhas / listarTrilhas
// ─────────────────────────────────────────────────────────────────────────────
describe("carregarTrilhas()", () => {
  it("retorna um array não vazio", () => {
    const trilhas = carregarTrilhas();
    expect(Array.isArray(trilhas)).toBe(true);
    expect(trilhas.length).toBeGreaterThan(0);
  });

  it(`retorna exatamente ${TOTAL_TRILHAS} trilhas`, () => {
    expect(carregarTrilhas().length).toBe(TOTAL_TRILHAS);
  });

  it("cada trilha possui os campos obrigatórios", () => {
    const campos = [
      "id","nome","descricao","tecnologia","nivel","duracao_horas",
      "modulos","xp_total","instrutores","badges","promocoes",
      "vitalicio","lives_ao_vivo","categoria","data_lancamento",
    ] as const;
    carregarTrilhas().forEach((t) => {
      campos.forEach((c) => expect(t).toHaveProperty(c));
    });
  });

  it("retorna o mesmo array nas chamadas seguintes (cache)", () => {
    expect(carregarTrilhas()).toBe(listarTrilhas());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// buscarPorId
// ─────────────────────────────────────────────────────────────────────────────
describe("buscarPorId()", () => {
  it("encontra a trilha Java por ID exato", () => {
    const t = buscarPorId(ID_JAVA);
    expect(t).toBeDefined();
    expect(t!.id).toBe(ID_JAVA);
    expect(t!.nome).toContain("Java");
  });

  it("é case-insensitive (trl-005 == TRL-005)", () => {
    expect(buscarPorId("trl-005")).toBeDefined();
    expect(buscarPorId("TRL-005")).toBeDefined();
  });

  it("ignora espaços em branco no ID", () => {
    expect(buscarPorId("  TRL-005  ")).toBeDefined();
  });

  it("retorna undefined para ID inexistente", () => {
    expect(buscarPorId(ID_INEXISTENTE)).toBeUndefined();
  });

  it("retorna undefined para string vazia", () => {
    expect(buscarPorId("")).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// filtrarTrilhas
// ─────────────────────────────────────────────────────────────────────────────
describe("filtrarTrilhas()", () => {
  it("sem filtros retorna todas as trilhas", () => {
    expect(filtrarTrilhas({}).length).toBe(TOTAL_TRILHAS);
  });

  it("filtra por ID retorna exatamente 1 trilha", () => {
    const resultado = filtrarTrilhas({ id: ID_JAVA });
    expect(resultado.length).toBe(1);
    expect(resultado[0].id).toBe(ID_JAVA);
  });

  it("filtra por ID inexistente retorna array vazio", () => {
    expect(filtrarTrilhas({ id: ID_INEXISTENTE })).toHaveLength(0);
  });

  it("filtra por nível Iniciante", () => {
    const resultado = filtrarTrilhas({ nivel: "Iniciante" });
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((t) => expect(t.nivel).toBe("Iniciante"));
  });

  it("filtra por nível Avançado", () => {
    const resultado = filtrarTrilhas({ nivel: "Avançado" });
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((t) => expect(t.nivel).toBe("Avançado"));
  });

  it("lança ValidationError para nível completamente inválido", () => {
    expect(() => filtrarTrilhas({ nivel: "Deus" })).toThrow(ValidationError);
  });

  it("filtra por tecnologia Java (parcial, case-insensitive)", () => {
    const resultado = filtrarTrilhas({ tecnologia: "java" });
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((t) =>
      expect(t.tecnologia.some((tec) => tec.toLowerCase().includes("java"))).toBe(true)
    );
  });

  it("filtra por tecnologia inexistente retorna array vazio", () => {
    expect(filtrarTrilhas({ tecnologia: "COBOL_NAO_EXISTE" })).toHaveLength(0);
  });

  it("filtra por categoria Cloud", () => {
    const resultado = filtrarTrilhas({ categoria: "cloud" });
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((t) =>
      expect(t.categoria.toLowerCase()).toContain("cloud")
    );
  });

  it("combina filtros: nivel + tecnologia", () => {
    const resultado = filtrarTrilhas({ nivel: "Intermediário", tecnologia: "Java" });
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach((t) => {
      expect(t.nivel).toBe("Intermediário");
      expect(t.tecnologia.some((tec) => tec.toLowerCase().includes("java"))).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// listarCategorias / listarNiveis
// ─────────────────────────────────────────────────────────────────────────────
describe("listarCategorias()", () => {
  it("retorna array não vazio de strings únicas ordenadas", () => {
    const cats = listarCategorias();
    expect(cats.length).toBeGreaterThan(0);
    const unique = new Set(cats);
    expect(unique.size).toBe(cats.length);
    expect(cats).toEqual([...cats].sort());
  });
});

describe("listarNiveis()", () => {
  it("retorna os três níveis esperados", () => {
    const niveis = listarNiveis();
    expect(niveis).toContain("Iniciante");
    expect(niveis).toContain("Intermediário");
    expect(niveis).toContain("Avançado");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validarIdTrilha
// ─────────────────────────────────────────────────────────────────────────────
describe("validarIdTrilha()", () => {
  it("retorna a trilha quando ID existe", () => {
    const t = validarIdTrilha(ID_JAVA);
    expect(t.id).toBe(ID_JAVA);
  });

  it("lança ValidationError para ID inexistente", () => {
    expect(() => validarIdTrilha(ID_INEXISTENTE)).toThrow(ValidationError);
    expect(() => validarIdTrilha(ID_INEXISTENTE)).toThrow(/não encontrada/);
  });

  it("mensagem de erro contém o ID informado", () => {
    try {
      validarIdTrilha("TRL-XYZ");
    } catch (e) {
      expect((e as Error).message).toContain("TRL-XYZ");
    }
  });
});
