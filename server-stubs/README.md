# Revitalize Backend Stubs (TypeScript)

Este diretório contém stubs em TypeScript para o backend Revitalize. Servem como ponto de partida para implementar as rotas reais.

Instalação e execução (no computador com Node instalado):

1. Entrar na pasta server-stubs
   cd server-stubs

2. Instalar dependências
   npm install

3. Rodar em modo desenvolvimento (hot-reload):
   npm run dev

4. Build e start:
   npm run build
   npm run start

Endpoints disponíveis (stubs):
- GET / -> status
- POST /api/auth/login
- GET/POST /api/v1/instances
- GET /api/v1/instances/:id/qrcode
- POST /api/v1/messages/send
- GET/POST /api/v1/campaigns
- GET/POST /api/v1/contacts

Observações
- Estas rotas usam armazenamento em memória (reiniciado a cada restart). Substitua por um banco persistente conforme necessário.
