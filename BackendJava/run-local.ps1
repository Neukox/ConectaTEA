$ErrorActionPreference = 'Stop'

$env:DATABASE_URL = 'jdbc:postgresql://localhost:5433/conectatea'
$env:DATABASE_USERNAME = 'conectatea'
$env:DATABASE_PASSWORD = 'conectatea-dev-only'
$env:JWT_SECRET = 'conectatea-local-only-secret-change-before-production'

Push-Location $PSScriptRoot
try {
    docker compose --file ..\docker-compose.yml up -d postgres
    if ($LASTEXITCODE -ne 0) {
        throw 'Não foi possível iniciar o PostgreSQL do projeto.'
    }

    & .\mvnw.cmd spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
