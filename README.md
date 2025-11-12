# Intervals.icu Workout Diary

A simple, modern frontend web application that displays your last completed workout from Intervals.icu. This app is designed to be hosted on GitHub Pages and requires no backend infrastructure.

## Features

- Secure API key storage in browser's localStorage only
- Displays your most recent completed workout from Intervals.icu
- Shows comprehensive workout statistics:
  - Duration, distance, and speed
  - Heart rate and power metrics
  - Training Stress Score (TSS)
  - Calories and elevation gain
- Responsive design that works on all devices
- Modern UI with gradient backgrounds and smooth animations
- Direct link to view full workout details on Intervals.icu

## Live Demo

Once deployed to GitHub Pages, the app will be available at:
```
https://YOUR_USERNAME.github.io/Intervals-icu-diary/
```

## Prerequisites

- An Intervals.icu account
- An API key from Intervals.icu (Settings → Developer Settings)

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)
- Fetch API with API Token Authentication
- Intervals.icu API

## Quick Start

### View Locally

1. Clone this repository
2. Open `index.html` in a web browser, or use a local server:
   ```bash
   python -m http.server 8000
   ```
3. Navigate to http://localhost:8000
4. Enter your Intervals.icu API key when prompted

### Deploy to GitHub Pages

See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed deployment instructions.

## How It Works

1. On first visit, you'll be prompted to enter your Intervals.icu API key
2. The app validates the key by connecting to Intervals.icu
3. Your API key is securely stored in your browser's localStorage
4. The app fetches your recent activities using the Intervals.icu API
5. It displays the most recent completed workout with all available metrics

## Project Structure

```
├── index.html                  # Main HTML structure
├── styles.css                  # All styling and responsive design
├── app.js                      # API integration and DOM manipulation
├── GITHUB_PAGES_SETUP.md      # Deployment instructions
└── README.md                   # This file
```

## Security & Privacy

- Your API key is stored **only** in your browser's localStorage
- The key is never sent to any third-party services
- All API requests go directly from your browser to Intervals.icu
- No tracking or analytics are implemented
- You can clear your API key at any time using the "Change API Key" button

## API Information

This app uses the official Intervals.icu API:
- Base URL: `https://intervals.icu/api/v1`
- Authentication: Bearer Token (Authorization: Bearer <your_api_key>)
- Documentation: https://intervals.icu/api-docs.html
- Forum: https://forum.intervals.icu/

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6 and localStorage support

## Troubleshooting

**"Invalid API key" error:**
- Verify you copied the complete API key from Intervals.icu
- Check that your API key hasn't been revoked
- Try generating a new API key

**No workouts displayed:**
- Ensure you have completed at least one workout in Intervals.icu
- Check that the workout has been synced/uploaded

**CORS errors:**
- This shouldn't happen with Intervals.icu, but if it does, ensure you're accessing the app via HTTPS when deployed

## License

This is a sample project for demonstration purposes.