# Environment Setup Helper for Bingo Nights
# Run this script to set up your environment variables

param(
  [Parameter(Mandatory=$false)]
  [string]$SupabaseUrl,
  [Parameter(Mandatory=$false)]
  [string]$SupabaseAnonKey,
  [switch]$Help
)

if ($Help) {
  Write-Host "Bingo Nights Environment Setup Helper"
  Write-Host ""
  Write-Host "Usage:"
  Write-Host "  .\setup-env.ps1 -SupabaseUrl 'https://your-project.supabase.co' -SupabaseAnonKey 'your-key'"
  Write-Host ""
  Write-Host "Or run without parameters to be prompted:"
  Write-Host "  .\setup-env.ps1"
  Write-Host ""
  Write-Host "This will create/update a .env file in the project root."
  exit 0
}

Write-Host "Bingo Nights Environment Setup"
Write-Host "================================"

if (-not $SupabaseUrl) {
  $SupabaseUrl = Read-Host "Enter your Supabase project URL (e.g., https://xyz.supabase.co)"
}

if (-not $SupabaseAnonKey) {
  $SupabaseAnonKey = Read-Host "Enter your Supabase anon key"
}

# Create .env file
$envContent = @"
# Bingo Nights Environment Variables
SUPABASE_URL=$SupabaseUrl
SUPABASE_ANON_KEY=$SupabaseAnonKey
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Environment file created: .env"
Write-Host ""
Write-Host "Environment variables set:"
Write-Host "   SUPABASE_URL = $SupabaseUrl"
Write-Host "   SUPABASE_ANON_KEY = [HIDDEN]"
Write-Host ""
Write-Host "You can now run the test:"
Write-Host "   node test_verify_bingo.js"
Write-Host ""
Write-Host "For mobile development, copy these values to mobile/.env"