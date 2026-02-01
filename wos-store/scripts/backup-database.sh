#!/bin/bash
# =============================================================================
# Script de sauvegarde automatique de la base de données PostgreSQL
# À exécuter via cron : 0 3 * * * /path/to/backup-database.sh
# =============================================================================

# Configuration
DB_NAME="${DB_NAME:-medusa-db}"
DB_USER="${DB_USER:-maximeblanc}"
BACKUP_DIR="${BACKUP_DIR:-/Users/maximeblanc/Downloads/WosSneakers/backups}"
RETENTION_DAYS=30  # Garder les backups pendant 30 jours
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/medusa-backup-$DATE.sql.gz"

# Créer le dossier de backup s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Log
echo "[$DATE] Démarrage du backup de la base $DB_NAME..."

# Effectuer le backup compressé
pg_dump -U "$DB_USER" -d "$DB_NAME" --format=plain | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$DATE] ✅ Backup réussi: $BACKUP_FILE"
    echo "[$DATE] Taille: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "[$DATE] ❌ Erreur lors du backup!"
    exit 1
fi

# Supprimer les anciens backups (plus vieux que RETENTION_DAYS jours)
echo "[$DATE] Nettoyage des backups de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "medusa-backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Afficher les backups restants
echo "[$DATE] Backups disponibles:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "Aucun backup trouvé"

echo "[$DATE] Backup terminé."
