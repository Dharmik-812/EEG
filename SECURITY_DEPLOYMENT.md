# Secure Deployment Guide

## 🔒 Security Improvements Applied

This project has been updated to handle API keys securely. The Google Gemini API key is now handled server-side only, preventing client-side exposure.

### What Changed

1. **Server-side API proxy**: Created `/api/gemini-chat.js` to handle all Gemini API calls securely
2. **Removed client-side API key**: No more `VITE_GEMINI_API_KEY` in client code
3. **Secure environment handling**: API keys are only stored server-side

## 🚀 Vercel Deployment Setup

### Step 1: Set Environment Variables in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyBtj2nnSF0cnkg6aoPmt-sh6DaYvjnuGuE`
   - **Environment**: Select all (Production, Preview, Development)

### Step 2: Deploy

Your deployment should now work securely with the API key protected on the server-side.

## 🏠 Local Development

For local development, you have two options:

### Option 1: Environment Variable
```bash
export GEMINI_API_KEY=AIzaSyBtj2nnSF0cnkg6aoPmt-sh6DaYvjnuGuE
npm run dev
```

### Option 2: .env.server file
Create a `.env.server` file (already in .gitignore) with:
```
GEMINI_API_KEY=AIzaSyBtj2nnSF0cnkg6aoPmt-sh6DaYvjnuGuE
```
Then:
```bash
source .env.server  # or set -a; source .env.server; set +a
npm run dev
```

## ⚠️ Important Security Notes

1. **Never commit API keys**: The `.env.server` and `key.env` files are in `.gitignore`
2. **Client-side safety**: API keys are never exposed to the browser
3. **Server-side validation**: All requests are validated and sanitized server-side
4. **Rate limiting**: Built-in rate limiting prevents abuse

## 🔍 Verifying Security

After deployment, you can verify the API key is secure by:

1. Opening browser developer tools
2. Going to **Sources** tab
3. Searching for your API key in the bundled JavaScript
4. ✅ You should **NOT** find it anywhere in the client-side code

## 📋 Troubleshooting

If the chat doesn't work after deployment:

1. Check Vercel function logs for errors
2. Verify the `GEMINI_API_KEY` environment variable is set in Vercel dashboard
3. Test the API endpoint directly: `POST /api/gemini-chat`
4. Check browser console for any client-side errors

The API key is now completely secure and hidden from client-side access! 🎉