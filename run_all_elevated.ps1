<#
Script para executar run_all.ps1 com elevação de privilégios (Run as Administrator).
Se já estiver em modo administrador, simplesmente chama run_all.ps1 com os mesmos parâmetros.
Uso:
  .\run_all_elevated.ps1        -> executa run_all.ps1
  .\run_all_elevated.ps1 -UseDocker -> executa run_all.ps1 -UseDocker
#>

param(
	[switch]$UseDocker
)

function Test-IsAdmin {
	$current = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
	return $current.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

$scriptPath = Join-Path $PSScriptRoot 'run_all.ps1'
if (-not (Test-Path $scriptPath)) {
	Write-Error "Arquivo run_all.ps1 não encontrado na pasta. Execute este script na raiz do repositório."
	exit 1
}

if (-not (Test-IsAdmin)) {
	Write-Host "Não está executando como Administrador. Solicitando elevação..." -ForegroundColor Yellow

	$argList = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
	if ($UseDocker) { $argList += ' -UseDocker' }

	try {
		Start-Process -FilePath powershell -ArgumentList $argList -Verb RunAs -WindowStyle Normal
	} catch {
		Write-Error "Falha ao solicitar elevação: $_"
		exit 1
	}

	exit 0
} else {
	Write-Host "Executando com privilégios de Administrador." -ForegroundColor Green
	try {
		if ($UseDocker) {
			& "$scriptPath" -UseDocker
		} else {
			& "$scriptPath"
		}
	} catch {
		Write-Error "Erro ao executar run_all.ps1: $_"
		exit 1
	}
}
