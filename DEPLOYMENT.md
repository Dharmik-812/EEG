# 🚀 Vercel Deployment Guide for EEG Project

## Required Environment Variables

Configure these in your Vercel dashboard under **Settings > Environment Variables**:

### Frontend Variables
```bash
# VITE_GEMINI_API_KEY removed - now using secure server-side approach
VITE_SUPABASE_URL=https://wlyxbyvlyymxzekkqxpl.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Variables (Optional)
```bash
GEMINI_API_KEY=your_google_gemini_api_key  # Fallback for API functions
ALLOWED_ORIGINS=https://your-domain.vercel.app,http://localhost:5173
```

## Deployment Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all the variables listed above
   - Make sure to set them for **Production**, **Preview**, and **Development**

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## API Endpoints

After deployment, your API endpoints will be available at:

- **Health Check**: `https://your-domain.vercel.app/api/`
- **AI Chat**: `https://your-domain.vercel.app/api/chat`
- **Daily Quiz**: `https://your-domain.vercel.app/api/daily-quiz`

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **API errors**: Verify environment variables are set correctly
3. **CORS issues**: Update `ALLOWED_ORIGINS` with your Vercel domain
4. **Function Runtime Error**: Ensure all API files use `export default` syntax

### Performance Notes:

- Build time: ~20-25 seconds
- Bundle size: ~489 kB (optimized)
- API response time: ~1-3 seconds for AI chat

# Deployment Guide

## Vercel Deployment Instructions

### 1. Environment Variables Setup

Your API key is currently exposed on the client-side. To fix this and make your deployment secure:

#### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add a new environment variable:
   - **Name**: `GEMINI_API_KEY` 
   - **Value**: `AIzaSyBtj2nnSF0cnkg6aoPmt-sh6DaYvjnuGuE` (your API key)
   - **Environment**: Select all environments (Production, Preview, Development)

### 2. API Endpoint Configuration

The app now uses a server-side API endpoint (`/api/chat.js`) to handle Gemini API calls securely. This:
- Keeps your API key secure on the server
- Provides better error handling  
- Enables proper rate limiting
- Works with Vercel's serverless functions

### 3. Security Improvements

✅ **Completed:**
- Created server-side API endpoint (`/api/chat.js`)
- Updated client to use server endpoint instead of direct API calls
- Added API key to `.gitignore` to prevent exposure
- Removed client-side API key dependency

### 4. Deployment Steps

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add secure server-side API endpoint"
   git push origin main
   ```

2. **Set up environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key value

3. **Deploy:**
   - Vercel will automatically deploy when you push to GitHub
   - The serverless function will handle API calls securely

### 5. Testing

After deployment:
1. Visit your Vercel URL
2. Try chatting with the AI
3. Check browser dev tools - you should NOT see your API key anywhere
4. The API calls should go to `/api/chat` instead of directly to Google's API

### 6. Troubleshooting

**If you see "AI service unavailable":**
- Check that `GEMINI_API_KEY` is properly set in Vercel environment variables
- Verify the API key is valid and has proper permissions
- Check Vercel function logs for errors

**If you see CORS errors:**
- The API endpoint includes proper CORS headers
- Make sure you're not trying to access the API from a different domain

**If the AI doesn't respond:**
- Check browser network tab for failed requests to `/api/chat`
- Verify Vercel serverless functions are working
- Check if you've exceeded API rate limits

### 7. Important Notes

- The old `key.env` file approach only worked locally
- Vercel uses environment variables for secure configuration  
- Your API key is now hidden from client-side code
- The server handles all API key authentication

## File Changes Made

1. **`/api/chat.js`** - New serverless function for secure API calls
2. **`/src/hooks/useServerChat.js`** - Updated hook to use server endpoint  
3. **`/src/components/ChatInterface.jsx`** - Updated to use new hook
4. **`.gitignore`** - Added environment files to prevent key exposure