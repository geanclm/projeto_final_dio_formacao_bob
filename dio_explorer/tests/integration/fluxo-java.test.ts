/**
 * Testes de Integração — Fluxo Java Completo
 *
 * Fluxo obrigatório:
 *   1. Consultar a trilha Java (TRL-005)
 *   2. Gerar desafio Java Intermediário (dificuldade médio)
 *   3. Gerar certificado para "Gean Lima"
 *   4. Validar que todas as etapas foram concluídas com sucesso
 *
 * Adicionalmente testa:
 *   - Leitura real do arquivo data/trilhas_dio.json
 *   - Consistência dos dados entre as etapas
 *   - Encadeamento via dispatch() (entrada pública)
 */

import { dispatch } from "../../src/commandRegistry";
import { buscarPorId, carregarTrilhas } from "../../src/services/trailService";

// Resultados compartilhados entre os passos do fluxo
interface FluxoResultado {
  passo1_trilha: ReturnType<typeof dispatch> | null;
  passo2_desafio: ReturnType<typeof dispatch> | null;
  passo3_certificado: ReturnType<typeof dispatch> | null;
  trilhaJava: ReturnType<typeof buscarPorId>;
}

const resultado: FluxoResultado = {
  passo1_trilha: null,
  passo2_desafio: null,
  passo3_certificado: null,
  trilhaJava: undefined,
};

// ─────────────────────────────────────────────────────────────────────────────
// Passo 0 — Pré-condição: leitura do JSON
// ─────────────────────────────────────────────────────────────────────────────
describe("Integração — Passo 0: Leitura de data/trilhas_dio.json", () => {
  it("carrega o arquivo JSON sem erros", () => {
    expect(() => carregarTrilhas()).not.toThrow();
  });

  it("JSON contém 30 trilhas", () => {
    expect(carregarTrilhas().length).toBe(30);
  });

  it("TRL-005 (Java) existe no JSON", () => {
    resultado.trilhaJava = buscarPorId("TRL-005");
    expect(resultado.trilhaJava).toBeDefined();
  });

  it("TRL-005 é de nível Intermediário", () => {
    expect(resultado.trilhaJava!.nivel).toBe("Intermediário");
  });

  it("TRL-005 usa Java como tecnologia principal", () => {
    expect(resultado.trilhaJava!.tecnologia[0]).toBe("Java");
  });

  it("TRL-005 tem duração de 120 horas", () => {
    expect(resultado.trilhaJava!.duracao_horas).toBe(120);
  });

  it("TRL-005 tem 20 módulos", () => {
    expect(resultado.trilhaJava!.modulos).toBe(20);
  });

  it("TRL-005 tem 12.000 XP total", () => {
    expect(resultado.trilhaJava!.xp_total).toBe(12000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Passo 1 — Consultar a trilha Java
// ─────────────────────────────────────────────────────────────────────────────
describe("Integração — Passo 1: Consultar trilha Java via /trilha --id TRL-005", () => {
  beforeAll(() => {
    resultado.passo1_trilha = dispatch("/trilha --id TRL-005");
  });

  it("dispatch retorna success=true", () => {
    expect(resultado.passo1_trilha!.success).toBe(true);
  });

  it("output contém cabeçalho '🔍 Detalhes da Trilha'", () => {
    expect(resultado.passo1_trilha!.output).toContain("🔍 Detalhes da Trilha");
  });

  it("output contém nome da trilha", () => {
    expect(resultado.passo1_trilha!.output).toContain("Desenvolvedor Full Stack Java");
  });

  it("output contém ID TRL-005", () => {
    expect(resultado.passo1_trilha!.output).toContain("TRL-005");
  });

  it("output contém tecnologias Java, Spring Boot, React", () => {
    expect(resultado.passo1_trilha!.output).toContain("Java");
    expect(resultado.passo1_trilha!.output).toContain("Spring Boot");
    expect(resultado.passo1_trilha!.output).toContain("React");
  });

  it("output contém nível Intermediário", () => {
    expect(resultado.passo1_trilha!.output).toContain("Intermediário");
  });

  it("output contém duração 120h", () => {
    expect(resultado.passo1_trilha!.output).toContain("120");
  });

  it("output contém promoção ativa (25%)", () => {
    expect(resultado.passo1_trilha!.output).toContain("25%");
  });

  it("output contém emoji 🟡 (Intermediário)", () => {
    expect(resultado.passo1_trilha!.output).toContain("🟡");
  });

  it("output não contém erro ❌", () => {
    expect(resultado.passo1_trilha!.output).not.toContain("❌");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Passo 2 — Gerar desafio Java Intermediário (médio)
// ─────────────────────────────────────────────────────────────────────────────
describe("Integração — Passo 2: Gerar desafio Java Intermediário via /desafio --id TRL-005 --dificuldade médio", () => {
  beforeAll(() => {
    resultado.passo2_desafio = dispatch("/desafio --id TRL-005 --dificuldade médio");
  });

  it("dispatch retorna success=true", () => {
    expect(resultado.passo2_desafio!.success).toBe(true);
  });

  it("output contém cabeçalho '🏆 Desafio'", () => {
    expect(resultado.passo2_desafio!.output).toContain("🏆 Desafio");
  });

  it("output referencia a trilha TRL-005", () => {
    expect(resultado.passo2_desafio!.output).toContain("TRL-005");
  });

  it("output indica dificuldade 🟡 Médio", () => {
    expect(resultado.passo2_desafio!.output).toContain("🟡 Médio");
  });

  it("output contém objetivo com tecnologias Java", () => {
    expect(resultado.passo2_desafio!.output).toContain("Java");
    expect(resultado.passo2_desafio!.output).toContain("Spring Boot");
  });

  it("output contém XP de recompensa (600 XP)", () => {
    // xp_total=12000 / modulos=20 = 600 base * 1.0 médio = 600
    expect(resultado.passo2_desafio!.output).toContain("600");
  });

  it("output contém checklist de entregáveis", () => {
    expect(resultado.passo2_desafio!.output).toContain("- [ ]");
  });

  it("output contém critérios com ✅", () => {
    expect(resultado.passo2_desafio!.output).toContain("- ✅");
  });

  it("output contém hashtag #DIOChallenge", () => {
    expect(resultado.passo2_desafio!.output).toContain("#DIOChallenge");
  });

  it("output não contém erro ❌", () => {
    expect(resultado.passo2_desafio!.output).not.toContain("❌");
  });

  it("badge ao concluir pertence à trilha Java", () => {
    // Badges da TRL-005: ["Java Developer", "Full Stack Builder"]
    const output = resultado.passo2_desafio!.output;
    const temBadge = output.includes("Java Developer") || output.includes("Full Stack Builder");
    expect(temBadge).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Passo 3 — Gerar certificado para Gean Lima
// ─────────────────────────────────────────────────────────────────────────────
describe("Integração — Passo 3: Gerar certificado para Gean Lima via /certificado --id TRL-005 --nome Gean Lima", () => {
  beforeAll(() => {
    resultado.passo3_certificado = dispatch("/certificado --id TRL-005 --nome Gean Lima");
  });

  it("dispatch retorna success=true", () => {
    expect(resultado.passo3_certificado!.success).toBe(true);
  });

  it("output contém cabeçalho '🎓 Certificado de Conclusão — DIO'", () => {
    expect(resultado.passo3_certificado!.output).toContain("🎓 Certificado de Conclusão — DIO");
  });

  it("output contém o nome do estudante 'Gean Lima'", () => {
    expect(resultado.passo3_certificado!.output).toContain("Gean Lima");
  });

  it("output contém nome da trilha Java no template ASCII", () => {
    expect(resultado.passo3_certificado!.output).toContain("Desenvolvedor Full Stack Java");
  });

  it("output contém número de certificado no formato DIO-CERT-XXXXXXXXXXXXXXXX", () => {
    expect(resultado.passo3_certificado!.output).toMatch(/DIO-CERT-[A-Z0-9]{16}/);
  });

  it("output contém link de validação https://www.dio.me/certificate/", () => {
    expect(resultado.passo3_certificado!.output).toContain("https://www.dio.me/certificate/");
  });

  it("output contém categoria 'Desenvolvimento Back-end'", () => {
    expect(resultado.passo3_certificado!.output).toContain("Desenvolvimento Back-end");
  });

  it("output contém carga horária 120 horas", () => {
    expect(resultado.passo3_certificado!.output).toContain("120");
  });

  it("output contém badges 'Java Developer' e 'Full Stack Builder'", () => {
    expect(resultado.passo3_certificado!.output).toContain("Java Developer");
    expect(resultado.passo3_certificado!.output).toContain("Full Stack Builder");
  });

  it("output contém hashtag #DIOCertificado", () => {
    expect(resultado.passo3_certificado!.output).toContain("#DIOCertificado");
  });

  it("output não contém erro ❌", () => {
    expect(resultado.passo3_certificado!.output).not.toContain("❌");
  });

  it("arte ASCII está presente (bordas ╔ e ╚)", () => {
    expect(resultado.passo3_certificado!.output).toContain("╔");
    expect(resultado.passo3_certificado!.output).toContain("╚");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Passo 4 — Validação do fluxo completo
// ─────────────────────────────────────────────────────────────────────────────
describe("Integração — Passo 4: Validação de consistência do fluxo completo", () => {
  it("todas as três etapas foram executadas com success=true", () => {
    expect(resultado.passo1_trilha!.success).toBe(true);
    expect(resultado.passo2_desafio!.success).toBe(true);
    expect(resultado.passo3_certificado!.success).toBe(true);
  });

  it("a trilha consultada no passo 1 é a mesma referenciada no desafio", () => {
    expect(resultado.passo2_desafio!.output).toContain("TRL-005");
  });

  it("a trilha consultada no passo 1 é a mesma no certificado", () => {
    expect(resultado.passo3_certificado!.output).toContain("TRL-005");
  });

  it("o estudante 'Gean Lima' está no certificado e não no desafio", () => {
    expect(resultado.passo3_certificado!.output).toContain("Gean Lima");
    // O desafio não deve incluir nome de estudante
    expect(resultado.passo2_desafio!.output).not.toContain("Gean Lima");
  });

  it("nenhum dos três outputs contém string de erro ❌", () => {
    [resultado.passo1_trilha, resultado.passo2_desafio, resultado.passo3_certificado].forEach(
      (r) => expect(r!.output).not.toContain("❌")
    );
  });

  it("o fluxo é repetível: segunda execução produz success=true", () => {
    const r1 = dispatch("/trilha --id TRL-005");
    const r2 = dispatch("/desafio --id TRL-005 --dificuldade médio");
    const r3 = dispatch("/certificado --id TRL-005 --nome Gean Lima");
    expect(r1.success && r2.success && r3.success).toBe(true);
  });

  it("tecnologia Java aparece em todos os outputs", () => {
    expect(resultado.passo1_trilha!.output).toContain("Java");
    expect(resultado.passo2_desafio!.output).toContain("Java");
    expect(resultado.passo3_certificado!.output).toContain("Java");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cenários de erro — integração
// ─────────────────────────────────────────────────────────────────────────────
describe("Integração — Cenários de erro", () => {
  it("trilha inexistente em /trilha retorna mensagem de erro", () => {
    const r = dispatch("/trilha --id TRL-999");
    expect(r.output).toContain("❌");
    expect(r.output).toContain("TRL-999");
  });

  it("trilha inexistente em /desafio retorna mensagem de erro", () => {
    const r = dispatch("/desafio --id TRL-999");
    expect(r.output).toContain("❌");
  });

  it("trilha inexistente em /certificado retorna mensagem de erro", () => {
    const r = dispatch("/certificado --id TRL-999 --nome Gean Lima");
    expect(r.output).toContain("❌");
  });

  it("dificuldade inválida no desafio retorna mensagem de erro", () => {
    const r = dispatch("/desafio --id TRL-005 --dificuldade Mestre");
    expect(r.output).toContain("❌");
    expect(r.output).toContain("Dificuldade inválida");
  });

  it("nome com números no certificado retorna mensagem de erro", () => {
    const r = dispatch("/certificado --id TRL-005 --nome G34n L1m4");
    expect(r.output).toContain("❌");
  });

  it("nome muito curto no certificado retorna mensagem de erro", () => {
    const r = dispatch("/certificado --id TRL-005 --nome AA");
    expect(r.output).toContain("❌");
  });

  it("comando desconhecido retorna mensagem de erro com comandos disponíveis", () => {
    const r = dispatch("/xyz_inexistente");
    expect(r.success).toBe(false);
    expect(r.output).toContain("/trilha");
    expect(r.output).toContain("/desafio");
    expect(r.output).toContain("/certificado");
  });
});
