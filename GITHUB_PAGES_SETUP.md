# GitHub Pages Setup Instructions

This guide will help you deploy the Intervals.icu Workout Diary web app to GitHub Pages.

## What is GitHub Pages?

GitHub Pages is a static site hosting service that takes HTML, CSS, and JavaScript files directly from a repository on GitHub and publishes a website.

## Prerequisites

- A GitHub account
- This repository pushed to GitHub
- The main files: `index.html`, `styles.css`, and `app.js`

## Setup Instructions

### Method 1: Using GitHub Repository Settings (Recommended)

1. **Navigate to Your Repository**
   - Go to https://github.com/YOUR_USERNAME/Intervals-icu-diary
   - Replace `YOUR_USERNAME` with your actual GitHub username

2. **Access Repository Settings**
   - Click on the "Settings" tab in your repository
   - It's located in the top navigation bar of your repository

3. **Open GitHub Pages Settings**
   - Scroll down the left sidebar
   - Click on "Pages" under the "Code and automation" section

4. **Configure the Source**
   - Under "Source", click the dropdown (it may say "None" by default)
   - Select the branch you want to deploy (e.g., `main` or `claude/frontend-test-api-app-011CV3m5yUfQvBhAMzpuiVKz`)
   - Keep the folder as `/ (root)` since the files are in the root directory
   - Click "Save"

5. **Wait for Deployment**
   - GitHub will start building your site
   - This usually takes 1-2 minutes
   - A blue banner will appear with the message: "Your site is ready to be published at..."
   - Once complete, it will turn green and say: "Your site is live at..."

6. **Access Your Live Site**
   - Your site will be available at:
     ```
     https://YOUR_USERNAME.github.io/Intervals-icu-diary/
     ```
   - Replace `YOUR_USERNAME` with your GitHub username

### Method 2: Using GitHub Actions (Advanced)

If you prefer automated deployments:

1. Create `.github/workflows/deploy.yml` in your repository
2. Add a GitHub Actions workflow for deployment
3. This will automatically deploy on every push to the main branch

## Verifying the Deployment

Once deployed, you should see:
- A purple gradient background
- "Intervals.icu Workout Diary" title
- A form prompting you to enter your API key

## Features of the Deployed App

The app demonstrates:
- **API Integration**: Fetches workout data from Intervals.icu API
- **Secure Storage**: API key stored locally in browser only
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Gradient backgrounds, smooth animations, card layouts
- **Error Handling**: Displays error messages if API calls fail
- **Loading States**: Shows spinner while fetching data

## Testing the Deployed App

1. **Get your API key**:
   - Log in to [Intervals.icu](https://intervals.icu)
   - Go to Settings → Developer Settings
   - Generate a new API key
   - Copy the key

2. **Enter your API key**:
   - Paste your API key into the input field
   - Click "Connect"
   - The app will validate your key

3. **View your workout**:
   - After successful connection, you'll see your last completed workout
   - All available metrics will be displayed (duration, distance, HR, power, etc.)
   - Click "View on Intervals.icu" to see the full workout details

## Troubleshooting

### Site Not Loading
- Wait 2-3 minutes after enabling GitHub Pages
- Check that the branch selected in settings is correct
- Verify that `index.html` is in the root directory

### API Key Issues
- **"Invalid API key" error**: Verify you copied the complete key from Intervals.icu
- **"Failed to connect" error**: Check your internet connection
- **API key not saving**: Ensure your browser allows localStorage
- **Need to change API key**: Click the "Change API Key" button in the top right
- Check browser console for errors (F12 or right-click → Inspect → Console)

### No Workouts Showing
- Ensure you have at least one completed workout in Intervals.icu
- Check that your workouts are synced from your fitness device
- Verify your Intervals.icu account is active

### 404 Error
- Ensure the repository name in the URL matches exactly
- Case sensitivity matters: `Intervals-icu-diary` ≠ `intervals-icu-diary`
- Wait a few minutes as DNS can take time to propagate

### Changes Not Appearing
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- GitHub Pages can take 1-2 minutes to rebuild after a push
- Check the Actions tab to see if deployment is in progress

## Updating Your Site

To update the site after making changes:

1. Edit your HTML, CSS, or JavaScript files locally
2. Commit the changes:
   ```bash
   git add .
   git commit -m "Update description"
   ```
3. Push to GitHub:
   ```bash
   git push origin YOUR_BRANCH_NAME
   ```
4. GitHub Pages will automatically rebuild (1-2 minutes)
5. Refresh your browser to see changes

## Custom Domain (Optional)

To use a custom domain:

1. In repository Settings → Pages
2. Enter your custom domain under "Custom domain"
3. Add a CNAME record in your domain registrar pointing to:
   ```
   YOUR_USERNAME.github.io
   ```
4. Wait for DNS propagation (up to 24 hours)

## API Information

This app uses **Intervals.icu API** (https://intervals.icu/api/v1):
- Official Intervals.icu REST API
- Requires HTTP Basic Authentication with API key
- Username: "API_KEY" (literal string), Password: your API key
- API keys are generated in your Intervals.icu account settings
- Endpoints used:
  - `/athlete/0` - Get current athlete information (for validation)
  - `/athlete/0/activities` - Get recent activities/workouts
- Documentation: https://intervals.icu/api-docs.html

## Local Testing

To test locally before deploying:

1. Use a local web server (required for JavaScript modules):
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000

   # Node.js (with http-server)
   npx http-server
   ```

2. Open http://localhost:8000 in your browser

## Files Structure

```
Intervals-icu-diary/
├── index.html          # Main HTML file (entry point)
├── styles.css          # All styling and responsive design
├── app.js              # API integration and DOM manipulation
├── README.md           # Project description
└── GITHUB_PAGES_SETUP.md  # This file
```

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Internet Explorer: ❌ Not supported (uses modern JavaScript)

## Security Notes

- This is a frontend-only app with no backend server
- Your API key is stored **only** in your browser's localStorage
- The API key never leaves your browser except to authenticate with Intervals.icu directly
- No user data is collected, tracked, or sent to any third party
- All API calls are made directly from your browser to Intervals.icu
- You can clear your API key at any time using the "Change API Key" button
- If you're concerned about security, you can revoke and regenerate your API key in Intervals.icu settings

**Important**: Never share your API key with anyone, and avoid taking screenshots that show your API key.

## Need Help?

- Check GitHub's official Pages documentation: https://docs.github.com/en/pages
- Review browser console for error messages
- Ensure all files are committed and pushed to GitHub

---

**Enjoy your deployed web app!**
