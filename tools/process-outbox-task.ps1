$ErrorActionPreference = "Stop"

$SupabaseUrl = [System.Environment]::GetEnvironmentVariable("SUPABASE_URL", "User")
$ServiceRoleKey = [System.Environment]::GetEnvironmentVariable("SUPABASE_SERVICE_KEY", "User")
$CronSecret = [System.Environment]::GetEnvironmentVariable("CRON_SECRET", "User")

if (-not $SupabaseUrl -or -not $ServiceRoleKey -or -not $CronSecret) {
    Write-Error "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY, or CRON_SECRET"
    exit 1
}

$endpoint = "$SupabaseUrl/functions/v1/process-outbox"

curl.exe -s -X POST `
  -H "apikey: $ServiceRoleKey" `
  -H "Authorization: Bearer $ServiceRoleKey" `
  -H "x-cron-secret: $CronSecret" `
  "$endpoint" | Out-Null
