# DIO Explorer — Slash Commands

> Documentação completa dos comandos disponíveis no assistente de carreira da DIO.

---

## Índice

- [Visão Geral](#visão-geral)
- [Registro no Bob (Chat Local)](#registro-no-bob-chat-local)
- [Como Usar](#como-usar)
- [Comandos](#comandos)
  - [/trilha](#trilha)
  - [/desafio](#desafio)
  - [/certificado](#certificado)
  - [/ajuda](#ajuda)
- [Arquitetura](#arquitetura)
- [Adicionando Novos Comandos](#adicionando-novos-comandos)
- [Validações e Erros](#validações-e-erros)

---

## Visão Geral

O **DIO Explorer** é um assistente de carreira para estudantes da Digital Innovation One.
Ele expõe funcionalidades através de **slash commands** — instruções curtas prefixadas com `/`
que retornam respostas formatadas em **Markdown**.

**Stack:** TypeScript · Node.js · Tipagem forte
**Fonte de dados:** `data/trilhas_dio.json` (30 trilhas)

---

## Registro no Bob (Chat Local)

Os slash commands do DIO Explorer são disponibilizados diretamente no **chat do Bob** como
comandos locais de projeto, registrados em `.bob/commands/`.

### Como funciona

Bob carrega automaticamente todos os arquivos `.md` presentes em `.bob/commands/` do workspace
como slash commands. O nome do arquivo vira o nome do comando:

```
.bob/commands/
├── trilha.md        →  /trilha
├── desafio.md       →  /desafio
├── certificado.md   →  /certificado
└── ajuda-dio.md     →  /ajuda-dio
```

### Estrutura de um comando registrado

Cada arquivo usa YAML frontmatter para metadados e corpo Markdown como prompt:

```markdown
---
description: Texto exibido no menu de comandos do Bob
argument-hint: <arg1> [arg2]
---

Instrução para o Bob executar quando o comando for invocado.
Use $1, $2 ou $ARGUMENTS para referenciar os argumentos digitados.
```

### Verificar registro

No chat do Bob, digite `/` para abrir o menu de comandos. Os comandos DIO aparecerão listados
com suas descrições:

| Comando | Descrição |
|---------|-----------|
| `/trilha` | Consulta trilhas DIO e monta plano de estudo completo |
| `/desafio` | Gera desafio prático contextualizado por trilha, tecnologia e nível |
| `/certificado` | Gera certificado de conclusão em Markdown com template reutilizável |
| `/ajuda-dio` | Lista todos os slash commands do DIO Explorer disponíveis neste projeto |

### Hook de log de execuções

O arquivo `.bob/settings.json` registra um hook `PostToolUse` que grava um log em
`dio_explorer/logs/execucoes.log` sempre que arquivos DIO são modificados:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "^(write_file|apply_diff|search_and_replace|insert_content)$",
        "hooks": [{ "type": "command", "command": "node .bob/hooks/dio-command-logger.mjs" }]
      }
    ]
  }
}
```

---

## Como Usar

### Via linha de comando

```bash
# Instalar dependências
npm install

# Desenvolvimento (ts-node)
npx ts-node src/index.ts "/trilha --listar"
npx ts-node src/index.ts "/desafio --id TRL-001 --dificuldade difícil"
npx ts-node src/index.ts "/certificado --id TRL-001 --nome João Silva"

# Build e execução compilada
npm run build
npm start "/trilha --tecnologia Python"
```

### Via código (integração programática)

```typescript
import { dispatch } from "./src/commandRegistry";

const result = dispatch("/trilha --nivel Iniciante");
if (result.success) {
  console.log(result.output); // Markdown formatado
} else {
  console.error(result.output); // Mensagem de erro
}
```

---

## Comandos

---

### `/trilha`

Explora e filtra as trilhas de aprendizado disponíveis na DIO.

#### Sintaxe

```
/trilha                              — Exibe ajuda do comando
/trilha --listar                     — Lista todas as trilhas
/trilha --listar --nivel <nivel>     — Filtra por nível
/trilha --listar --categoria <cat>   — Filtra por categoria
/trilha --listar --tecnologia <t>    — Filtra por tecnologia
/trilha --id <ID>                    — Detalhes de uma trilha
/trilha --nivel <nivel>              — Busca por nível
/trilha --tecnologia <tech>          — Busca por tecnologia
/trilha --categoria <cat>            — Busca por categoria
/trilha <texto livre>                — Busca livre por nome/tech/categoria
```

#### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `--listar` | flag | Lista trilhas (pode ser combinado com filtros) |
| `--id` | string | ID da trilha, ex.: `TRL-001` |
| `--nivel` | string | Nível: `Iniciante`, `Intermediário` ou `Avançado` |
| `--tecnologia` | string | Nome parcial da tecnologia, ex.: `Python`, `AWS` |
| `--categoria` | string | Categoria parcial, ex.: `Cloud`, `Mobile` |
| `--ajuda` | flag | Exibe ajuda detalhada do comando |

#### Exemplos de Uso

```
/trilha --listar
/trilha --listar --nivel Avançado
/trilha --listar --categoria Cloud
/trilha --id TRL-005
/trilha --tecnologia Python
/trilha machine learning
/trilha --nivel Iniciante --tecnologia AWS
```

#### Exemplo de Saída — `/trilha --id TRL-001`

```markdown
## 🔍 Detalhes da Trilha

### 🟡 Machine Learning com Python `TRL-001`
> Aprenda os fundamentos e técnicas avançadas de Machine Learning...

| Campo    | Detalhe              |
|----------|----------------------|
| Categoria | IA & Machine Learning |
| Nível    | Intermediário        |
| Duração  | 72h em 12 módulos    |
| XP Total | 7.200 XP             |

**Tecnologias:** Python · scikit-learn · TensorFlow · Pandas
**Badges:** ML Explorer, Python Data Scientist
**Promoção:** 🏷️ 20% de desconto (válido até 2025-12-31)
```

---

### `/desafio`

Gera um desafio prático personalizado com base em uma trilha específica.
O desafio é adaptado ao nível de dificuldade solicitado.

#### Sintaxe

```
/desafio --id <ID>
/desafio --id <ID> --dificuldade <nivel>
/desafio <ID>                            — Forma abreviada (dificuldade padrão: médio)
/desafio --ajuda
```

#### Parâmetros

| Parâmetro | Obrigatório | Padrão | Descrição |
|-----------|-------------|--------|-----------|
| `--id` | ✅ Sim | — | ID da trilha (ex.: `TRL-001`) |
| `--dificuldade` | ❌ Não | `médio` | Nível de dificuldade |

#### Níveis de Dificuldade

| Valor | Descrição | XP Bônus |
|-------|-----------|----------|
| `fácil` | Projeto introdutório, conceitos básicos, 1 tecnologia | 0.5× base |
| `médio` | Aplicação funcional, integração de tecnologias, testes | 1.0× base |
| `difícil` | Sistema completo, deploy em produção, cobertura ≥ 80% | 1.8× base |

#### Exemplos de Uso

```
/desafio --id TRL-001
/desafio --id TRL-005 --dificuldade difícil
/desafio TRL-003 --dificuldade fácil
/desafio --id TRL-008 --dificuldade médio
```

#### Exemplo de Saída — `/desafio --id TRL-001 --dificuldade fácil`

```markdown
## 🏆 Desafio — Primeiros Passos com Python

| Campo        | Info                           |
|--------------|--------------------------------|
| Trilha       | Machine Learning com Python    |
| Dificuldade  | 🟢 Fácil                       |
| Recompensa   | 300 XP                         |
| Badge        | ML Explorer                    |

### 🎯 Objetivo
Criar um projeto de introdução utilizando Python...

### 📦 Entregáveis
- [ ] Repositório público no GitHub
- [ ] README.md explicando o projeto
- [ ] 3 funcionalidades básicas implementadas

### 📊 Critérios de Avaliação
- ✅ Código funcional
- ✅ README claro e objetivo
- ✅ Commits organizados
```

---

### `/certificado`

Gera um certificado de conclusão formatado para uma trilha da DIO.

#### Sintaxe

```
/certificado --id <ID> --nome <Nome Completo>
/certificado --ajuda
```

#### Parâmetros

| Parâmetro | Obrigatório | Validação |
|-----------|-------------|-----------|
| `--id` | ✅ Sim | ID deve existir no catálogo |
| `--nome` | ✅ Sim | 3–80 caracteres, somente letras, espaços, hífens e apóstrofos |

#### Exemplos de Uso

```
/certificado --id TRL-001 --nome Maria Fernanda Costa
/certificado --id TRL-005 --nome João Pedro Silva
/certificado --id TRL-003 --nome Ana Beatriz
/certificado --id TRL-009 --nome Carlos Eduardo Nascimento
```

#### Exemplo de Saída — `/certificado --id TRL-001 --nome Maria Fernanda Costa`

```
╔══════════════════════════════════════════════════════════════╗
║           DIGITAL INNOVATION ONE — CERTIFICADO              ║
║                    DE CONCLUSÃO                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Certificamos que                                           ║
║  Maria Fernanda Costa                                        ║
║  concluiu com êxito a trilha:                               ║
║  Machine Learning com Python                                 ║
║                                                              ║
║  Carga horária: 72h             Módulos: 12                 ║
║  XP Total: 7.200 XP                                          ║
║  Data de emissão: 27 de maio de 2025                         ║
║  Número: DIO-CERT-XXXXXXXXXXXXXXXX                           ║
╚══════════════════════════════════════════════════════════════╝
```

---

### `/ajuda`

Exibe a lista de todos os comandos registrados com descrição, uso e exemplos.

```
/ajuda
/help
```

---

## Arquitetura

```
dio_explorer/
├── data/
│   └── trilhas_dio.json          # Fonte de dados (30 trilhas)
├── src/
│   ├── types.ts                  # Interfaces e tipos TypeScript
│   ├── commandRegistry.ts        # Registry central + dispatcher
│   ├── index.ts                  # Entry point CLI
│   └── services/
│       ├── trailService.ts       # Acesso a dados (cache, filtros, validação)
│       ├── trilhaLogic.ts        # Lógica de negócio do /trilha
│       ├── desafioLogic.ts       # Lógica de negócio do /desafio
│       └── certificadoLogic.ts   # Lógica de negócio do /certificado
├── commands/
│   ├── trilha.ts                 # Handler + metadados do /trilha
│   ├── desafio.ts                # Handler + metadados do /desafio
│   └── certificado.ts            # Handler + metadados do /certificado
├── docs/
│   └── slash-commands.md         # Esta documentação
├── package.json
└── tsconfig.json
```

### Fluxo de Execução

```
Entrada: "/desafio --id TRL-001 --dificuldade difícil"
    │
    ▼
src/index.ts          — Lê argv e passa para dispatch()
    │
    ▼
commandRegistry.ts    — Parseia o nome do comando, encontra o handler
    │
    ▼
commands/desafio.ts   — Handler valida e chama executarDesafio(args)
    │
    ▼
services/desafioLogic.ts  — Parseia flags, chama validarIdTrilha()
    │
    ▼
services/trailService.ts  — Carrega JSON (cache), valida ID
    │
    ▼
services/desafioLogic.ts  — Gera template, formata em Markdown
    │
    ▼
Saída: CommandResult { success: true, output: "## 🏆 Desafio..." }
```

### Princípios de Design

| Princípio | Implementação |
|-----------|---------------|
| **Separação de responsabilidades** | `services/` contém lógica de negócio; `commands/` contém metadados e handlers finos |
| **Tipagem forte** | Todas as interfaces definidas em `types.ts`; sem `any` |
| **Extensibilidade** | Novo comando = novo arquivo em `commands/` + `registerCommand()` |
| **Cache de dados** | `trailService.ts` usa módulo-level cache para evitar I/O repetido |
| **Erros descritivos** | `ValidationError` com mensagens acionáveis para o usuário |
| **Saída padronizada** | `CommandResult { success, output }` em todos os handlers |

---

## Adicionando Novos Comandos

Para adicionar um novo slash command, siga estes 3 passos:

### 1. Crie a lógica de negócio

```typescript
// src/services/meuComandoLogic.ts
import { ValidationError } from "../types";

export function executarMeuComando(args: string[]): string {
  if (args.length === 0) return ajuda();
  // ... sua lógica aqui
  return "## Resultado\n...";
}

function ajuda(): string {
  return "## /meucomando\nDescrição...";
}
```

### 2. Crie o handler

```typescript
// commands/meuComando.ts
import { CommandResult, SlashCommand } from "../src/types";
import { executarMeuComando } from "../src/services/meuComandoLogic";

export const meuComandoCommand: SlashCommand = {
  name: "meucomando",
  description: "Descrição do meu comando.",
  usage: "/meucomando [--opcao valor]",
  examples: ["/meucomando --opcao abc"],
  handler(args: string[]): CommandResult {
    try {
      return { success: true, output: executarMeuComando(args) };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, output: `❌ ${msg}` };
    }
  },
};
```

### 3. Registre no registry

```typescript
// src/commandRegistry.ts — adicione ao final do arquivo
import { meuComandoCommand } from "../commands/meuComando";
registerCommand(meuComandoCommand);
```

Pronto. O comando `meucomando` já estará disponível via `/meucomando` e aparecerá em `/ajuda`.

---

## Validações e Erros

### Erros tratados

| Situação | Mensagem retornada |
|----------|--------------------|
| Comando não encontrado | `❌ Comando /xyz não encontrado. Comandos disponíveis: ...` |
| Entrada sem `/` | `❌ Entrada inválida. Comandos devem começar com /` |
| ID de trilha inválido | `❌ Trilha com ID "TRL-999" não encontrada. Use /trilha --listar` |
| Nível inválido em `/trilha` | `❌ Nível "x" não encontrado. Use: Iniciante, Intermediário ou Avançado.` |
| Dificuldade inválida em `/desafio` | `❌ Dificuldade inválida: "x". Use: fácil, médio, difícil.` |
| Nome muito curto em `/certificado` | `❌ Nome muito curto. Informe pelo menos 3 caracteres.` |
| Nome com caracteres inválidos | `❌ Nome inválido. Use apenas letras, espaços, hífens e apóstrofos.` |
| Parâmetro obrigatório ausente | `❌ Informe o ID da trilha. Exemplo: /desafio --id TRL-001` |

### Classe `ValidationError`

Erros de validação de negócio são lançados via `ValidationError` (estende `Error`)
e capturados nos handlers, convertidos em `CommandResult { success: false }`.
Erros inesperados propagam normalmente para o caller.
