# Documentação Técnica — Projeto Final DIO × IBM Bob

> **Bootcamp:** IBM Bob: IA de Nível Empresarial para Desenvolvedores e Tech Leaders  
> **Plataforma:** Digital Innovation One (DIO) + IBM  
> **Autor:** geanclm  
> **Data de início:** 24/09/2026  

---

## Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Histórico de Prompts](#2-histórico-de-prompts)
3. [Guia e Modos de Uso](#3-guia-e-modos-de-uso)
4. [Dicas de Uso e Boas Práticas](#4-dicas-de-uso-e-boas-práticas)
5. [Insights e Aprendizados](#5-insights-e-aprendizados)

---

## 1. Visão Geral do Projeto

### 1.1 Propósito

Este repositório é o projeto de conclusão do bootcamp **IBM Bob: IA de Nível Empresarial para Desenvolvedores e Tech Leaders**, oferecido pela [DIO](https://web.dio.me/track/6c94a3da-1f22-45f6-be56-a2bad071ef51) em parceria com a **IBM**.

O objetivo central é demonstrar na prática o ciclo completo de uso do **IBM Bob** como parceiro de IA no desenvolvimento de software (SDLC), cobrindo:

- Exploração e configuração do agente IBM Bob
- Criação e uso de **Slash Commands** locais
- Integração via **MCP (Model Context Protocol)** com ferramentas externas
- Automação de tarefas via **Hooks** do ciclo de vida do Bob
- Boas práticas de segurança (credenciais, `.gitignore`, `.bobignore`)
- Suíte de testes automatizados com cobertura elevada

O resultado prático é o **DIO Explorer**: um assistente de carreira para estudantes da Digital Innovation One, expondo funcionalidades via slash commands (`/trilha`, `/desafio`, `/certificado`) e via servidor MCP nativo, consumível por qualquer cliente compatível com o Model Context Protocol.

---

### 1.2 Arquitetura

O projeto é composto por três camadas independentes mas integradas:

```
projeto_final_dio_formacao_bob/
│
├── .bob/                        ← Configuração do agente IBM Bob
│   ├── mcp.json                 ← Registro do servidor MCP local
│   ├── settings.json            ← Hooks de ciclo de vida (PostToolUse)
│   ├── commands/                ← Slash commands locais do projeto
│   │   ├── ajuda-dio.md         ← /ajuda-dio
│   │   ├── certificado.md       ← /certificado
│   │   ├── desafio.md           ← /desafio
│   │   └── trilha.md            ← /trilha
│   └── hooks/
│       └── dio-command-logger.mjs  ← Hook de log de execuções
│
├── mcp/                         ← Servidor MCP (TypeScript/Node.js)
│   ├── src/index.ts             ← Implementação completa do servidor MCP
│   ├── build/                   ← Artefato compilado (JS)
│   ├── package.json
│   └── tsconfig.json
│
├── dio_explorer/                ← Módulo principal — lógica dos slash commands
│   ├── src/
│   │   ├── types.ts             ← Interfaces e tipos TypeScript
│   │   ├── commandRegistry.ts   ← Registry central + dispatcher
│   │   ├── index.ts             ← Entry point CLI
│   │   └── services/
│   │       ├── trailService.ts      ← Acesso a dados + cache + filtros
│   │       ├── trilhaLogic.ts       ← Lógica de negócio do /trilha
│   │       ├── desafioLogic.ts      ← Lógica de negócio do /desafio
│   │       └── certificadoLogic.ts  ← Lógica de negócio do /certificado
│   ├── commands/
│   │   ├── trilha.ts            ← Handler + metadados do /trilha
│   │   ├── desafio.ts           ← Handler + metadados do /desafio
│   │   └── certificado.ts       ← Handler + metadados do /certificado
│   ├── data/
│   │   └── trilhas_dio.json     ← Fonte de dados (30 trilhas)
│   ├── docs/
│   │   ├── slash-commands.md    ← Documentação dos comandos
│   │   └── relatorio-testes.txt ← Relatório completo de testes
│   └── tests/
│       ├── unit/                ← 5 suítes de testes unitários
│       └── integration/         ← 1 suíte de integração (fluxo Java)
│
├── .bobignore                   ← Exclusões para o agente Bob
├── .gitignore                   ← Exclusões Git
├── README.md                    ← Visão geral pública do repositório
└── DOCUMENTACAO.md              ← Este arquivo
```

#### Fluxo de Execução (Slash Command via Bob Chat)

```
Usuário digita "/desafio --id TRL-001 --dificuldade difícil" no chat do Bob
    │
    ▼
.bob/commands/desafio.md       — Bob carrega o prompt/template do comando
    │
    ▼
IBM Bob (LLM + MCP)            — Interpreta argumentos e chama ferramenta
    │
    ▼
mcp/build/index.js             — Servidor MCP recebe a chamada via stdio
    │
    ▼
desafio_gerar()                — Carrega trilhas_dio.json, valida ID, gera desafio
    │
    ▼
Saída: Markdown formatado com objetivo, entregáveis, critérios e XP
```

#### Fluxo de Execução (Programático — Node.js)

```
npx ts-node src/index.ts "/desafio --id TRL-001"
    │
    ▼
src/index.ts          — Lê process.argv e chama dispatch()
    │
    ▼
commandRegistry.ts    — Parseia nome do comando, localiza handler
    │
    ▼
commands/desafio.ts   — Valida, chama executarDesafio(args)
    │
    ▼
services/desafioLogic.ts  — Parseia flags, chama validarIdTrilha()
    │
    ▼
services/trailService.ts  — Carrega JSON (cache em memória), valida ID
    │
    ▼
CommandResult { success: true, output: "## 🏆 Desafio..." }
```

---

### 1.3 Tecnologias Utilizadas

| Camada | Tecnologia | Versão | Finalidade |
|--------|-----------|--------|------------|
| Agente | IBM Bob | — | SDLC completo, chat, slash commands, hooks |
| Servidor MCP | `@modelcontextprotocol/sdk` | ^1.0.0 | Exposição de ferramentas via protocolo MCP |
| Validação MCP | `zod` | ^3.23.8 | Schema validation das entradas do servidor |
| Linguagem | TypeScript | ^5.4.0 | Tipagem forte em toda a codebase |
| Runtime | Node.js | ≥18 | Execução do servidor MCP e CLI |
| Testes | Jest + ts-jest | ^30.x / ^29.x | Testes unitários e de integração |
| Dados | JSON | — | Catálogo de 30 trilhas DIO |
| Controle de versão | Git / GitHub | — | Versionamento e publicação |
| Segurança | Windows Credential Manager | — | Armazenamento seguro do token GitHub |

---

### 1.4 MCP Tools Expostas

O servidor MCP (`mcp/`) expõe quatro ferramentas ao IBM Bob e demais clientes MCP:

| Tool | Parâmetros | Descrição |
|------|-----------|-----------|
| `trilha_listar` | `nivel?`, `tecnologia?`, `categoria?` | Lista trilhas com filtros opcionais |
| `trilha_detalhar` | `id` | Retorna detalhes completos de uma trilha |
| `desafio_gerar` | `id`, `dificuldade?` (padrão: `médio`) | Gera desafio prático personalizado |
| `certificado_gerar` | `id`, `nome` | Emite certificado de conclusão formatado |

---

## 2. Histórico de Prompts

Esta seção documenta os prompts utilizados ao longo do desenvolvimento e das primeiras explorações com o IBM Bob, registrados cronologicamente com suas finalidades.

### 2.1 Prompts de Exploração Inicial

Estes prompts foram os primeiros testes realizados para compreender as capacidades do IBM Bob:

---

**Prompt 1 — Revisão de texto para publicação**
```
Melhore o seguinte texto para publicação no portal SHE360 da Mercado Livre,
tornando-o mais objetivo, profissional e impactante: [texto]
```
*Finalidade:* Avaliar a capacidade de reescrita e adequação de tom do agente para diferentes audiências.

---

**Prompt 2 — Criação de página web com autenticação**
```
Crie uma página web com autenticação via conta Google.
```
*Finalidade:* Testar geração de código front-end com fluxo OAuth/OpenID Connect.

---

**Prompt 3 — Interpretação de imagem (multimodal)**
```
Acesse o arquivo "Gemini_Generated_Image_vtue00vtue00vtue.png" e faça uma breve
descrição da leitura dessa imagem, identifique qual modelo de IA gerou essa imagem,
aponte possíveis erros no contexto da imagem (tabuleiro de xadrez, elementos, personagens,
proximidade/distância). Aponte um insight significativo. Salve o comentário em um arquivo
chamado leitura_imagem_nomeModeloUtilizado.txt
```
*Finalidade:* Explorar capacidades multimodais (visão) e geração de arquivos a partir de análise visual.

---

**Prompt 4 — Resumo de arquivo de áudio**
```
Acesse o arquivo "podcast_indicadores.m4a" e faça um breve resumo acerca do conteúdo
desse áudio. Identifique a fonte geradora do áudio e aponte um insight significativo.
Salve o comentário final em um arquivo chamado leitura_audio.txt
```
*Finalidade:* Testar capacidade de transcrição e síntese de conteúdo em áudio.

---

**Prompt 5 — Análise de dados Markdown**
```
Qual o principal insight que pode ser comentado com base no arquivo
df_indicadores_11_08_2026_11h55m10s92.md?
```
*Finalidade:* Avaliar leitura e interpretação de dados tabulares em formato Markdown.

---

**Prompt 6 — Consulta web em tempo real (ranking FIFA)**
```
Qual o rank atual da FIFA em agosto de 2026 para o futebol masculino?
Considere a data atual para listar os Top 5 da FIFA.
Salve a lista organizada em um arquivo chamado rank_fifa.txt
```
*Finalidade:* Testar acesso a informações externas via web (integração Tavily) e geração de arquivos.

---

**Prompt 7 — Navegação web para produto específico**
```
Se for possível, navegue na web e traga o nome e modelo do último lançamento
de notebook da Lenovo.
```
*Finalidade:* Validar a integração com o serviço Tavily para buscas web em tempo real.
*Observação:* Confirmou o uso do **Tavily API** como backend de busca acessível via requisições.

---

**Prompt 8 — Geração de imagem (adaptado para arte ASCII)**
```
Gere uma imagem com o enquadramento de um carro com um casal em estrada,
indo para um final de semana.
```
*Finalidade:* Testar geração de imagens.  
*Observação:* O IBM Bob não gera imagens diretamente. O prompt foi adaptado para um **desafio de arte ASCII estruturada**, revelando um limite importante do agente.

---

**Prompt 9 — Previsão de tendências globais**
```
Com base no contexto atual mundial, descreva, de forma objetiva em no máximo
10 linhas, qual a tendência de vida para a humanidade daqui a 50 anos.
```
*Finalidade:* Testar capacidade de síntese, raciocínio prospectivo e brevidade de resposta.

---

**Prompt 10 — Análise de gráfico (multimodal)**
```
Qual o principal insight pode ser comentado a partir do gráfico "panorama_macro.png"?
```
*Finalidade:* Testar interpretação de dados visuais (gráficos/charts).

---

**Prompt 11 — Transcrição e resumo de vídeo YouTube**
```
Acesse o vídeo YouTube no link https://youtu.be/NGxIIjB8ER0?list=PLUT5IDAYxD5w
e gere um breve resumo acerca dos principais ensinamentos e tópicos mais relevantes
para alavancar carreira profissional. Salve o texto em um arquivo chamado
resumo_video_audiobook.txt
```
*Finalidade:* Testar transcrição e síntese de vídeos do YouTube.

---

**Prompt 12 — Dashboard HTML/CSS/JS a partir de dados Excel**
```
[Prompt 1] Analise o arquivo xlsx compartilhado na pasta.
[Prompt 2] Com base nos dados analisados, gere um dashboard completo em HTML, CSS e JS
com visualizações interativas dos indicadores.
```
*Finalidade:* Avaliar a cadeia completa de análise de dados → geração de código de dashboard.

---

**Prompt 13 — Previsão de jogos da Loteca**
```
Pesquise na web e retorne, de forma organizada em uma tabela, a programação do
Concurso 1268 da Loteca da Caixa (29/08/2026).
Retorne a tabela com a previsão de resultado para cada jogo.
Salve o texto em um arquivo chamado previsao_jogos_loteca_1268.txt
```
*Finalidade:* Testar busca web estruturada, formatação tabular e previsão estatística.

---

**Prompt 14 — Dashboard de indicadores financeiros**
```
[Prompts iterativos para geração de dashboard com indicadores do mercado financeiro]
```
*Finalidade:* Explorar geração de visualizações iterativas com refinamento por prompts sucessivos.

---

**Prompt 15 — Análise exploratória automatizada com código Python**
```
Com base no arquivo df_indicadores_11_08_2026_11h55m10s92.md, realize uma análise
exploratória completa dos dados: identifique padrões, anomalias, correlações e tendências.
Gere automaticamente o código Python necessário para produzir ao menos 3 visualizações
distintas (série temporal, dispersão, heatmap de correlação), salve os scripts em
arquivos .py separados e compile um relatório final em HTML com os principais achados,
gráficos embutidos e recomendações de negócio.
Salve o relatório em relatorio_analise_exploratoria.html
```
*Finalidade:* Testar o ciclo completo de data science: análise → código → visualização → relatório.

---

**Prompt 16 — Refatoração de código (chess)**
```
Analise as pastas com versões do jogo de xadrez (chess) e crie uma nova pasta
com uma implementação melhorada em HTML, CSS e JavaScript.
```
*Finalidade:* Testar capacidade de análise de código existente e geração de versão refatorada.

---

### 2.2 Prompts de Desenvolvimento do Projeto Final

Estes prompts foram utilizados diretamente na construção do **DIO Explorer** com o IBM Bob.

---

**Prompt — Configuração inicial do `.bobignore`**
```
Crie um arquivo .bobignore adequado para este projeto Node.js/TypeScript,
excluindo node_modules, variáveis de ambiente, logs e arquivos temporários.
Adicione comentários explicativos em cada regra.
```
*Finalidade:* Definir quais arquivos o agente Bob não deve indexar ou processar.

---

**Prompt — Criação do servidor MCP**
```
Crie um servidor MCP completo em TypeScript/Node.js que exponha as ferramentas
trilha_listar, trilha_detalhar, desafio_gerar e certificado_gerar.
Use @modelcontextprotocol/sdk e zod para validação de schemas.
O servidor deve operar via stdio e ser autocontido.
```
*Finalidade:* Implementar o servidor MCP que integra o catálogo de trilhas ao IBM Bob.

---

**Prompt — Configuração dos Slash Commands**
```
Crie os arquivos .bob/commands/trilha.md, desafio.md, certificado.md e ajuda-dio.md
com YAML frontmatter (description, argument-hint) e instruções detalhadas para o Bob
sobre como interpretar argumentos, validar entradas e formatar saídas em Markdown.
```
*Finalidade:* Registrar os comandos `/trilha`, `/desafio`, `/certificado` e `/ajuda-dio` no Bob.

---

**Prompt — Configuração do Hook de log**
```
Crie um hook PostToolUse em .bob/settings.json que execute um script Node.js ESM
(.bob/hooks/dio-command-logger.mjs) sempre que write_file, apply_diff,
search_and_replace ou insert_content forem usados em arquivos DIO.
O hook deve gravar um log em dio_explorer/logs/execucoes.log.
```
*Finalidade:* Rastrear automaticamente todas as modificações em arquivos do projeto DIO Explorer.

---

**Prompt — Suíte de testes**
```
Crie uma suíte completa de testes com Jest + ts-jest para os módulos:
trailService, trilhaLogic, desafioLogic, certificadoLogic e commandRegistry.
Adicione também um teste de integração end-to-end cobrindo o fluxo completo
/trilha → /desafio → /certificado para a trilha TRL-005 (Java).
Configure cobertura mínima de 70% em lines, functions, branches e statements.
```
*Finalidade:* Garantir qualidade, cobertura e confiabilidade de todo o código de produção.

---

**Prompt — Documentação (este arquivo)**
```
Documente todo o projeto desenvolvido até o momento. Crie uma documentação detalhada
em Markdown contendo:
1. Visão Geral: propósito, arquitetura e tecnologias.
2. Histórico de Prompts: todos os prompts utilizados e suas finalidades.
3. Guia e Modos de Uso: passo a passo para execução e integração com o servidor MCP.
4. Dicas de Uso e Boas Práticas.
5. Insights e Aprendizados.
Salve o arquivo como DOCUMENTACAO.md no projeto.
```
*Finalidade:* Gerar a documentação técnica completa do projeto para referência futura e material de estudo.

---

## 3. Guia e Modos de Uso

### 3.1 Pré-requisitos

| Requisito | Versão mínima | Como verificar |
|-----------|--------------|----------------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| IBM Bob | Atualizado | `bob --version` |
| Git | 2.x | `git --version` |

---

### 3.2 Instalação e Setup Inicial

**1. Clone o repositório:**
```bash
git clone https://github.com/<seu-usuario>/projeto_final_dio_formacao_bob.git
cd projeto_final_dio_formacao_bob
```

**2. Instale as dependências do módulo principal (dio_explorer):**
```bash
cd dio_explorer
npm install
```

**3. Compile o módulo principal:**
```bash
npm run build
```

**4. Instale e compile o servidor MCP:**
```bash
cd ../mcp
npm install
npm run build
```

**5. Verifique a configuração do MCP no Bob:**

O arquivo `.bob/mcp.json` já aponta para o servidor compilado:
```json
{
  "mcpServers": {
    "dio-explorer": {
      "command": "node",
      "args": ["<caminho-absoluto>/mcp/build/index.js"]
    }
  }
}
```
> **Atenção:** O caminho em `args` deve ser o caminho absoluto correto para sua máquina. Atualize-o se necessário.

---

### 3.3 Uso via IBM Bob (Slash Commands no Chat)

Com o Bob aberto no workspace, os seguintes comandos estão disponíveis digitando `/` no chat:

#### `/trilha` — Explorar Trilhas

```
/trilha --listar                         → Lista todas as 30 trilhas
/trilha --listar --nivel Iniciante        → Filtra por nível
/trilha --listar --categoria Cloud        → Filtra por categoria
/trilha --listar --tecnologia Python      → Filtra por tecnologia
/trilha --id TRL-001                      → Detalhes + plano de estudo semanal
/trilha machine learning                  → Busca livre
```

#### `/desafio` — Gerar Desafio Prático

```
/desafio --id TRL-001                         → Desafio médio (padrão)
/desafio --id TRL-005 --dificuldade difícil   → Desafio avançado
/desafio TRL-003 --dificuldade fácil          → Forma abreviada
```

| Dificuldade | XP Multiplicador | Entregáveis |
|-------------|-----------------|-------------|
| `fácil` | 0.5× base | ≥ 3 |
| `médio` | 1.0× base | ≥ 4 |
| `difícil` | 1.8× base | ≥ 6 |

#### `/certificado` — Emitir Certificado

```
/certificado --id TRL-001 --nome Maria Fernanda Costa
/certificado --id TRL-005 --nome João Pedro Silva
```

#### `/ajuda-dio` — Menu de Ajuda

```
/ajuda-dio    → Exibe todos os comandos disponíveis com exemplos
```

---

### 3.4 Uso via MCP Tools (Integração Direta com o Agente)

O servidor MCP expõe as ferramentas diretamente ao modelo. Quando o IBM Bob precisa consultar trilhas ou gerar conteúdo, ele chama automaticamente as tools via protocolo:

| Tool MCP | Equivalente Slash | Chamada pelo Bob quando... |
|----------|------------------|---------------------------|
| `trilha_listar` | `/trilha --listar` | Usuário pede lista de trilhas |
| `trilha_detalhar` | `/trilha --id` | Usuário pede detalhes de trilha específica |
| `desafio_gerar` | `/desafio --id` | Usuário solicita um desafio prático |
| `certificado_gerar` | `/certificado` | Usuário quer gerar um certificado |

**Exemplo de chamada programática da tool MCP:**
```json
{
  "tool": "desafio_gerar",
  "arguments": {
    "id": "TRL-005",
    "dificuldade": "difícil"
  }
}
```

---

### 3.5 Uso via Linha de Comando (Node.js)

O módulo `dio_explorer` também pode ser executado diretamente:

```bash
cd dio_explorer

# Em desenvolvimento (ts-node)
npx ts-node src/index.ts "/trilha --listar"
npx ts-node src/index.ts "/trilha --id TRL-001"
npx ts-node src/index.ts "/desafio --id TRL-005 --dificuldade difícil"
npx ts-node src/index.ts "/certificado --id TRL-001 --nome Gean Lima"

# Após build (JavaScript compilado)
npm run build
npm start "/trilha --tecnologia Python"
npm start "/desafio TRL-003"
```

---

### 3.6 Uso Programático (Integração em Código)

```typescript
import { dispatch } from "./src/commandRegistry";

// Consultar trilha
const trilha = dispatch("/trilha --id TRL-001");
if (trilha.success) console.log(trilha.output);

// Gerar desafio
const desafio = dispatch("/desafio --id TRL-005 --dificuldade médio");

// Emitir certificado
const cert = dispatch("/certificado --id TRL-001 --nome Maria Silva");
if (!cert.success) console.error(cert.output); // mensagem de erro descritiva
```

O `CommandResult` retornado sempre tem a estrutura:
```typescript
interface CommandResult {
  success: boolean; // true = operação bem-sucedida
  output: string;   // Markdown formatado (sucesso) ou mensagem de erro (falha)
}
```

---

### 3.7 Executando os Testes

```bash
cd dio_explorer

# Todos os testes (unitários + integração) com cobertura
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Modo CI (saída compacta)
npm run test:ci

# Verificação de tipos sem compilar
npm run lint
```

**Resultados esperados (27/09/2026):**

| Métrica | Alvo | Obtido |
|---------|------|--------|
| Suítes | 6/6 | ✅ 6/6 |
| Testes | 195/195 | ✅ 195/195 |
| Statements | ≥ 70% | ✅ 95.45% |
| Branches | ≥ 60% | ✅ 85.13% |
| Functions | ≥ 70% | ✅ 100.00% |
| Lines | ≥ 70% | ✅ 95.13% |

---

### 3.8 Hook de Log Automático

O hook registrado em `.bob/settings.json` executa automaticamente após qualquer operação de escrita em arquivos do projeto DIO Explorer. O log é gravado em `dio_explorer/logs/execucoes.log` com o formato:

```
[2026-09-27T03:43:00.000Z] tool=write_file file=dio_explorer/data/trilhas_dio.json
[2026-09-27T03:44:10.000Z] tool=apply_diff file=dio_explorer/src/services/trailService.ts
```

Esse log é automaticamente ignorado pelo `.bobignore` e não é versionado no Git (via `.gitignore`).

---

## 4. Dicas de Uso e Boas Práticas

### 4.1 Segurança de Credenciais

- **Nunca** armazene tokens, senhas ou chaves de API diretamente no código ou em arquivos versionados.
- Use o **Windows Credential Manager** (ou equivalente no macOS/Linux) para tokens Git:
  ```bash
  git config --global credential.helper manager-core
  ```
- Mantenha o `.gitignore` atualizado com `.env`, `.env.*`, `*.key`, `*.pem`.
- Use o `.env.example` como template documentado — valores reais nunca devem aparecer nele.
- O `.bobignore` protege arquivos sensíveis de serem indexados pelo agente Bob.

### 4.2 Configuração do `.bobignore`

Mantenha o `.bobignore` sincronizado com o `.gitignore`. Itens que devem **sempre** constar:

```
node_modules/      # Centenas de MB de dependências — polui o contexto do agente
.env               # Segredos
*.log              # Logs de execução — mudam a cada run
logs/              # Diretórios de log
*.tmp              # Temporários
```

A exclusão de `node_modules/` é especialmente crítica: sem ela, o Bob tentaria indexar milhares de arquivos de dependências, tornando as respostas lentas e potencialmente incorretas.

### 4.3 Organização dos Slash Commands

- Cada arquivo `.md` em `.bob/commands/` se torna um slash command: o nome do arquivo = nome do comando.
- Use **YAML frontmatter** para fornecer metadados ao Bob:
  ```yaml
  ---
  description: Texto curto exibido no menu /
  argument-hint: "--id <ID> [--opcao valor]"
  ---
  ```
- Escreva as instruções do comando como se fosse um **system prompt** para o Bob: seja específico sobre validações, formatos de saída e comportamento em caso de erro.
- Use `$ARGUMENTS` para referenciar os argumentos digitados pelo usuário.
- **Nunca invente dados** — instrua o Bob a ler sempre os arquivos de dados locais.

### 4.4 Desenvolvimento do Servidor MCP

- Mantenha o servidor MCP **autocontido**: todos os tipos e lógica de negócio devem estar no mesmo arquivo ou módulo, evitando dependências externas desnecessárias.
- Use **Zod** para validação de schemas de entrada — isso garante mensagens de erro claras para o agente.
- Configure `"type": "module"` no `package.json` do MCP para compatibilidade com ES Modules.
- O caminho do arquivo de dados (`trilhas_dio.json`) deve ser resolvido com `import.meta.url` e `fileURLToPath` para funcionar corretamente tanto em desenvolvimento quanto em produção.
- Após qualquer alteração no código fonte, lembre-se de recompilar (`npm run build`) antes de usar.

### 4.5 Testes Automatizados

- Configure **thresholds de cobertura** no `package.json` para garantir que novos PRs não reduzam a qualidade:
  ```json
  "coverageThreshold": {
    "global": { "lines": 70, "functions": 70, "branches": 60 }
  }
  ```
- Escreva testes de **integração** além dos unitários: eles validam a cadeia completa e detectam problemas de integração entre módulos.
- Separe os testes em `tests/unit/` e `tests/integration/` para facilitar execução seletiva.
- Trate `ValidationError` e erros inesperados de forma distinta nos handlers — isso permite testes de erro mais precisos.

### 4.6 Prompts Eficazes para o IBM Bob

- **Seja específico sobre o formato de saída**: ao pedir código, indique a linguagem, o arquivo de destino e o estilo esperado.
- **Forneça contexto do projeto**: mencione tecnologias em uso, convenções adotadas e estrutura de pastas antes de pedir alterações.
- **Prompts iterativos**: para tarefas complexas, divida em etapas. O Bob mantém contexto da conversa — use-o.
- **Valide antes de aceitar**: ao receber código gerado, revise a lógica antes de aplicar. O Bob pode ser muito confiante mesmo quando está errado.
- **Use o modo Plan** para planejar antes de implementar em tarefas de alta complexidade.

### 4.7 Hooks de Ciclo de Vida

- Hooks do tipo `PostToolUse` são executados **após** cada uso de ferramenta — ideal para logging, notificações e validações.
- O `matcher` aceita **regex**: use-o para filtrar exatamente quais tools disparam o hook.
- Hooks devem **falhar silenciosamente** (`process.exit(0)`) para nunca interromper o fluxo principal do Bob.
- Mantenha hooks leves e rápidos (< 5 segundos de timeout configurado).

### 4.8 Gestão do Repositório

- Use **mensagens de commit descritivas** e semânticas (feat:, fix:, docs:, test:, chore:).
- Mantenha o `README.md` atualizado com a visão geral pública do projeto.
- Use o workflow **Create Pull Request** do Bob (digitar "create PR" no chat) para gerar descrições automáticas de PRs a partir do diff.
- A data no `README.md` (`*Início do projeto: 24/09/2026*`) serve como referência histórica — não altere retroativamente.

---

## 5. Insights e Aprendizados

Esta seção consolida as principais lições aprendidas ao longo do projeto, organizadas por tema, para servir de guia a futuros desenvolvedores que estudarem este repositório.

---

### 5.1 O IBM Bob não é um Assistente Genérico — é um Parceiro de SDLC

A diferença fundamental que o bootcamp deixou clara: o IBM Bob não foi projetado para conversas abertas, mas para atuar em **todas as fases do ciclo de desenvolvimento de software**. Isso significa que:

- Ele lê e modifica arquivos reais do projeto
- Executa comandos no terminal
- Rastreia mudanças via Git
- Usa ferramentas externas via MCP
- Mantém contexto ao longo de uma sessão de trabalho

Tratar o Bob como "mais um chatbot" é subutilizá-lo. O ganho real aparece quando você o posiciona como um **membro da equipe** que entende o codebase.

---

### 5.2 O MCP (Model Context Protocol) é a Extensibilidade Real do Agente

O MCP é o mecanismo que transforma o Bob de um agente fixo em uma plataforma extensível. Aprendizados-chave:

- Qualquer funcionalidade pode ser exposta ao Bob como uma **MCP Tool** com schema bem definido.
- O servidor MCP opera via **stdio** por padrão — não requer configuração de rede para uso local.
- A **validação de schema com Zod** é essencial: sem ela, o agente pode passar dados inválidos para suas ferramentas.
- Um servidor MCP bem construído é **autocontido** e pode ser reutilizado por qualquer cliente MCP (Claude Desktop, Cursor, etc.), não apenas pelo Bob.

---

### 5.3 Slash Commands Locais São Mais Poderosos que Parecem

Os arquivos `.bob/commands/*.md` parecem simples, mas são uma forma poderosa de **codificar workflows repetitivos como instruções reutilizáveis**. O frontmatter YAML define a interface (o que o usuário vê no menu `/`), enquanto o corpo Markdown define o comportamento completo do agente ao executar o comando.

Pense em cada comando como um **micro-sistema especialista**: ele tem regras de validação, formato de saída padronizado, mensagens de erro específicas e comportamento determinístico.

---

### 5.4 A Limitação de Geração de Imagem é uma Oportunidade de Adaptação

Um dos aprendizados mais valiosos veio de uma limitação: o IBM Bob não gera imagens. Quando o prompt para geração de imagem de um casal numa estrada chegou, a resposta foi não falhar com uma mensagem de erro, mas **adaptar criativamente** para uma arte ASCII estruturada.

Lição: **identifique as capacidades reais do seu agente e projete prompts dentro dessas capacidades**. Tentar forçar algo que o modelo não faz gera frustração. Adaptar o objetivo dentro das possibilidades gera resultados surpreendentes.

---

### 5.5 Cobertura de Testes Deve Ser uma Decisão Técnica, Não um Número

O projeto atingiu 95.45% de cobertura de statements e 100% de cobertura de funções — bem acima da meta de 70%. Mas o relatório de testes aponta algo mais importante: **0% de cobertura de branches em `commands/*.ts`** é intencional, pois esses branches representam erros inesperados (não-`ValidationError`) que são intencionalmente fora do escopo de negócio.

Lição: cobertura de testes é uma ferramenta, não um objetivo. Um bloco `catch` para erros impossíveis no domínio não precisa de teste — forçá-lo seria um teste sem valor. Priorize cobertura das **regras de negócio reais**.

---

### 5.6 Separação de Responsabilidades Torna o Código Testável

A arquitetura do `dio_explorer` separa claramente:
- `commands/` → Interface (metadados + handler fino)
- `services/` → Lógica de negócio
- `data/` → Fonte de dados
- `types.ts` → Contratos

Essa separação não foi um capricho arquitetural — ela foi o que tornou possível atingir 195 testes sem mocks complexos. Cada camada é testável de forma independente.

---

### 5.7 Hooks São a Cola Silenciosa do Fluxo de Trabalho

O hook `PostToolUse` registrado em `.bob/settings.json` passa completamente despercebido durante o uso normal — e esse é exatamente o ponto. Um hook bem escrito é **invisível ao usuário** mas agrega valor contínuo (neste caso, auditoria de todas as modificações em arquivos DIO).

Características de um bom hook:
1. Falha silenciosamente (nunca quebra o fluxo principal)
2. Executa rapidamente (timeout configurado em 5s)
3. É específico em seu matcher (regex precisa)
4. Tem uma única responsabilidade

---

### 5.8 A Integração Git + Bob Muda o Fluxo de Trabalho

Com o Bob no fluxo Git, tarefas que antes exigiam vários passos manuais tornam-se fluidas:
- Gerar descrições de PR automaticamente a partir do diff
- Revisar código antes de commitar
- Criar changelogs baseados no histórico de commits
- Detectar vulnerabilidades em dependências antes do push

Para equipes, isso representa uma oportunidade de **elevar o padrão de qualidade do repositório** sem aumentar o overhead de processo.

---

### 5.9 Prompt Engineering é uma Habilidade Técnica Mensurável

Ao longo dos 16 prompts de exploração inicial, padrões claros emergiram sobre o que torna um prompt eficaz:

| Característica | Exemplo Fraco | Exemplo Forte |
|---------------|--------------|---------------|
| **Especificidade de saída** | "Analise o arquivo" | "Analise e salve o resultado em leitura_audio.txt" |
| **Contexto do domínio** | "Crie um dashboard" | "Com base nos dados do arquivo xlsx, crie um dashboard HTML/CSS/JS com gráficos interativos" |
| **Delimitação de escopo** | "Descreva tendências" | "Descreva em no máximo 10 linhas..." |
| **Ação esperada** | "Veja o ranking FIFA" | "Pesquise na web e salve os Top 5 em rank_fifa.txt" |

A regra prática: **um bom prompt define entrada, processamento e saída de forma inequívoca**.

---

### 5.10 Para Futuros Desenvolvedores: O que Estudar Neste Repositório

Se você chegou a este repositório como material de estudo, recomendo a seguinte ordem de exploração:

1. **`.bob/mcp.json`** e **`mcp/src/index.ts`** — entenda como um servidor MCP é registrado e implementado. É o core técnico do projeto.
2. **`.bob/commands/trilha.md`** — veja como um slash command é estruturado com frontmatter e instruções para o agente.
3. **`.bob/settings.json`** e **`.bob/hooks/dio-command-logger.mjs`** — entenda o mecanismo de hooks.
4. **`dio_explorer/src/types.ts`** — leia os contratos antes do código.
5. **`dio_explorer/src/commandRegistry.ts`** — entenda o padrão Registry + Dispatcher.
6. **`dio_explorer/docs/relatorio-testes.txt`** — leia o relatório de testes completo como referência de qualidade.
7. **`Primeiros testes realizados com o IBM Bob.txt`** — os registros de exploração inicial mostram o processo de descoberta das capacidades do agente.

A sequência importa: comece pelos contratos (types), depois a integração (MCP), depois o comportamento (commands), depois os testes.

---

> **"A melhor forma de aprender a trabalhar com agentes de IA é construir algo real com eles — não apenas ler sobre suas capacidades."**  
> — Lição central deste bootcamp

---

*Documentação gerada em: 2026 · Projeto: DIO × IBM Bob · Autor: geanclm*
