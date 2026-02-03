# Deployment Guide

This project is a Next.js App Router application that can be easily deployed to Vercel or Netlify.

## Prerequisites
- A GitHub, GitLab, or Bitbucket account.
- A Vercel or Netlify account.

## Option 1: Deploy to Vercel (Recommended for Next.js)
1. **Push to GitHub/GitLab/Bitbucket**:
   - Create a new repository on your git provider.
   - Push your local code to the new repository:
     ```bash
     git remote add origin <your-repo-url>
     git branch -M main
     git push -u origin main
     ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **"Add New..."** > **"Project"**.
   - Import your repository.

3. **Configure**:
   - Vercel will automatically detect `Next.js`.
   - Ensure the **Build Command** is `next build`.
   - Ensure the **Output Directory** is `.next`.
   - Click **Deploy**.

## Option 2: Deploy to Netlify
1. **Push to GitHub**:
   - Ensure your code is pushed to a remote repository.

2. **Connect to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com/).
   - Click **"Add new site"** > **"Import from existing project"**.
   - Select your Git provider and the repository.

3. **Configure**:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (Netlify might auto-detect this via its plugin).
   - *Note*: You may need to install the `@netlify/plugin-nextjs` if it's not automatically added, but usually Netlify handles modern Next.js sites automatically.

## Local Build Test
Before deploying, you can test the build locally:
```bash
npm run build
npm start
```
