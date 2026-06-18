<#
Script de preparação e checagem (Windows PowerShell)
Uso: .\setup_all.ps1 [-UseDocker]

O script verifica pré-requisitos (Node/npm, Docker opcional), instala dependências
no root e em server-stubs e executa os testes dos stubs.

Não tenta forçar instalação de Node/Docker automaticamente — apenas instrui.
#>

param(
	[switch]$UseDocker
)

function Test-Command {
	param([string]$cmd)
	return $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

Write-Host "== Setup All: Preparando o ambiente do projeto =="

# Node/npm
if (-not (Test-Command node) -or -not (Test-Command npm)) {
	Write-Host "Node.js/npm não encontrado no PATH." -ForegroundColor Yellow
	Write-Host "Por favor instale Node.js LTS: https://nodejs.org/" -ForegroundColor Cyan
	Write-Host "Após a instalação, reabra o terminal e execute este script novamente." -ForegroundColor Cyan
	exit 1
} else {
	Write-Host "Node detectado: $(node -v)  npm: $(npm -v)" -ForegroundColor Green
}

# Docker (opcional)
if ($UseDocker) {
	if (-not (Test-Command docker)) {
		Write-Host "Você solicitou usar Docker, mas docker não foi encontrado." -ForegroundColor Yellow
		Write-Host "Instale Docker Desktop e execute novamente com -UseDocker, ou execute sem essa opção para usar Node local." -ForegroundColor Cyan
		exit 1
	} else {
		Write-Host "Docker detectado: $(docker --version)" -ForegroundColor Green
	}
}

Write-Host "Instalando dependências do projeto (root)..." -ForegroundColor Cyan
Push-Location .
try {
	npm ci
} catch {
	Write-Host "Erro ao executar 'npm ci' na raiz: $_" -ForegroundColor Red
	Pop-Location
	exit 1
}

Write-Host "Instalando dependências do server-stubs..." -ForegroundColor Cyan
if (Test-Path "server-stubs") {
	Push-Location server-stubs
	try {
		npm ci
	} catch {
		Write-Host "Erro ao executar 'npm ci' em server-stubs: $_" -ForegroundColor Red
		Pop-Location
		Pop-Location
		exit 1
	}
	Pop-Location
} else {
	Write-Host "Pasta server-stubs não encontrada. Pulando instalação dos stubs." -ForegroundColor Yellow
}

Write-Host "Executando build do frontend (opcional)..." -ForegroundColor Cyan
try {
	npm run build --if-present
} catch {
	Write-Host "Aviso: build falhou ou não está configurado. Você pode executar 'npm run build' manualmente." -ForegroundColor Yellow
}

Write-Host "Executando testes dos stubs..." -ForegroundColor Cyan
if (Test-Path "server-stubs") {
	Push-Location server-stubs
	try {
		npm test
	} catch {
		Write-Host "Os testes falharam. Verifique logs acima." -ForegroundColor Red
		Pop-Location
		Pop-Location
		exit 1
	}
	Pop-Location
}

if ($UseDocker) {
	Write-Host "Subindo containers via docker-compose... (CTRL+C para cancelar)" -ForegroundColor Cyan
	docker-compose up --build
}

Write-Host "Setup concluído com sucesso." -ForegroundColor Green
Pop-Location
