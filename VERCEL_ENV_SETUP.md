# Vercel Environment Variables Setup

## Required Environment Variables

Please set these environment variables in your Vercel project dashboard:

### Backend Variables
```
DATABASE_URL=postgres://postgres.udqlvleiskrfnuzdwelh:Ei5gwGPGYYzpzR8W@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend Variables
```
VITE_API_URL=https://your-vercel-app.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with its value
5. Make sure to select "Production", "Preview", and "Development" for each variable
6. Click "Save"

## Database URL Explanation

Use the `POSTGRES_PRISMA_URL` value from Supabase as your `DATABASE_URL`:
```
DATABASE_URL=postgres://postgres.udqlvleiskrfnuzdwelh:Ei5gwGPGYYzpzR8W@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

This URL includes:
- Connection pooling (`pgbouncer=true`)
- SSL mode required
- Proper authentication credentials

## After Setting Variables

1. Redeploy your application
2. The database schema will be automatically created via `prisma db push`
3. Your application should be ready to use!