<#
    Clean teardown + full rebuild of the stack (app + observability).
    Windows/PowerShell equivalent of rebuild.sh.

    Recreates EVERY service so nothing is left behind by a partial rebuild or a
    chaos run -- a partial `docker compose up --build <subset>` can REMOVE
    containers it does not name (the gateway, say), and the load test then
    measures a stack that is quietly broken.

      .\rebuild.ps1              rebuild everything, KEEP database data
      .\rebuild.ps1 -NoCache     rebuild images from scratch (slower, surest)
      .\rebuild.ps1 -Wipe        ALSO delete the databases (DATA LOSS)

    If PowerShell blocks the script, run it for this session only with:
      powershell -ExecutionPolicy Bypass -File .\rebuild.ps1
#>
[CmdletBinding()]
param(
    [switch]$Wipe,
    [switch]$NoCache
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot          # run from repo root

$compose = @(
    'compose',
    '-f', 'docker-compose.yaml',
    '-f', 'observability/docker-compose.observability.yaml'
)

function Invoke-Compose {
    param([string[]]$ComposeArgs)
    & docker @compose @ComposeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose $($ComposeArgs -join ' ') failed (exit $LASTEXITCODE)"
    }
}

Write-Host '==> 1/4  Tearing down containers + networks...'
if ($Wipe) {
    Write-Host '         (-Wipe: also removing volumes - DATABASE DATA WILL BE DELETED)'
    Invoke-Compose @('down', '--remove-orphans', '--volumes')
} else {
    Invoke-Compose @('down', '--remove-orphans')      # volumes (DB data) kept
}

if ($NoCache) {
    Write-Host '==> 2/4  Building all images (no cache)...'
    Invoke-Compose @('build', '--no-cache')
} else {
    Write-Host '==> 2/4  Building all images...'
    Invoke-Compose @('build')
}

Write-Host '==> 3/4  Starting the whole stack...'
Invoke-Compose @('up', '-d')

Write-Host '==> 4/4  Waiting for the API gateway on :8000 (what the load test hits)...'
$up = $false
foreach ($i in 1..45) {                               # up to ~90s
    try {
        Invoke-WebRequest -Uri 'http://localhost:8000/' -TimeoutSec 3 `
            -UseBasicParsing -ErrorAction Stop | Out-Null
        $up = $true
    } catch {
        # Any HTTP response means the gateway is listening; only a connection
        # failure means it is still down.
        if ($null -ne $_.Exception.Response) { $up = $true }
    }
    if ($up) { Write-Host '         Gateway is up.'; break }
    Start-Sleep -Seconds 2
}

Write-Host ''
Write-Host '==> Container status:'
Invoke-Compose @('ps')
Write-Host ''

if (-not $up) {
    Write-Warning 'Gateway never answered on :8000 - check: docker compose logs api-gateway'
    exit 1
}

Write-Host 'Stack is up. Now run the full analysis (load sweep + chaos/failure injection):'
Write-Host '     python -m analyzer systems/finki-blogger.toml'
