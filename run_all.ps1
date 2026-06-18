<#
Wrapper PowerShell para executar setup_all.ps1 com checagens mínimas.
Uso:
  .\run_all.ps1         -> executa setup_all.ps1
  .\run_all.ps1 -UseDocker -> executa setup_all.ps1 -UseDocker
#>

param(
	[switch]$UseDocker
)

Write-Host "Executando wrapper run_all.ps1..." -ForegroundColor Cyan

$scriptPath = Join-Path $PSScriptRoot 'setup_all.ps1'
if (-Not (Test-Path $scriptPath)) {
	Write-Error "Arquivo setup_all.ps1 não encontrado na pasta. Execute este script na raiz do repositório."
	exit 1
}

if ($UseDocker) {
	Write-Host "Chamando setup_all.ps1 com -UseDocker" -ForegroundColor Green
	powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -UseDocker
} else {
	Write-Host "Chamando setup_all.ps1" -ForegroundColor Green
	powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath
}
