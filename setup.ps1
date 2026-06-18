<#
Script de setup para Windows PowerShell.
Tarefas:
- Verifica se o Node.js está instalado
- Tenta instalar via winget (se disponível)
- Gera .env.example se não existir
- Executa npm install
#>
Write-Host "Iniciando setup do projeto Revitalize/Whatsapp..."

function Test-Command {
	param([string]$cmd)
	$null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (Test-Command node) {
	Write-Host "Node encontrado: $(node -v)"
} else {
	Write-Host "Node não encontrado no PATH. Tentando instalar via winget..."
	if (Test-Command winget) {
		Write-Host "winget detectado. Instalando Node.js LTS (pode requerer privilégios de administrador)..."
		try {
			winget install --id OpenJS.Node.LTS -e
			if ($LASTEXITCODE -ne 0) {
				Write-Host "Falha ao instalar via winget (código $LASTEXITCODE). Instale Node.js manualmente: https://nodejs.org/"
			}
		} catch {
			Write-Host "Falha ao executar winget. Instale Node.js manualmente: https://nodejs.org/"
		}
	} else {
		Write-Host "winget não disponível. Por favor instale Node.js manualmente: https://nodejs.org/"
	}
}

# Aguardar que node esteja disponível (opcional)
try {
	$nodeVersion = & node -v 2>$null
	if (-not $nodeVersion) { Write-Host "Node ainda não disponível. Por favor reinicie o terminal após instalação." }
} catch { Write-Host "Node não disponível no momento." }

# Criar .env.example se não existir
$envFile = ".env.example"
if (-Not (Test-Path $envFile)) {
	@"
# Exemplo de variáveis de ambiente
PORT=3000
VITE_API_URL=http://localhost:3001
API_PORT=3001
JWT_SECRET=troque_para_uma_senha_segura
DATABASE_URL=sqlite://server/db.json
LOG_LEVEL=info
"@ | Out-File -Encoding UTF8 $envFile
	Write-Host ".env.example criado. Atualize conforme necessário."
} else {
	Write-Host ".env.example já existe."
}

# Instalar dependências npm
if (Test-Command npm) {
	Write-Host "Instalando dependências npm (npm install)..."
	npm install
} else {
	Write-Host "npm não encontrado. Certifique-se de que o Node.js foi instalado corretamente e que npm está no PATH."
}

Write-Host "Setup concluído. Para iniciar o frontend (dev): npm run dev. Para iniciar o backend: npm run server"
