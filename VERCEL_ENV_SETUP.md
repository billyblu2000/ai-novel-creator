# Vercel Environment Variables Setup

## Required Environment Variables

Please set these environment variables in your Vercel project dashboard:

### Backend Variables
```
DATABASE_URL=postgres://postgres.udqlvleiskrfnuzdwelh:Ei5gwGPGYYzpzR8W@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend Variables
```
VITE_API_URL=https://your-vercel-app.vercel.app
```

## Important Database URL Notes

**For Prisma migrations and schema operations**, use the NON-POOLING connection:
```
DATABASE_URL=postgres://postgres.udqlvleiskrfnuzdwelh:Ei5gwGPGYYzpzR8W@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Key differences:**
- Port `5432` (direct connection) instead of `6543` (pooled)
- No `pgbouncer=true` parameter
- This avoids "prepared statement already exists" errors during migrations

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with its value
5. Make sure to select "Production", "Preview", and "Development" for each variable
6. Click "Save"

## After Setting Variables

1. Redeploy your application
2. The database schema will be automatically created via `prisma db push`
3. Your application should be ready to use!

## Troubleshooting

If you see "prepared statement already exists" errors:
- Make sure you're using the direct connection (port 5432) not the pooled connection (port 6543)
- Remove `pgbouncer=true` from the connection string
- This is required for Prisma schema operations