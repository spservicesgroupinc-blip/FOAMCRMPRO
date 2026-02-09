<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fof7nZe0GwffMjzY9VDkti2bTumEKDXb

## Run Locally

**Prerequisites:**  Node.js (v18 or higher)

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - ✅ A `.env.local` file has been created and configured with the Gemini API key
   - The API key is stored securely and gitignored (not committed to the repository)
   - If you need to change the API key, edit `.env.local`
   - Get a new API key from: https://ai.google.dev/ if needed

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   - Open your browser and navigate to: http://localhost:3000
   - The app will automatically reload when you make changes to the code

### Available Scripts

- `npm run dev` - Start the development server on port 3000
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build locally

### Troubleshooting

- If port 3000 is already in use, the server will fail to start. Stop any processes using that port or modify the port in `vite.config.ts`
- Make sure Node.js version is 18 or higher: `node --version`
- If you encounter module resolution errors, try deleting `node_modules` and `package-lock.json`, then run `npm install` again
