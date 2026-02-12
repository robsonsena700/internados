# Sequência de Portas do Servidor

Para evitar conflitos de portas entre diferentes aplicações no servidor, seguimos a seguinte sequência:

| Aplicação | Porta | Status |
|-----------|-------|--------|
| isfat_app | 5000  | Em uso |
| suporte_app | 5001 | Em uso |
| internados-app | 5002 | Em uso (atual) |

**Regra:** Não utilizar portas fora desta sequência sem atualizar este documento e garantir que a porta está livre.
