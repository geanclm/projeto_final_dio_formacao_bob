/** Dados de promoção de uma trilha */
export interface Promocao {
  desconto_percentual: number;
  validade: string | null;
}

/** Representa uma trilha de aprendizado da DIO */
export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  tecnologia: string[];
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  duracao_horas: number;
  modulos: number;
  xp_total: number;
  instrutores: string[];
  badges: string[];
  promocoes: Promocao;
  vitalicio: boolean;
  lives_ao_vivo: number;
  categoria: string;
  data_lancamento: string;
}

/** Filtros aceitos pelo comando /trilha */
export interface TrilhaFiltros {
  nivel?: string;
  tecnologia?: string;
  categoria?: string;
  id?: string;
}

/** Contexto de um desafio gerado para uma trilha */
export interface DesafioContexto {
  trilha: Trilha;
  dificuldade: "fácil" | "médio" | "difícil";
}

/** Contexto de certificado gerado para uma trilha */
export interface CertificadoContexto {
  trilha: Trilha;
  nomeEstudante: string;
}

/** Resultado genérico de um comando slash */
export interface CommandResult {
  success: boolean;
  output: string;
}

/** Definição de um comando slash registrado */
export interface SlashCommand {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  handler: (args: string[]) => CommandResult;
}

/** Erros de validação de entrada */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
