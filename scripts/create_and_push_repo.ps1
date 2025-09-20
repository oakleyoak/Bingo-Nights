param(
  [Parameter(Mandatory=$true)]
  [string]$RepoName,
  [Parameter(Mandatory=$false)]
  [ValidateSet('public','private')]
  [string]$Visibility = 'public'
)

# Usage: .\scripts\create_and_push_repo.ps1 -RepoName "bingo-nights" -Visibility public

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) not found. Install from https://cli.github.com/ and run 'gh auth login'."
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found. Install git first."
  exit 1
}

# Initialize git if needed
if (-not (Test-Path .git)) {
  git init
  git add .
  git commit -m "Initial commit"
}

# Create remote repo
$repo = gh repo create $RepoName --$Visibility --source=. --remote=origin --push --confirm
Write-Output "Created repo: $repo"

Write-Output "Repository created and code pushed."
Write-Output "Next: go to Netlify and import the GitHub repository, set environment variables per docs/deploy-instructions.md"
