import { Trilha } from "../../src/types";

/** Fixture da trilha Java (TRL-005) — extraída do JSON real para uso nos testes. */
export const TRILHA_JAVA: Trilha = {
  id: "TRL-005",
  nome: "Desenvolvedor Full Stack Java",
  descricao:
    "Construa aplicações web completas com Spring Boot no back-end e React no front-end, dominando REST APIs, bancos de dados e deploy em nuvem.",
  tecnologia: ["Java", "Spring Boot", "React", "PostgreSQL", "Docker"],
  nivel: "Intermediário",
  duracao_horas: 120,
  modulos: 20,
  xp_total: 12000,
  instrutores: ["Bruno Rodrigues", "Patricia Mendes"],
  badges: ["Java Developer", "Full Stack Builder"],
  promocoes: { desconto_percentual: 25, validade: "2025-08-31" },
  vitalicio: true,
  lives_ao_vivo: 10,
  categoria: "Desenvolvimento Back-end",
  data_lancamento: "2023-09-01",
};

/** Fixture de trilha sem promoção ativa (TRL-002). */
export const TRILHA_SEM_PROMO: Trilha = {
  id: "TRL-002",
  nome: "Engenharia de Dados com Apache Spark",
  descricao: "Domine pipelines de dados em larga escala.",
  tecnologia: ["Apache Spark", "Python", "Databricks", "Delta Lake"],
  nivel: "Avançado",
  duracao_horas: 90,
  modulos: 15,
  xp_total: 9000,
  instrutores: ["Fernanda Lima", "Ricardo Alves"],
  badges: ["Big Data Engineer", "Spark Master"],
  promocoes: { desconto_percentual: 0, validade: null },
  vitalicio: true,
  lives_ao_vivo: 6,
  categoria: "Dados & Analytics",
  data_lancamento: "2024-05-15",
};

/** Fixture de trilha de nível Iniciante (TRL-003). */
export const TRILHA_INICIANTE: Trilha = {
  id: "TRL-003",
  nome: "AWS Cloud Practitioner",
  descricao:
    "Fundamentos da nuvem Amazon Web Services: serviços essenciais, segurança e faturamento.",
  tecnologia: ["AWS", "Cloud Computing", "IAM", "S3", "EC2"],
  nivel: "Iniciante",
  duracao_horas: 40,
  modulos: 8,
  xp_total: 4000,
  instrutores: ["Marcos Vinicius Costa"],
  badges: ["AWS Beginner", "Cloud Foundation"],
  promocoes: { desconto_percentual: 15, validade: "2025-09-30" },
  vitalicio: true,
  lives_ao_vivo: 2,
  categoria: "Cloud Computing",
  data_lancamento: "2023-11-10",
};

/** Fixture de trilha de acesso limitado (TRL-007). */
export const TRILHA_NAO_VITALICIA: Trilha = {
  id: "TRL-007",
  nome: "Data Science com R",
  descricao: "Análise estatística e visualização com R e ggplot2.",
  tecnologia: ["R", "ggplot2", "tidyverse", "RStudio"],
  nivel: "Intermediário",
  duracao_horas: 60,
  modulos: 10,
  xp_total: 6000,
  instrutores: ["Leticia Campos"],
  badges: ["R Data Analyst", "Stats Master"],
  promocoes: { desconto_percentual: 30, validade: "2025-07-31" },
  vitalicio: false,
  lives_ao_vivo: 3,
  categoria: "Dados & Analytics",
  data_lancamento: "2023-06-20",
};
