# Instruções detalhadas (Windows) — executar tudo no outro computador

Pré-requisitos (no outro computador):
- Windows 10/11
- Node.js LTS (instale a versão recomendada em https://nodejs.org/)
- (Opcional) Docker Desktop se quiser usar containers

Passos (ordem exata)

1) Abrir PowerShell como Administrador (recomendado)

2) Clonar o repositório (se ainda não):

   git clone https://github.com/CleitonMenegat/Whatsapp.git
   cd Whatsapp

3) Executar o wrapper (opção sem Docker):

   .\run_all.bat

   ou (PowerShell):
   .\run_all.ps1

   O script fará:
   - Verificar Node/npm no PATH
   - Executar npm ci na raiz
   - Executar npm ci em server-stubs
   - Executar npm test em server-stubs (gera coverage)
   - Executar npm run build (se aplicável)

4) Executar com Docker (se preferir containers):

   .\run_all.bat docker
   ou
   .\run_all.ps1 -UseDocker

   O script tentará chamar docker-compose up --build ao final.

5) Comandos manuais úteis (caso queira rodar etapas separadas):

   # Instalar dependências na raiz
   npm ci

   # Instalar dependências dos stubs
   cd server-stubs
   npm ci

   # Rodar testes (gera coverage em server-stubs/coverage)
   npm test

   # Build frontend (opcional)
   cd ..
   npm run build

   # Iniciar backend e frontend em terminais separados
   npm run server
   npm run dev

Notas e solução de problemas
- Se o PowerShell bloquear execução de script: execute
  powershell -ExecutionPolicy Bypass -File .\run_all.ps1

- Se npm não for encontrado, verifique a instalação do Node.js e reinicie o terminal.
- Se usar GitHub Actions e cobertura, verifique README badges e o painel do workflow para logs.

Contato
- Se ocorrer erro, cole aqui a saída do terminal (PowerShell) e eu ajudarei a diagnosticar.
