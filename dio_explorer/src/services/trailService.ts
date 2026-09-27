import fs from "fs";
import path from "path";
import { Trilha, TrilhaFiltros, ValidationError } from "../types";

const DATA_PATH = path.resolve(__dirname, "../../data/trilhas_dio.json");

let _cache: Trilha[] | null = null;

/** Carrega todas as trilhas do arquivo JSON (com cache em memória). */
export function carregarTrilhas(): Trilha[] {
  if (_cache) return _cache;
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  _cache = JSON.parse(raw) as Trilha[];
  return _cache;
}

/** Retorna todas as trilhas. */
export function listarTrilhas(): Trilha[] {
  return carregarTrilhas();
}

/** Busca uma trilha pelo ID exato (ex.: TRL-001). */
export function buscarPorId(id: string): Trilha | undefined {
  const normalizado = id.trim().toUpperCase();
  return carregarTrilhas().find((t) => t.id.toUpperCase() === normalizado);
}

/** Filtra trilhas com base em critérios opcionais. */
export function filtrarTrilhas(filtros: TrilhaFiltros): Trilha[] {
  let trilhas = carregarTrilhas();

  if (filtros.id) {
    const encontrada = buscarPorId(filtros.id);
    return encontrada ? [encontrada] : [];
  }

  if (filtros.nivel) {
    const nivel = filtros.nivel.toLowerCase();
    trilhas = trilhas.filter((t) => t.nivel.toLowerCase().includes(nivel));
    if (trilhas.length === 0) {
      throw new ValidationError(
        `Nível "${filtros.nivel}" não encontrado. Use: Iniciante, Intermediário ou Avançado.`
      );
    }
  }

  if (filtros.tecnologia) {
    const tech = filtros.tecnologia.toLowerCase();
    trilhas = trilhas.filter((t) =>
      t.tecnologia.some((tec) => tec.toLowerCase().includes(tech))
    );
  }

  if (filtros.categoria) {
    const cat = filtros.categoria.toLowerCase();
    trilhas = trilhas.filter((t) => t.categoria.toLowerCase().includes(cat));
  }

  return trilhas;
}

/** Retorna a lista de categorias únicas disponíveis. */
export function listarCategorias(): string[] {
  const categorias = new Set(carregarTrilhas().map((t) => t.categoria));
  return Array.from(categorias).sort();
}

/** Retorna os níveis únicos disponíveis. */
export function listarNiveis(): string[] {
  const niveis = new Set(carregarTrilhas().map((t) => t.nivel));
  return Array.from(niveis);
}

/** Valida se um ID de trilha existe; lança ValidationError se não. */
export function validarIdTrilha(id: string): Trilha {
  const trilha = buscarPorId(id);
  if (!trilha) {
    throw new ValidationError(
      `Trilha com ID "${id}" não encontrada. Use \`/trilha --listar\` para ver os IDs disponíveis.`
    );
  }
  return trilha;
}
