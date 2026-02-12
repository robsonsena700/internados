# Script de Deployment Manual - Painel de Monitoramento de Pacientes
# Uso: .\deploy_manual.ps1

$ErrorActionPreference = "Stop"
$LogFile = "deploy_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

function Write-Log($Message) {
    $Stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $FullMessage = "[$Stamp] $Message"
    Write-Host $FullMessage
    $FullMessage | Out-File -FilePath $LogFile -Append
}

try {
    Write-Log "Iniciando processo de deployment..."

    # 1. Git Commit e Push
    Write-Log "Realizando commit das alterações locais..."
    git add .
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Deploy automático - $Timestamp" -ErrorAction SilentlyContinue
    Write-Log "Fazendo push para o GitHub (branch main)..."
    git push origin main
    Write-Log "Push concluído com sucesso."

    # 2. Configurações SSH
    $SSH_KEY = "C:\Users\Robson Sena\Documents\ISFat\database\ssh\ssh-key-2026-01-30.key"
    $SERVER = "ubuntu@144.22.174.109"
    $REMOTE_PATH = "/home/ubuntu/internados-arc"

    Write-Log "Conectando ao servidor remoto e atualizando código..."

    # 3. Comandos Remotos via SSH
    $RemoteCommands = @"
        cd $REMOTE_PATH || { git clone https://github.com/robsonsena700/internados.git $REMOTE_PATH && cd $REMOTE_PATH; }
        git pull origin main
        
        # Build e Restart com Docker Compose
        docker-compose down
        docker-compose up --build -d
        
        # Aplicar configuração do Nginx
        sudo cp $REMOTE_PATH/nginx.conf /etc/nginx/sites-available/internados
        sudo ln -sf /etc/nginx/sites-available/internados /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        
        # Limpeza de imagens antigas
        docker image prune -f
        
        # Health Check simples
        sleep 5
        curl -f http://localhost:3000/api/auth/me || exit 1
"@

    ssh -i $SSH_KEY $SERVER $RemoteCommands

    Write-Log "Deployment concluído com sucesso no servidor!"
    Write-Log "Aplicação disponível em: http://esus.fun/internados"

} catch {
    Write-Log "ERRO CRÍTICO DURANTE O DEPLOYMENT: $_"
    Write-Log "Iniciando tentativa de rollback (revertendo para imagem anterior)..."
    # Adicionar lógica de rollback aqui se necessário
    exit 1
}
