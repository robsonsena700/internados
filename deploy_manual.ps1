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
    git commit -m "Deploy automatico - $Timestamp"
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
        
        # Criar .env se não existir (para evitar falha no docker compose)
        if [ ! -f .env ]; then
            echo "DATABASE_URL=postgres://user:pass@host:5432/db" > .env
            echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env
            echo "ADMIN_USERNAME=admin" >> .env
            echo "ADMIN_PASSWORD=admin" >> .env
        fi

        # Build e Restart com Docker Compose
        sudo docker compose down
        sudo docker compose up --build -d
        
        # Aplicar configuração do Nginx
        sudo rm -f /etc/nginx/sites-enabled/default
        sudo cp $REMOTE_PATH/nginx.conf /etc/nginx/sites-available/internados
        sudo ln -sf /etc/nginx/sites-available/internados /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        
        # Limpeza de imagens antigas
        sudo docker image prune -f
        
        # Health Check simples (aguarda inicialização)
        echo "Aguardando inicializacao (30s)..."
        sleep 30
        sudo docker ps
        sudo docker logs internados-app --tail 20
        curl -f http://localhost:3000/api/auth/me || { echo "Falha no Health Check"; exit 1; }
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
