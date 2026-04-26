#!/bin/bash
# بەکاپی ئۆتۆماتیک — هەموو ڕۆژێک بە کرۆن جێبەجێ بکە
# crontab -e  بنووسە:  0 2 * * * /path/to/backup.sh

BACKUP_DIR="/home/clinic/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="clinic_db"
DB_USER="clinic_user"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "⏳ بەکاپ دەستپێدەکات: $DATE"

# داتابەیس بەکاپ
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h localhost \
    -U "$DB_USER" \
    "$DB_NAME" \
    --no-password \
    | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

if [ $? -eq 0 ]; then
    echo "✅ بەکاپی داتابەیس تەواوبوو"
else
    echo "❌ هەڵە لە بەکاپ"
    exit 1
fi

# فایلە میدیاکان بەکاپ
tar -czf "$BACKUP_DIR/media_${DATE}.tar.gz" /home/clinic/media/ 2>/dev/null
echo "✅ بەکاپی میدیا تەواوبوو"

# بەکاپە کۆنەکان سڕینەوە (زیاتر لە 7 ڕۆژ)
find "$BACKUP_DIR" -name "*.gz" -mtime +$KEEP_DAYS -delete
echo "🗑️ بەکاپە کۆنەکان سڕانەوە"

# ئامارەی بەکاپەکان
BACKUP_COUNT=$(ls "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
echo "📊 کۆی بەکاپەکان: $BACKUP_COUNT | قەبارە: $BACKUP_SIZE"
echo "✅ بەکاپ تەواوبوو: $DATE"
