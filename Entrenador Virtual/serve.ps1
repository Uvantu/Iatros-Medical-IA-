param(
  [int]$Port = 8000
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Levantando Entrenador Virtual en http://localhost:$Port"
Write-Host "La base de datos SQLite quedara en .\\data\\entrenador-virtual.sqlite"

node .\server.js --port $Port
