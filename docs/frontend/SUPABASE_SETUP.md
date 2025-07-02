# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with Google, GitHub, and Discord OAuth providers.

## 1. Supabase Project Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Settings > API to get your project URL and anon key

## 2. Environment Variables

Copy the `.env.local` file from `sample.env` and fill in your Supabase credentials:

```bash
cp sample.env .env.local
```

Update `.env.local` with your actual Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Configure OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable Google provider
3. Paste your Google Client ID and Client Secret
4. Click Save

### GitHub OAuth Setup

1. Go to GitHub > Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Your app name
   - Homepage URL: Your app URL
   - Authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Copy the Client ID and generate a Client Secret

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable GitHub provider
3. Paste your GitHub Client ID and Client Secret
4. Click Save

### Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your app a name and create it
4. Go to OAuth2 section
5. Add redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable Discord provider
3. Paste your Discord Client ID and Client Secret
4. Click Save

## 4. Database Setup (Optional)

If you want to store additional user data, you can create custom tables:

```sql
-- Example: Extended user profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up Realtime
alter publication supabase_realtime add table profiles;
```

## 5. Test Authentication

1. Start the development server: `pnpm dev`
2. Navigate to `/auth`
3. Try signing up with email/password
4. Try signing in with social providers (Google, GitHub, Discord)
5. Check that the user session persists across page refreshes
6. Test sign out functionality

## 6. Production Deployment

When deploying to production:

1. Update OAuth provider redirect URLs to use your production domain
2. Update environment variables in your hosting platform
3. Ensure your production domain is added to Supabase's allowed origins

## Troubleshooting

### Common Issues

1. **"Invalid redirect URL"**: Make sure the callback URL in your OAuth provider matches exactly what's in Supabase
2. **"Site URL not configured"**: Go to Authentication > URL Configuration in Supabase and set your site URL
3. **CORS errors**: Add your domain to the allowed origins in Supabase Authentication settings

### Debug Tips

- Check the browser's Network tab for failed requests
- Check Supabase logs for authentication errors
- Verify environment variables are loaded correctly
- Test OAuth providers individually to isolate issues

## Features Implemented

✅ Email/Password authentication  
✅ Google OAuth  
✅ GitHub OAuth  
✅ Discord OAuth  
✅ Session persistence  
✅ Protected routes  
✅ Automatic redirects  
✅ Error handling  
✅ Loading states  
✅ Responsive design

The authentication system is now ready for development and production use!
