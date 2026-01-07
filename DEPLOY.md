# Deployment Guide - Ournika

Your application is **Production Ready** (Frontend Prototype).
Since we are using **Mock Data**, you can deploy this largely as a static/hybrid site without needing a complex backend database connection immediately.

## Recommended: Vercel

The easiest way to deploy Next.js apps.

### Option 1: Vercel CLI (Fastest)

1.  Open your terminal in this folder:
    ```powershell
    cd c:\Users\kamle\ournika.com
    ```
2.  Install Vercel CLI (if not installed):
    ```powershell
    npm i -g vercel
    ```
3.  Run the deploy command:
    ```powershell
    vercel
    ```
4.  Follow the prompts:
    - Set up and deploy? **Yes**
    - Scope? **[Your Name]**
    - Link to existing project? **No**
    - Project Name? **ournika-ecommerce**
    - Directory? **./**
    - Build settings? **Default** (Just press Enter)

5.  **Done!** You will get a `https://ournika-ecommerce.vercel.app` link to share with your customer.

### Option 2: GitHub + Vercel Dashboard

1.  Push this code to a GitHub repository.
2.  Go to [vercel.com/new](https://vercel.com/new).
3.  Import your repository.
4.  Click **Deploy**.

## Environment Variables

For the application to function correctly in production (with Database, Payments, and Shipping), you must set the following:

```env
# Database (Use PostgreSQL for Vercel/Cloud)
DATABASE_URL="postgresql://..."

# Authentication
AUTH_SECRET="generate_a_secure_random_string"

# Payments (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="..."

# Shipping (Shiprocket)
SHIPROCKET_EMAIL="corporate.kamlesh@gmail.com"
SHIPROCKET_PASSWORD="2!^cWXMdOLYEv^g0D2vfI07upAx5FyLi"

# Domain (For Webhooks)
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Note on Database
If you are deploying to **Vercel**, you MUST obtain a PostgreSQL database (e.g., from Neon.tech, Supabase, or Vercel Postgres). The local `dev.db` (SQLite) will **not work** on Vercel's serverless platform.
