# EcoDoação Frontend

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF)]()
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)]()

Frontend da aplicação **Eco Doação**, uma plataforma universitária que incentiva doações de materiais recicláveis em troca de moedas virtuais e badges.

## 🛠️ Tecnologias

- **TypeScript** - Linguagem principal com tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento de alta performance
- **Bootstrap 5** - Framework CSS para UI responsiva
- **Axios** - Cliente HTTP para comunicação com API
- **Jest** - Framework de testes unitários
- **Cypress** - Framework de testes E2E
- **Testing Library** - Utilitários para testes de componentes

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Imagens e estilos CSS
├── config/          # Configuração da API
├── core/            # Aplicação principal (app.ts)
├── pages/           # Páginas HTML e scripts específicos
├── services/        # Serviços da API (auth, badges, doações, etc.)
├── types/           # Tipos TypeScript para a API
└── utils/           # Utilitários (navbar, modals, notifications, etc.)
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- npm

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/Ecodoacao-Universitaria/ecodoacao-frontend.git
cd ecodoacao-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a API (crie um arquivo `.env` na raiz):
```env
VITE_API_BASE=https://sua-api.com
VITE_API_PREFIX=api
```

## 💻 Comandos

### Desenvolvimento

```bash
npm run dev
# Servidor disponível em http://localhost:5173/
```

### Build de produção

```bash
npm run build
```

Os arquivos compilados serão gerados em `dist/`.

### Preview do build

```bash
npm run preview
```

## 🧪 Testes (Jest + Cypress)

Este projeto possui cobertura abrangente de testes unitários e E2E.

### Unit Tests (Jest)

#### Executar Testes

```bash
# Executa todos os testes uma vez
npm run test

# Modo watch - reexecuta testes ao modificar arquivos
npm run test:watch

# Modo CI - para integração contínua
npm run test:ci
```

#### Estrutura dos Testes

- **Localização**: `src/__tests__/`
- **Ambiente**: `jest-environment-jsdom` para simular o DOM
- **Transpilação**: `ts-jest` com suporte a ESM
- **Setup**: Configurado em `jest.setup.js` com polyfills e `@testing-library/jest-dom`
- **Mocks**: Estilos e arquivos mockados via `test/__mocks__/`

#### Testes Disponíveis

| Módulo | Arquivo | Cobertura |
|--------|---------|-----------|
| HTML Utils | `html.test.ts` | Sanitização de entrada |
| Notificações | `notifications.test.ts` | Toasts, erros de API, sucessos |
| Permissões | `permissions.test.ts` | Roles e autorização |
| Autenticação | `auth.services.test.ts` | Login, logout, tokens |
| Wallet | `wallet.test.ts` | Saldo, badges, UI updates |
| Doações | `doacoes.services.test.ts` | Validação, formatação, status |
| Badges | `badge.services.test.ts` | Formatação de datas |
| Modais | `modals.test.ts` | Confirmações e inputs |

#### Nota sobre `import.meta`

Alguns módulos usam `import.meta.env` (padrão Vite). Para testá-los no Jest:
- Módulos como `http.ts` e `api.ts` possuem mocks em `__mocks__/`
- Testes usam `jest.isolateModulesAsync()` para isolar módulos problemáticos
- Testes com `describe.skip` aguardam melhor suporte futuro

### E2E Tests (Cypress)

#### Executar Testes E2E

```bash
# Modo interativo - abre UI do Cypress
npm run e2e:open

# Modo headless - executa todos os testes
npm run e2e:run

# Alternativa: rodar dev server e Cypress separadamente
# Terminal 1:
npm run dev

# Terminal 2:
npm run cy:open  # ou cy:run
```

#### Estrutura dos Testes E2E

- **Base URL**: `http://localhost:5173` (configurada em `cypress.config.ts`)
- **Specs**: Localizadas em `cypress/e2e/`
- **Support**: Comandos customizados em `cypress/support/`

#### Testes E2E Disponíveis

| Spec | Arquivo | Cobertura |
|------|---------|-----------|
| Smoke Test | `smoke.cy.ts` | Carregamento básico |
| Login | `login.cy.ts` | Autenticação e validação |
| Cadastro | `cadastro.cy.ts` | Registro de usuários |
| Dashboard | `dashboard.cy.ts` | Página principal |
| Galeria | `galeria.cy.ts` | Visualização de badges |
| Doação | `doacao.cy.ts` | Submissão de doações |
| Histórico | `historico.cy.ts` | Listagem de doações |
| Perfil | `perfil.cy.ts` | Edição de perfil |

### Solução de problemas

#### Cypress UI não abriu

1. Verificar instalação:
```bash
npx cypress verify
npx cypress open --browser chrome
```

2. Rodar dev server separadamente:
```bash
npm run dev  # em um terminal
npm run cy:open  # em outro terminal
```

3. Em ambientes com proxy/firewall:
- Use `127.0.0.1` no lugar de `localhost`
- Libere a porta `5173`

#### Jest e `import.meta`

- Mockar módulos que dependem de `import.meta.env`:
  - `src/services/http.ts`
  - `src/config/api.ts`
- Ver exemplos em `src/__tests__/auth.services.test.ts`
- Alternativa futura: migrar para `babel-jest`

#### Navegação no jsdom

- jsdom não executa navegação real
- Valide retornos lógicos em testes unitários
- Use Cypress para testar navegação completa

### Cobertura de Testes

O projeto possui:
- **82+ testes unitários** cobrindo utilitários e serviços
- **8+ suítes E2E** cobrindo fluxos principais de usuário
- Cobertura de casos de borda e validações de segurança

## 📱 Funcionalidades

- **Autenticação**: Login/Cadastro com validação de email @ufrpe.br
- **Dashboard**: Visualização de saldo de moedas e badges
- **Submissão de Doações**: Upload de fotos de doações para validação
- **Histórico**: Visualização do histórico de doações com filtros
- **Galeria de Badges**: Sistema de badges que podem ser compradas ou conquistadas
- **Perfil**: Edição de dados do usuário e alteração de senha
- **Admin**: Painel para validação de doações pendentes

## 🔒 Segurança

O projeto implementa múltiplas camadas de segurança:

### Proteções Implementadas

- **Sanitização de HTML**: Função `escapeHtml()` previne ataques XSS
- **Tokens JWT**: Autenticação segura com refresh automático
- **Validação de Entrada**: Validação no lado do cliente para todas as entradas
- **Proteção de Rotas**: Middleware de autenticação e autorização
- **Validação de Email**: Restrição a domínio @ufrpe.br
- **Upload Seguro**: Validação de tipo e tamanho de arquivo (máx 5MB, apenas JPG/PNG)

### Boas Práticas de Segurança

- Nunca use `innerHTML` com template literals para conteúdo dinâmico
- Sempre use `escapeHtml()` antes de inserir dados de usuário no DOM
- Use `textContent` ou APIs do DOM quando possível
- Tokens são armazenados de forma segura no localStorage
- Erros não expõem informações sensíveis ao usuário

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos na UFRPE.

## 🤝 Contribuindo

### Fluxo de Trabalho

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua feature: `git checkout -b feature/minha-feature`
4. **Faça commits** descritivos: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para sua branch: `git push origin feature/minha-feature`
6. Abra um **Pull Request**

### Padrões de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Atualizações de build, configs, etc

### Antes de Submeter

- ✅ Execute os testes: `npm test`
- ✅ Execute o linter: `npm run build:tsc`
- ✅ Verifique o build: `npm run build`
- ✅ Teste E2E se modificou UI: `npm run e2e:run`
- ✅ Adicione testes para novas funcionalidades
- ✅ Atualize a documentação se necessário

### Code Review

- Código deve seguir o estilo TypeScript do projeto
- Todos os testes devem passar
- Cobertura de testes não deve diminuir
- Código deve ser revisado por pelo menos um membro da equipe

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
ecodoacao-frontend/
├── src/
│   ├── __tests__/          # Testes unitários
│   ├── assets/             # Recursos estáticos (CSS, imagens)
│   ├── config/             # Configuração (API endpoints)
│   ├── core/               # Lógica central (app.ts)
│   ├── pages/              # Páginas HTML e scripts
│   ├── services/           # Serviços de API
│   │   └── __mocks__/      # Mocks para testes
│   ├── types/              # Definições TypeScript
│   └── utils/              # Utilitários compartilhados
├── cypress/
│   ├── e2e/                # Testes E2E
│   └── support/            # Comandos customizados
├── test/
│   └── __mocks__/          # Mocks globais
└── dist/                   # Build de produção
```

### Fluxo de Dados

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Pages (HTML)   │◄──── Vite Dev Server
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Services      │◄──── Tipos TypeScript
│  (API Calls)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HTTP Client   │◄──── Tokens JWT
│    (Axios)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
└─────────────────┘
```

### Camadas da Aplicação

1. **Apresentação** (`pages/`): HTML e scripts específicos de página
2. **Lógica de Negócio** (`services/`): Comunicação com API
3. **Utilitários** (`utils/`): Funções auxiliares reutilizáveis
4. **Configuração** (`config/`): Endpoints e configurações
5. **Tipos** (`types/`): Contratos de dados TypeScript

### Padrões Utilizados

- **Module Pattern**: Encapsulamento de funcionalidades
- **Service Layer**: Abstração de chamadas de API
- **Type Safety**: Tipagem forte com TypeScript
- **Separation of Concerns**: Clara separação de responsabilidades
- **DRY**: Reutilização de código via utilitários

