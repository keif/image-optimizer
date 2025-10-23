# GitHub Secrets Setup for Automated Deployment

This guide shows you how to configure GitHub Secrets for automated Docker deployment to Hetzner.

## Overview

GitHub Actions needs three secrets to deploy your API to Hetzner:

1. **HETZNER_HOST** - Your server's IP address or hostname
2. **HETZNER_USER** - SSH username (usually `root`)
3. **HETZNER_SSH_KEY** - Your private SSH key

## Step-by-Step Setup

### Step 1: Get Your Server Information

#### Find Server IP/Hostname

```bash
# Option 1: Use the hostname from ~/.ssh/config
cat ~/.ssh/config | grep -A 2 "sosquishy-server"

# Option 2: Get IP from Hetzner Cloud Console
# Go to: https://console.hetzner.cloud → Select server → Copy IP

# Option 3: Get IP via hcloud CLI
hcloud server ip sosquishy-server
```

**Example values:**
- Hostname: `sosquishy-server` (if configured in /etc/hosts or DNS)
- IP: `123.45.67.89` (direct IP address)

Choose one for `HETZNER_HOST`.

#### Find SSH User

Usually `root` for Hetzner Cloud servers.

```bash
# Test SSH connection
ssh root@sosquishy-server whoami
# Should output: root

# Or check your SSH config
cat ~/.ssh/config | grep -A 5 "sosquishy-server" | grep User
```

### Step 2: Get Your SSH Private Key

GitHub Actions needs your **private key** to SSH into the server.

```bash
# Find your SSH key
ls -la ~/.ssh/

# Common key filenames:
# - id_rsa (default)
# - id_ed25519 (newer, recommended)
# - id_rsa_hetzner (custom)

# Display your private key
cat ~/.ssh/id_rsa
# OR
cat ~/.ssh/id_ed25519
```

**Expected output:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
NhAAAAAwEAAQAAAYEA1234567890abcdef...
... (many more lines) ...
-----END OPENSSH PRIVATE KEY-----
```

**IMPORTANT:**
- Copy the **ENTIRE** key including `-----BEGIN` and `-----END` lines
- Include all newlines (the key is multiple lines)
- This is your **private key**, not the `.pub` file

### Step 3: Verify SSH Key Works

Before adding to GitHub, test it locally:

```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa root@sosquishy-server "echo 'SSH works!'"

# If you get "Permission denied", you may need to add the public key to server:
ssh-copy-id -i ~/.ssh/id_rsa.pub root@sosquishy-server
```

### Step 4: Add Secrets to GitHub

1. **Go to your GitHub repository**:
   ```
   https://github.com/YOUR_USERNAME/image-optimizer
   ```

2. **Navigate to Settings**:
   - Click **"Settings"** tab (top right)
   - In left sidebar, expand **"Secrets and variables"**
   - Click **"Actions"**

3. **Add First Secret: HETZNER_HOST**:
   - Click **"New repository secret"**
   - Name: `HETZNER_HOST`
   - Value: Your server IP or hostname (e.g., `123.45.67.89` or `sosquishy-server`)
   - Click **"Add secret"**

4. **Add Second Secret: HETZNER_USER**:
   - Click **"New repository secret"**
   - Name: `HETZNER_USER`
   - Value: `root` (or your SSH username)
   - Click **"Add secret"**

5. **Add Third Secret: HETZNER_SSH_KEY**:
   - Click **"New repository secret"**
   - Name: `HETZNER_SSH_KEY`
   - Value: Paste your **entire private key**
     - **Include** `-----BEGIN OPENSSH PRIVATE KEY-----`
     - **Include** all lines in between
     - **Include** `-----END OPENSSH PRIVATE KEY-----`
   - Click **"Add secret"**

### Step 5: Verify Secrets Are Set

After adding all three secrets, you should see:

```
HETZNER_HOST         Updated X minutes ago
HETZNER_SSH_KEY      Updated X minutes ago
HETZNER_USER         Updated X minutes ago
```

**Note:** You won't be able to view the secret values after saving (for security). If you made a mistake, you can update them.

## Testing the Setup

### Option 1: Manual Workflow Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Deploy API to Hetzner (Docker)"** workflow
3. Click **"Run workflow"** dropdown
4. Select branch: `main`
5. Click **"Run workflow"** button
6. Watch the deployment progress

### Option 2: Push to Main Branch

```bash
# Make a small change (e.g., update README)
git add .
git commit -m "test: trigger deployment"
git push origin main

# Then watch:
# GitHub → Actions tab → View running workflow
```

## Troubleshooting

### Error: "Permission denied (publickey)"

**Cause:** SSH key doesn't match what's on the server

**Solution:**
1. Verify you copied the correct private key (not the `.pub` file)
2. Ensure the corresponding public key is in server's `~/.ssh/authorized_keys`

```bash
# Copy public key to server (if needed)
ssh-copy-id -i ~/.ssh/id_rsa.pub root@sosquishy-server

# Or manually:
cat ~/.ssh/id_rsa.pub | ssh root@sosquishy-server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Error: "Host key verification failed"

**Cause:** Server's host key not in GitHub Actions known_hosts

**Solution:** This is handled automatically by the workflow (`ssh-keyscan`). If it persists:

1. Check if `HETZNER_HOST` is correct
2. Ensure server is accessible from internet (not behind firewall)

### Error: "Could not resolve hostname"

**Cause:** Hostname in `HETZNER_HOST` isn't publicly resolvable

**Solution:** Use the server's **IP address** instead of hostname

```bash
# Get server IP
hcloud server ip sosquishy-server

# Update HETZNER_HOST secret with IP address
```

### Error: "Connection timed out"

**Cause:** Server firewall blocking SSH from GitHub IPs

**Solution:** Ensure UFW allows SSH:

```bash
# SSH to server
ssh sosquishy-server

# Check UFW status
sudo ufw status

# Allow SSH if needed
sudo ufw allow 22/tcp
```

### Workflow Fails with "No such file or directory"

**Cause:** Deployment path doesn't exist on server

**Solution:** The workflow creates it automatically. If it fails:

```bash
# SSH to server
ssh sosquishy-server

# Manually create directory
sudo mkdir -p /opt/image-optimizer-docker
sudo chown -R $USER:$USER /opt/image-optimizer-docker
```

## Security Best Practices

### 1. Use Dedicated SSH Key (Recommended)

Create a separate key just for GitHub Actions:

```bash
# Generate new key
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_hetzner -C "github-actions"

# Add public key to server
ssh-copy-id -i ~/.ssh/github_actions_hetzner.pub root@sosquishy-server

# Use this key in HETZNER_SSH_KEY secret
cat ~/.ssh/github_actions_hetzner
```

Benefits:
- Can revoke without affecting your personal SSH access
- Easier to audit (know which key was used)
- Can restrict permissions for this specific key

### 2. Restrict SSH Key Permissions on Server

```bash
# SSH to server
ssh sosquishy-server

# Edit authorized_keys to restrict this key
nano ~/.ssh/authorized_keys
```

Add restrictions before the key:

```
from="140.82.112.0/20,143.55.64.0/20" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...
```

This only allows connections from GitHub Actions IP ranges.

### 3. Use Environment-Specific Secrets

For multiple environments (staging, production):

- **Production**: `HETZNER_HOST_PROD`, `HETZNER_USER_PROD`, `HETZNER_SSH_KEY_PROD`
- **Staging**: `HETZNER_HOST_STAGING`, `HETZNER_USER_STAGING`, `HETZNER_SSH_KEY_STAGING`

Update workflow to use different secrets based on branch.

### 4. Rotate Keys Regularly

Good practice: Rotate SSH keys every 6-12 months

```bash
# Generate new key
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_new

# Add to server
ssh-copy-id -i ~/.ssh/id_ed25519_new.pub root@sosquishy-server

# Update GitHub secret with new key

# After verifying it works, remove old key from server
ssh sosquishy-server
nano ~/.ssh/authorized_keys  # Remove old key
```

## Reference

### Complete Secret List

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `HETZNER_HOST` | `123.45.67.89` | Server IP address |
| `HETZNER_USER` | `root` | SSH username |
| `HETZNER_SSH_KEY` | `-----BEGIN...` | Private SSH key (full content) |

### GitHub Actions Workflow File

Location: `.github/workflows/deploy-api-hetzner.yml`

The workflow uses these secrets like this:

```yaml
- name: Setup SSH
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.HETZNER_SSH_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan -H ${{ secrets.HETZNER_HOST }} >> ~/.ssh/known_hosts

- name: Deploy
  run: |
    ssh ${{ secrets.HETZNER_USER }}@${{ secrets.HETZNER_HOST }} "..."
```

## Next Steps

After setting up secrets:

1. ✅ Verify all three secrets are added
2. ✅ Test deployment (manual trigger or push to main)
3. ✅ Check GitHub Actions logs for any errors
4. ✅ Verify API is running: `curl https://api.sosquishy.io/health`
5. ✅ Set up monitoring (optional)

## Additional Resources

- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Key Generation Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
- [Deployment Workflow](.github/workflows/deploy-api-hetzner.yml)
- [Docker Deployment Guide](DOCKER_DEPLOYMENT.md)
