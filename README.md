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

