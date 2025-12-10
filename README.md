# EcoDoação Frontend

Frontend da aplicação **Eco Doação**, uma plataforma universitária que incentiva doações de materiais recicláveis em troca de moedas virtuais e badges.

## 🛠️ Tecnologias

- **TypeScript** - Linguagem principal
- **Vite** - Build tool e servidor de desenvolvimento
- **Bootstrap 5** - Framework CSS para UI
- **Axios** - Cliente HTTP

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

### Unit Tests (Jest)
- Scripts:
	- `npm run test`: executa a suíte uma vez
	- `npm run test:watch`: modo observação
	- `npm run test:ci`: modo CI
- Ambiente: `jest-environment-jsdom`.
- Transpile: `ts-jest` (ESM) com `module: ES2020`.
- Setup: `@testing-library/jest-dom` e polyfills `atob`/`btoa` em `jest.setup.js`.
- Mapeamentos: estilos/arquivos mockados via `test/__mocks__/styleMock.js` e `test/__mocks__/fileMock.js`.
- Exemplos de testes em `src/__tests__/`: `html.test.ts`, `notifications.test.ts`, `permissions.test.ts`, `auth.services.test.ts`.
- Nota: módulos com `import.meta.env` (padrão Vite) são isolados via mocks em `src/services/__mocks__/http.ts` e `src/config/__mocks__/api.ts`. Alguns testes podem estar com `describe.skip` até suporte completo.

### E2E Tests (Cypress)
- Base URL: `http://localhost:5173` (configurada em `cypress.config.ts`).
- Scripts:
	- `npm run e2e:open`: sobe Vite e abre a UI do Cypress (interativo)
	- `npm run e2e:run`: sobe Vite e executa os testes em headless
	- Alternativa: abrir em dois terminais — `npm run dev` e, em outro, `npm run cy:open` (ou `npm run cy:run`).
- Specs (em `cypress/e2e/`): `smoke.cy.ts`, `login.cy.ts`, `dashboard.cy.ts`, `galeria.cy.ts`.

### Solução de problemas
- Cypress UI não abriu:
	- Verificar instalação: `npx cypress verify` ou `npx cypress open --browser chrome`.
	- Rode `npm run dev` separadamente e então `npm run cy:open`.
	- Em ambientes com proxy/firewall, use `127.0.0.1` e libere porta `5173`.
- Jest e `import.meta`:
	- Mockar módulos que dependem de `import.meta.env` (ex.: `src/services/http.ts`, `src/config/api.ts`).
	- Alternativa futura: migrar para `babel-jest` para suporte amplo a `import.meta`.
- Navegação no jsdom:
	- jsdom não executa navegação real; valide retornos lógicos. Use Cypress para testes de navegação.

## 📱 Funcionalidades

- **Autenticação**: Login/Cadastro com validação de email @ufrpe.br
- **Dashboard**: Visualização de saldo de moedas e badges
- **Submissão de Doações**: Upload de fotos de doações para validação
- **Histórico**: Visualização do histórico de doações com filtros
- **Galeria de Badges**: Sistema de badges que podem ser compradas ou conquistadas
- **Perfil**: Edição de dados do usuário e alteração de senha
- **Admin**: Painel para validação de doações pendentes

## 🔒 Segurança

O projeto implementa:
- Sanitização de HTML com `escapeHtml()` para prevenir XSS
- Tokens JWT com refresh automático
- Validação de entrada no lado do cliente
- Proteção de rotas por autenticação e permissão de admin

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos na UFRPE.

