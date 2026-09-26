# 🚀 How to Deploy Temitope's App to Vercel

Your app is built with **Next.js 14, TypeScript, Tailwind CSS, Neon PostgreSQL, and Google Gemini 3.8 Flash**. It is 100% native to Vercel and ready to deploy in minutes!

---

## 🌟 Method 1: Deploy with GitHub (Recommended & Easiest)

1. **Initialize Git & Push to GitHub:**
   In your terminal inside `c:\temitope app`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Temitope Literacy App"
   ```
   Create a new private or public repository on [GitHub.com](https://github.com/new) and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/temitope-app.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your `temitope-app` repository and click **Import**.

3. **Add Environment Variables in Vercel:**
   Under the **"Environment Variables"** section in Vercel, add these two variables:

   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | *(Your Gemini API Key)* |
   | `DATABASE_URL` | *(Your Neon Database Connection URL)* |

4. **Click Deploy:**
   - In ~45 seconds, Vercel will give you a live production URL like:
     **`https://temitope-app.vercel.app`** 🎉

---

## 📱 How Temitope Installs It on Her Phone (PWA)

1. Open her live link (e.g. `https://temitope-app.vercel.app`) on her phone's browser (**Chrome** on Android or **Safari** on iPhone).
2. **On Android (Chrome):**
   - Tap the **3 dots (⋮)** in the top right.
   - Tap **"Add to Home screen"** or **"Install App"**.
3. **On iPhone (Safari):**
   - Tap the **Share button** (square with arrow pointing up).
   - Scroll down and tap **"Add to Home Screen"**.
4. The app icon (with her custom photo) will appear directly on her phone screen just like WhatsApp or Instagram!
