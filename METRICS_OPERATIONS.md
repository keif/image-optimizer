# Metrics Operations Guide

Quick reference guide for managing and monitoring usage metrics in production.

## Table of Contents

- [Daily Operations](#daily-operations)
- [Monitoring Commands](#monitoring-commands)
- [Troubleshooting](#troubleshooting)
- [Maintenance Tasks](#maintenance-tasks)
- [Emergency Procedures](#emergency-procedures)
- [Quick Reference](#quick-reference)

---

## API Overview

All metrics endpoints live on the API server and require authentication when API keys are enabled.

### Summary

```
GET /metrics/summary?days=30
```

Returns hour-aggregated totals:

```json
{
  "time_range": { "start_time": "...", "end_time": "...", "days": 30 },
  "metrics": {
    "total_requests": 15420,
    "successful_requests": 15180,
    "failed_requests": 240,
    "total_bytes_original": 1024000000,
    "total_bytes_optimized": 614400000,
    "total_bytes_saved": 409600000,
    "average_savings_percent": 40.0,
    "avg_processing_time_ms": 127.5
  }
}
```

### Format Conversions

```
GET /metrics/formats?days=30
```

Sample payload:

```json
{
  "conversions": [
    {
      "input_format": "jpeg",
      "output_format": "webp",
      "conversion_count": 8520,
      "total_bytes_original": 680000000,
      "total_bytes_optimized": 408000000,
      "total_bytes_saved": 272000000,
      "average_savings_percent": 40.0
    }
  ]
}
```

### Timeline

```
GET /metrics/timeline?days=7&interval=hour
```

Each entry includes counts plus bytes+processing-time stats so you can graph trends.

### Cleanup

```
POST /admin/cleanup-metrics?days=30
```

Use the bundled `cleanup-metrics.sh` script (with an API key) or call the endpoint directly. Default retention is 30 days, but you can pass a different `days` value for manual purges.

---

## Daily Operations

### Check System Health

```bash
# API health check
curl https://api.sosquishy.io/health | jq

# View recent metrics (last 24 hours)
curl "https://api.sosquishy.io/metrics/summary?days=1" | jq

# Check cleanup log for last run
ssh your-server "tail -20 /var/log/metrics-cleanup.log"
```

### Quick Status Check

```bash
# On production server
ssh your-server

# View last cleanup run
tail -5 /var/log/metrics-cleanup.log

# Check cron is scheduled
crontab -l | grep cleanup

# Verify metrics are being collected
curl http://localhost:8080/metrics/summary?days=1 | jq '.metrics.total_requests'
```

---

## Monitoring Commands

### View Metrics Data

**Summary Statistics:**

```bash
# Last 7 days
curl "http://localhost:8080/metrics/summary?days=7" | jq

# Last 30 days (full retention period)
curl "http://localhost:8080/metrics/summary?days=30" | jq

# Production endpoint
curl "https://api.sosquishy.io/metrics/summary?days=7" | jq
```

**Time-Series Data:**

```bash
# Hourly data for last 7 days
curl "http://localhost:8080/metrics/timeline?days=7&interval=hour" | jq

# Daily aggregation for last 30 days
curl "http://localhost:8080/metrics/timeline?days=30&interval=day" | jq
```

**Format Conversion Stats:**

```bash
# See which formats are most popular
curl "http://localhost:8080/metrics/formats?days=30" | jq '.conversions[] | {input: .input_format, output: .output_format, count: .conversion_count}'
```

### Check Data Retention

**Verify 30-day retention is working:**

```bash
# Should return empty or minimal data (older than 30 days)
curl "http://localhost:8080/metrics/summary?days=31" | jq '.metrics.total_requests'

# Should return data (within 30 days)
curl "http://localhost:8080/metrics/summary?days=30" | jq '.metrics.total_requests'
```

### Monitor Cleanup Process

**View cleanup logs:**

```bash
# Last 50 lines
tail -50 /var/log/metrics-cleanup.log

# Follow in real-time
tail -f /var/log/metrics-cleanup.log

# Search for errors
grep -i "error\|fail" /var/log/metrics-cleanup.log

# Check last successful run
grep "✓ Cleanup successful" /var/log/metrics-cleanup.log | tail -1
```

**Check when cleanup last ran:**

```bash
# View cron execution history
grep "cleanup-metrics" /var/log/syslog | tail -5
```

---

## Troubleshooting

### Problem: Cleanup not running

**Diagnosis:**

```bash
# 1. Verify cron job exists
crontab -l | grep cleanup

# 2. Check cron daemon is running
sudo systemctl status cron

# 3. Check for cron errors in syslog
grep -i "cleanup-metrics" /var/log/syslog | tail -20

# 4. Check script permissions
ls -la /opt/image-optimizer-docker/cleanup-metrics.sh
```

**Fix:**

```bash
# Ensure script is executable
chmod +x /opt/image-optimizer-docker/cleanup-metrics.sh

# Test manually
cd /opt/image-optimizer-docker
API_KEY="your-key" ./cleanup-metrics.sh

# Verify cron job format (should match this)
0 2 * * * cd /opt/image-optimizer-docker && API_KEY="sk_..." ./cleanup-metrics.sh >> /var/log/metrics-cleanup.log 2>&1
```

### Problem: Authentication failures

**Diagnosis:**

```bash
# 1. Test API key validity
curl -H "Authorization: Bearer sk_your_key" \
  http://localhost:8080/metrics/summary?days=1

# 2. List API keys to verify it exists
curl -H "Authorization: Bearer sk_your_key" \
  http://localhost:8080/api/keys | jq

# 3. Check cleanup log for auth errors
grep "401\|Unauthorized\|Invalid" /var/log/metrics-cleanup.log
```

**Fix:**

```bash
# Create new API key
curl -X POST "http://localhost:8080/api/keys" \
  -H "Content-Type: application/json" \
  -d '{"name":"Metrics Cleanup Replacement"}'

# Update crontab with new key
crontab -e
# Replace old key with new key in the cleanup line
```

### Problem: Old data not being deleted

**Diagnosis:**

```bash
# 1. Check how old the data is
curl "http://localhost:8080/metrics/summary?days=60" | jq

# 2. Inspect database directly
sqlite3 /opt/image-optimizer-docker/api/data/api_keys.db \
  "SELECT MIN(timestamp), MAX(timestamp) FROM metrics_hourly;"

# 3. Check cleanup logs for errors
grep -E "error|fail|Error|FAIL" /var/log/metrics-cleanup.log | tail -10
```

**Fix:**

```bash
# Run cleanup manually with verbose output
cd /opt/image-optimizer-docker
API_KEY="your-key" ./cleanup-metrics.sh

# If that works, check cron environment
# Cron has limited PATH - ensure full paths are used

# Force cleanup with shorter retention to test
API_KEY="your-key" ./cleanup-metrics.sh 7
```

### Problem: No metrics data

**Diagnosis:**

```bash
# 1. Check if metrics collection is enabled
docker exec squish-api env | grep METRICS

# 2. Verify API is receiving requests
curl http://localhost:8080/health

# 3. Check database exists and has tables
sqlite3 /opt/image-optimizer-docker/api/data/api_keys.db ".tables"
```

**Fix:**

```bash
# Ensure METRICS_ENABLED=true in docker-compose.prod.yml
# Restart API if needed
docker-compose -f docker-compose.prod.yml restart api
```

---

## Maintenance Tasks

### Weekly Checks

```bash
# 1. Review cleanup logs for any failures
ssh your-server "grep -E 'fail|error' /var/log/metrics-cleanup.log | tail -20"

# 2. Verify data retention is working
curl "https://api.sosquishy.io/metrics/summary?days=31" | jq '.metrics.total_requests'

# 3. Check database size is stable
ssh your-server "ls -lh /opt/image-optimizer-docker/api/data/api_keys.db"
```

### Monthly Tasks

```bash
# 1. Review metrics trends
curl "https://api.sosquishy.io/metrics/summary?days=30" | jq

# 2. Check API key list for any revoked keys
curl -H "Authorization: Bearer sk_..." \
  "https://api.sosquishy.io/api/keys" | jq

# 3. Verify cleanup logs are rotating (not growing too large)
ssh your-server "ls -lh /var/log/metrics-cleanup.log"
```

### Manual Cleanup

```bash
# Run cleanup immediately (doesn't wait for cron)
ssh your-server
cd /opt/image-optimizer-docker
API_KEY="your-key" ./cleanup-metrics.sh

# Custom retention period (e.g., 7 days for testing)
API_KEY="your-key" ./cleanup-metrics.sh 7

# Direct API call
curl -X POST "http://localhost:8080/admin/cleanup-metrics?days=30" \
  -H "Authorization: Bearer your-key"
```

### Database Inspection

```bash
# Connect to database
ssh your-server
cd /opt/image-optimizer-docker
sqlite3 api/data/api_keys.db

# Useful queries:
sqlite> SELECT COUNT(*) FROM metrics_hourly;
sqlite> SELECT MIN(timestamp), MAX(timestamp) FROM metrics_hourly;
sqlite> SELECT COUNT(*) FROM metrics_formats;
sqlite> SELECT * FROM api_keys WHERE revoked_at IS NULL;
sqlite> .quit
```

---

## Emergency Procedures

### Database Growing Too Large

```bash
# 1. Check current size
ssh your-server "du -sh /opt/image-optimizer-docker/api/data/api_keys.db"

# 2. Aggressive cleanup (keep only 7 days)
ssh your-server
cd /opt/image-optimizer-docker
API_KEY="your-key" ./cleanup-metrics.sh 7

# 3. Vacuum database to reclaim space
sqlite3 api/data/api_keys.db "VACUUM;"

# 4. Verify size reduction
du -sh api/data/api_keys.db
```

### Complete Metrics Reset (Nuclear Option)

```bash
# WARNING: This deletes ALL metrics data!
ssh your-server
cd /opt/image-optimizer-docker

# Stop API
docker-compose -f docker-compose.prod.yml stop api

# Backup database first
cp api/data/api_keys.db api/data/api_keys.db.backup

# Delete metrics tables
sqlite3 api/data/api_keys.db <<EOF
DELETE FROM metrics_hourly;
DELETE FROM metrics_formats;
DELETE FROM metrics_api_keys;
VACUUM;
EOF

# Start API
docker-compose -f docker-compose.prod.yml start api
```

---

## Quick Reference

### Important Files

- **Database**: `/opt/image-optimizer-docker/api/data/api_keys.db`
- **Cleanup Script**: `/opt/image-optimizer-docker/cleanup-metrics.sh`
- **Cleanup Log**: `/var/log/metrics-cleanup.log`
- **Cron Schedule**: `crontab -l`

### Important Endpoints

- **Metrics Summary**: `GET /metrics/summary?days=30`
- **Format Stats**: `GET /metrics/formats?days=30`
- **Timeline Data**: `GET /metrics/timeline?days=7&interval=hour`
- **Cleanup**: `POST /admin/cleanup-metrics?days=30` (requires API key)

### Default Settings

- **Retention Period**: 30 days
- **Cleanup Schedule**: Daily at 2:00 AM
- **Aggregation**: Hourly buckets
- **Privacy**: No PII, anonymized data only

### Support

- **Documentation**: See main README.md
- **Issues**: <https://github.com/keif/image-optimizer/issues>
- **Privacy Policy**: <https://sosquishy.io/privacy>
