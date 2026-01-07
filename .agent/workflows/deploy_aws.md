---
description: Deploy Next.js App to AWS EC2 (Amazon Linux 2023)
---

# AWS EC2 Deployment Guide

## 🚀 Fast Track: Copy-Paste Deployment (EC2 Instance Connect)

Open the **EC2 Instance Connect** terminal (browser) and run these commands block by block.

### Block 1: System Setup (Swap & Tools)
```bash
# Become root
sudo su -

# Create 4GB Swap (Required for Next.js build on t3.micro)
dd if=/dev/zero of=/swapfile bs=128M count=32
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "/swapfile swap swap defaults 0 0" >> /etc/fstab

# Install Node.js 20, Git, Nginx
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs git nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Install PM2
npm install -g pm2
```

### Block 2: Clone & Build
```bash
# Clone Repository
git clone https://github.com/KamleshSingh7461/aaavrti.com.git

# Enter Directory
cd aaavrti.com

# Install Dependencies
npm ci --legacy-peer-deps

# Build the App (This may take 1-2 mins)
npm run build
```

### Block 3: Start & Expose
```bash
# Start with PM2
pm2 start npm --name "aaavrti" -- start
pm2 save
pm2 startup systemd | bash

# Configure Nginx (Reverse Proxy)
cat > /etc/nginx/conf.d/aaavrti.conf <<EOL
server {
    listen 80;
    server_name _; 

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Restart Nginx to apply changes
systemctl restart nginx
```

### Final Step: Secrets
You must manually create the `.env` file.
```bash
nano .env
```
*Paste your `.env` content here. Press `Ctrl+O`, `Enter` to save, then `Ctrl+X` to exit.*

Then restart:
```bash
pm2 restart aaavrti
```

---
## Old Detailed Guide (Reference)

- **OS**: Amazon Linux 2023
- **Instance Type**: t3.micro
- **Security Group**: Allow SSH (22), HTTP (80), HTTPS (443)
- **Key Pair**: Create new -> Name: `aaavrti-key` -> Type: `RSA` -> Format: `.pem` (for Mac/Linux) or `.ppk` (for Windows PuTTY, though .pem is fine for PowerShell).
    - **Download the key and keep it safe!**

## 2. Connect to Instance
Open your terminal (PowerShell or Bash) where the key file is located.
```bash
# Set permissions (Linux/Mac only)
chmod 400 aaavrti-key.pem

# Connect
ssh -i "aaavrti-key.pem" ec2-user@<YOUR-EC2-PUBLIC-IP>
```

## 2.5 (Crucial) Create Swap File
t3.micro only has 1GB RAM, which isn't enough for `npm install`. We must create virtual memory (Swap).

```bash
# Create 4GB swap file
sudo dd if=/dev/zero of=/swapfile bs=128M count=32
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo swapon -s
# (It should show /swapfile)
```

## 3. Install Dependencies
Run these commands on the server to install Node.js 20, Git, PM2, and Nginx.

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.nvm/nvm.sh

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify Version (Must be v20+)
node -v

# Install global packages
npm install -g pm2 yarn

# Configure git/nginx (if not already done)
sudo dnf install -y git nginx
sudo systemctl start nginx
sudo systemctl enable nginx

## 4. Deploy Application
```bash
# Clone Repository (Use HTTPS or set up SSH keys)
git clone https://github.com/KamleshSingh7461/aaavrti.com.git
cd aaavrti.com

# Install Dependencies (Use legacy-peer-deps for React 19 compatibility)
npm ci --legacy-peer-deps

# Build Application
npm run build

# Start with PM2
pm2 start npm --name "aaavrti" -- start
pm2 save
pm2 startup
```

## 5. Configure Nginx (Reverse Proxy)
Edit the Nginx configuration to point to your Next.js app (Port 3000).

```bash
sudo nano /etc/nginx/conf.d/aaavrti.conf
```

Paste the following:
```nginx
server {
    listen 80;
    server_name _;  # Catches all requests (IP address access)

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

*Note: `server_name _;` allows you to access the site via your Public IP address immediately.*

Restart Nginx:
```bash
sudo systemctl restart nginx
```

## 6. Environment Variables
Create the `.env` file on the server.
```bash
nano .env
```
Paste your local `.env` content (adjusting database URLs if needed).

**Restart App to apply Env:**
```bash
pm2 restart aaavrti
```
