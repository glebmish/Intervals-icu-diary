# User Directory - Test API Demo

A simple, modern frontend web application that demonstrates API integration using JSONPlaceholder test API. This app is designed to be hosted on GitHub Pages and requires no backend infrastructure.

## Features

- Fetch and display user data from a REST API
- View blog posts with beautiful card layouts
- Browse photo galleries with thumbnails
- Responsive design that works on all devices
- Modern UI with gradient backgrounds and smooth animations
- Error handling and loading states

## Live Demo

Once deployed to GitHub Pages, the app will be available at:
```
https://YOUR_USERNAME.github.io/Intervals-icu-diary/
```

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests
- JSONPlaceholder API for test data

## Quick Start

### View Locally

1. Clone this repository
2. Open `index.html` in a web browser, or use a local server:
   ```bash
   python -m http.server 8000
   ```
3. Navigate to http://localhost:8000

### Deploy to GitHub Pages

See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed deployment instructions.

## How It Works

The app makes HTTP requests to the JSONPlaceholder API (https://jsonplaceholder.typicode.com/), which provides:
- User profiles with contact information
- Blog posts with titles and content
- Photo albums with images and thumbnails

All data is fetched dynamically when you click the respective buttons.

## Project Structure

```
├── index.html    # Main HTML structure
├── styles.css    # All styling and responsive design
├── app.js        # API integration and DOM manipulation
└── GITHUB_PAGES_SETUP.md  # Deployment instructions
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any modern browser with ES6 support

## API Information

This project uses JSONPlaceholder, a free fake REST API for testing and prototyping.
- No authentication required
- No rate limits
- Completely free to use

## License

This is a sample project for demonstration purposes.