# EcoDoacao Frontend (TypeScript + Bootstrap)

Este repositório contém a versão frontend do Eco Doação implementada com TypeScript puro e Bootstrap — sem React.

Como usar (Windows PowerShell):

1. Instalar dependências de desenvolvimento (TypeScript):

```powershell
npm install
```

2. Compilar TypeScript para `dist/`:

```powershell
npm run build
```

Isso gera `dist/app.js`. Os arquivos HTML já foram atualizados para carregar `dist/app.js` como módulo.

Para desenvolvimento (Vite, com HMR):

```powershell
npm run dev
# abra a URL mostrada pelo Vite, ex.: http://localhost:5173/
```

Notas:
- A pasta `mock/` e o uso de `json-server` foram removidos do projeto para manter o frontend autônomo.
- Se você quiser reintroduzir um backend de desenvolvimento (por exemplo, `json-server` ou um pequeno servidor Express para uploads), eu posso adicionar isso novamente como opção.

Bom trabalho e aproveite o desenvolvimento!
