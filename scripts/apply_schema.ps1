<#
Apply Supabase schema helper

This script will attempt to apply `supabase/schema.sql` to your database.
It prefers the Supabase CLI (recommended). If `supabase` is not installed,
it will fall back to `psql` if available.

USAGE (recommended - Supabase CLI):
  supabase login
  supabase link --project-ref <your-project-ref>   # optional
  .\scripts\apply_schema.ps1 -UseSupabaseCli

USAGE (psql fallback):
  $env:DATABASE_URL = 'postgresql://postgres:22562310@db.oluqgthjdyqffrrbnrls.supabase.co:5432/postgres'
  .\scripts\apply_schema.ps1

Security note: Never commit or share your DB credentials. Prefer the Supabase CLI which uses a safer auth flow.
#>
param(
  [switch]$UseSupabaseCli
)

$schemaFile = Join-Path $PSScriptRoot "..\supabase\schema.sql"
if (-not (Test-Path $schemaFile)) {
  Write-Error "Schema file not found: $schemaFile"
  exit 1
}

if ($UseSupabaseCli) {
  if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Error "Supabase CLI not found. Install it: https://supabase.com/docs/guides/cli"
    exit 1
  }
  Write-Output "Applying schema using Supabase CLI..."
  supabase db push --file $schemaFile
  exit $LASTEXITCODE
}

# Fallback to psql
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  Write-Error "Neither Supabase CLI nor psql found. Install one and retry."
  exit 1
}

# Use DATABASE_URL env var if provided, else prompt for components
$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
  $dbHost = Read-Host "Database host (e.g. db.xyz.supabase.co)"
  $dbPort = Read-Host "Port (default 5432)"
  if (-not $dbPort) { $dbPort = 5432 }
  $dbName = Read-Host "Database name (default postgres)"
  if (-not $dbName) { $dbName = 'postgres' }
  $dbUser = Read-Host "DB username (default postgres)"
  if (-not $dbUser) { $dbUser = 'postgres' }
  Write-Host "Enter DB password (won't be stored):"
  $securePassword = Read-Host -AsSecureString
  $Bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($Bstr)
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Bstr)

  # Build DATABASE_URL safely using concatenation to avoid interpolation pitfalls
  $databaseUrl = 'postgresql://' + $dbUser + ':' + [System.Uri]::EscapeDataString($plainPassword) + '@' + $dbHost + ':' + $dbPort + '/' + $dbName
}

Write-Output "Applying schema using psql..."
# extract password and connection parts using System.Uri
$uri = [System.Uri]$databaseUrl
$userInfo = $uri.UserInfo.Split(':')
$pgUser = $userInfo[0]
$pgPassword = ''
if ($userInfo.Count -gt 1) { $pgPassword = $userInfo[1] }

# set PGPASSWORD for psql invocation (only in the current process)
$env:PGPASSWORD = [System.Uri]::UnescapeDataString($pgPassword)

$dbHost = $uri.Host
$dbPort = $uri.Port
$dbName = $uri.AbsolutePath.TrimStart('/')

# construct psql command and run it
$psqlCmd = "psql -h $dbHost -p $dbPort -U $pgUser -d $dbName -f `"$schemaFile`""
Write-Output "Running psql to apply schema (command hidden for security)"
Invoke-Expression $psqlCmd
$exitCode = $LASTEXITCODE

# Cleanup environment password
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
  Write-Output "Schema applied successfully."
} else {
  Write-Error "psql exited with code $exitCode"
}

exit $exitCode
