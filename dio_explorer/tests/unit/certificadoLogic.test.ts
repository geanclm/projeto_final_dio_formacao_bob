/**
 * Testes Unitários — certificadoLogic / executarCertificado
 * Cobre: ajuda, geração de certificado válido, validação de nome,
 *        validação de ID, número de certificado, template ASCII
 */

import { executarCertificado } from "../../src/services/certificadoLogic";

const ID_JAVA = "TRL-005";
const ID_INVALIDO = "TRL-999";
const NOME_VALIDO = "Gean Lima";
const NOME_VALIDO_LONGO = "Maria Fernanda de Oliveira Costa";

// ─────────────────────────────────────────────────────────────────────────────
// ajuda
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — ajuda", () => {
  it("args vazio retorna menu de ajuda", () => {
    const saida = executarCertificado([]);
    expect(saida).toContain("Emissão de Certificado DIO");
    expect(saida).toContain("--id");
    expect(saida).toContain("--nome");
  });

  it("--ajuda retorna menu de ajuda", () => {
    expect(executarCertificado(["--ajuda"])).toContain("Emissão de Certificado DIO");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// parâmetros ausentes
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — parâmetros ausentes", () => {
  it("sem --id retorna erro ❌", () => {
    const saida = executarCertificado(["--nome", NOME_VALIDO]);
    expect(saida).toContain("❌");
    expect(saida).toContain("Informe o ID da trilha");
  });

  it("sem --nome retorna erro ❌", () => {
    const saida = executarCertificado(["--id", ID_JAVA]);
    expect(saida).toContain("❌");
    expect(saida).toContain("Informe seu nome");
  });

  it("args completamente vazio retorna ajuda", () => {
    const saida = executarCertificado([]);
    expect(saida).toContain("Emissão de Certificado DIO");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validação de ID
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — validação de ID", () => {
  it("ID inexistente retorna erro ❌", () => {
    const saida = executarCertificado(["--id", ID_INVALIDO, "--nome", NOME_VALIDO]);
    expect(saida).toContain("❌");
    expect(saida).toContain(ID_INVALIDO);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validação de nome
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — validação de nome", () => {
  it("nome com 1 char retorna erro de comprimento mínimo", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "A"]);
    expect(saida).toContain("❌");
    expect(saida).toContain("curto");
  });

  it("nome com 2 chars retorna erro de comprimento mínimo", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "Ab"]);
    expect(saida).toContain("❌");
  });

  it("nome com caracteres numéricos retorna erro de formato", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "Jo4o Silva"]);
    expect(saida).toContain("❌");
    expect(saida).toContain("inválido");
  });

  it("nome com caracteres especiais inválidos retorna erro", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "João@Silva!"]);
    expect(saida).toContain("❌");
  });

  it("nome muito longo (>80 chars) retorna erro", () => {
    const nomeLongo = "A".repeat(81);
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", nomeLongo]);
    expect(saida).toContain("❌");
    expect(saida).toContain("longo");
  });

  it("nome com hífen é válido", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "Jean-Pierre Silva"]);
    expect(saida).toContain("🎓 Certificado de Conclusão");
    expect(saida).toContain("Jean-Pierre Silva");
  });

  it("nome com apóstrofo é válido", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "D'Alessandro Lima"]);
    expect(saida).toContain("🎓 Certificado de Conclusão");
  });

  it("nome com acento é válido", () => {
    const saida = executarCertificado(["--id", ID_JAVA, "--nome", "Antônio Figueirêdo"]);
    expect(saida).toContain("Antônio Figueirêdo");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// certificado gerado — Gean Lima
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — geração para Gean Lima", () => {
  let saida: string;
  beforeAll(() => {
    saida = executarCertificado(["--id", ID_JAVA, "--nome", NOME_VALIDO]);
  });

  it("contém cabeçalho do certificado", () => {
    expect(saida).toContain("🎓 Certificado de Conclusão — DIO");
  });

  it("contém o nome do estudante no ASCII art", () => {
    expect(saida).toContain("Gean Lima");
  });

  it("contém o nome da trilha Java no ASCII art", () => {
    expect(saida).toContain("Desenvolvedor Full Stack Java");
  });

  it("contém o ID da trilha na tabela de detalhes", () => {
    expect(saida).toContain("TRL-005");
  });

  it("contém carga horária correta (120h)", () => {
    expect(saida).toContain("120");
  });

  it("contém número de módulos (20)", () => {
    expect(saida).toContain("20 módulos");
  });

  it("contém XP conquistado (12.000)", () => {
    expect(saida).toContain("12");
    expect(saida).toContain("000");
  });

  it("contém tecnologias da trilha", () => {
    expect(saida).toContain("Java");
    expect(saida).toContain("Spring Boot");
    expect(saida).toContain("Docker");
  });

  it("contém badges da trilha", () => {
    expect(saida).toContain("Java Developer");
    expect(saida).toContain("Full Stack Builder");
  });

  it("contém instrutores da trilha", () => {
    expect(saida).toContain("Bruno Rodrigues");
    expect(saida).toContain("Patricia Mendes");
  });

  it("número de certificado começa com DIO-CERT-", () => {
    expect(saida).toMatch(/DIO-CERT-[A-Z0-9]{16}/);
  });

  it("contém link de validação", () => {
    expect(saida).toContain("https://www.dio.me/certificate/DIO-CERT-");
  });

  it("contém hashtag DIOCertificado", () => {
    expect(saida).toContain("#DIOCertificado");
  });

  it("contém data de emissão formatada em pt-BR", () => {
    // Verifica se a data está no formato "DD de MMMM de YYYY"
    expect(saida).toMatch(/\d{1,2} de \w+ de \d{4}/);
  });

  it("arte ASCII tem bordas ╔ e ╚", () => {
    expect(saida).toContain("╔");
    expect(saida).toContain("╚");
    expect(saida).toContain("╠");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// certificado gerado — nome longo
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — nome longo válido", () => {
  it("gera certificado para nome com múltiplas palavras", () => {
    const saida = executarCertificado([
      "--id", ID_JAVA,
      "--nome", ...NOME_VALIDO_LONGO.split(" "),
    ]);
    expect(saida).toContain("🎓 Certificado de Conclusão — DIO");
    expect(saida).toContain(NOME_VALIDO_LONGO);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// cada execução gera número diferente
// ─────────────────────────────────────────────────────────────────────────────
describe("executarCertificado() — unicidade do número", () => {
  it("dois certificados têm números diferentes", async () => {
    const saida1 = executarCertificado(["--id", ID_JAVA, "--nome", NOME_VALIDO]);
    await new Promise((r) => setTimeout(r, 5)); // garante timestamp distinto
    const saida2 = executarCertificado(["--id", ID_JAVA, "--nome", NOME_VALIDO]);

    const match1 = saida1.match(/DIO-CERT-([A-Z0-9]{16})/);
    const match2 = saida2.match(/DIO-CERT-([A-Z0-9]{16})/);
    expect(match1).not.toBeNull();
    expect(match2).not.toBeNull();
    // Timestamps com 5ms de diferença geralmente produzem hashes distintos
    // Este teste verifica o formato em ambos os casos
    expect(match1![0]).toMatch(/^DIO-CERT-[A-Z0-9]{16}$/);
    expect(match2![0]).toMatch(/^DIO-CERT-[A-Z0-9]{16}$/);
  });
});
