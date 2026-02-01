# 🔒 Sécurité et RGPD - WOS Sneakers

## 📦 Backups automatiques de la base de données

### Configuration Cron (macOS/Linux)

Ouvrez crontab :
```bash
crontab -e
```

Ajoutez cette ligne pour un backup quotidien à 3h du matin :
```cron
0 3 * * * /Users/maximeblanc/Downloads/WosSneakers/wos-store/scripts/backup-database.sh >> /Users/maximeblanc/Downloads/WosSneakers/backups/backup.log 2>&1
```

### Configuration launchd (macOS - recommandé)

Créez le fichier `~/Library/LaunchAgents/com.wos.backup.plist` :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.wos.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/maximeblanc/Downloads/WosSneakers/wos-store/scripts/backup-database.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>3</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/maximeblanc/Downloads/WosSneakers/backups/backup.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/maximeblanc/Downloads/WosSneakers/backups/backup-error.log</string>
</dict>
</plist>
```

Puis chargez-le :
```bash
launchctl load ~/Library/LaunchAgents/com.wos.backup.plist
```

### Exécution manuelle

```bash
./scripts/backup-database.sh
```

### Restauration d'un backup

```bash
gunzip -c backups/medusa-backup-YYYY-MM-DD_HH-MM-SS.sql.gz | psql -U maximeblanc -d medusa-db
```

---

## 🧹 Nettoyage RGPD automatique

### Règles de rétention (selon politique de confidentialité)

| Type de données | Durée de conservation |
|-----------------|----------------------|
| Données de compte | Tant que le compte est actif |
| Comptes inactifs | 3 ans d'inactivité → notification puis suppression |
| Données de commande | 5 ans (obligation légale française) |
| Cookies | 6 mois à 2 ans |
| Comptes supprimés | Anonymisation immédiate, purge après 30 jours |

### Job automatique

Le job `scheduled-rgpd-cleanup.ts` s'exécute automatiquement :
- **Fréquence** : Tous les dimanches à 3h00
- **Actions** :
  1. Identifie les commandes > 5 ans (à anonymiser)
  2. Identifie les comptes inactifs > 3 ans
  3. Purge les comptes soft-deleted > 30 jours

### Exécution manuelle du nettoyage

```bash
npx medusa exec src/jobs/data-retention-cleanup.ts
```

---

## 🔐 Checklist sécurité production

- [ ] HTTPS activé (certificat SSL)
- [ ] `JWT_SECRET` défini dans `.env` (pas "supersecret")
- [ ] `STRIPE_API_KEY` en mode live
- [ ] Rate limiting activé (middlewares.ts)
- [ ] Headers de sécurité configurés (next.config.js)
- [ ] Backups automatiques configurés
- [ ] Job RGPD actif
- [ ] Logs de sécurité monitored
- [ ] Accès admin restreint par IP (optionnel)
