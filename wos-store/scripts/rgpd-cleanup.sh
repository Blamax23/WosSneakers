#!/bin/bash
# Script de nettoyage RGPD manuel pour WOS Sneakers
# Usage: ./rgpd-cleanup.sh [preview|run]

set -e

# Configuration
API_URL="${WOS_API_URL:-https://api.wossneakers.fr}"
ADMIN_TOKEN="${WOS_ADMIN_TOKEN:-}"
LOG_FILE="/var/log/wos-rgpd-cleanup.log"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Erreur: WOS_ADMIN_TOKEN n'est pas défini${NC}"
    echo "Usage: WOS_ADMIN_TOKEN=xxx ./rgpd-cleanup.sh [preview|run]"
    exit 1
fi

case "${1:-preview}" in
    preview)
        log "${YELLOW}🔍 Prévisualisation du nettoyage RGPD...${NC}"
        curl -s -X GET "$API_URL/admin/rgpd-cleanup" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" | jq .
        ;;
    run)
        log "${GREEN}🚀 Exécution du nettoyage RGPD...${NC}"
        RESULT=$(curl -s -X POST "$API_URL/admin/rgpd-cleanup" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json")
        echo "$RESULT" | jq .
        log "Résultat: $RESULT"
        ;;
    *)
        echo "Usage: $0 [preview|run]"
        echo "  preview - Voir ce qui sera nettoyé (défaut)"
        echo "  run     - Exécuter le nettoyage"
        exit 1
        ;;
esac
