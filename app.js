// Constants
const INTERVALS_ICU_BASE = 'https://intervals.icu';
const API_BASE = `${INTERVALS_ICU_BASE}/api/v1`;
const API_USERNAME = 'API_KEY';
const STORAGE_KEY = 'intervals_icu_api_key';

// DOM Elements
const apiKeyScreen = document.getElementById('apiKeyScreen');
const workoutScreen = document.getElementById('workoutScreen');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
const apiKeyError = document.getElementById('apiKeyError');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const workoutContent = document.getElementById('workoutContent');

// State
let apiKey = null;

// Initialize app
function init() {
    // Check if API key exists in localStorage
    apiKey = localStorage.getItem(STORAGE_KEY);

    if (apiKey) {
        showWorkoutScreen();
        loadLastWorkout();
    } else {
        showApiKeyScreen();
    }

    // Set up event listeners
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    clearApiKeyBtn.addEventListener('click', handleClearApiKey);
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSaveApiKey();
        }
    });
}

// Show API Key Screen
function showApiKeyScreen() {
    apiKeyScreen.classList.remove('hidden');
    workoutScreen.classList.add('hidden');
    apiKeyInput.value = '';
    hideApiKeyError();
}

// Show Workout Screen
function showWorkoutScreen() {
    apiKeyScreen.classList.add('hidden');
    workoutScreen.classList.remove('hidden');
}

// Handle Save API Key
async function handleSaveApiKey() {
    const key = apiKeyInput.value.trim();

    if (!key) {
        showApiKeyError('Please enter an API key');
        return;
    }

    // Test the API key by making a request
    saveApiKeyBtn.disabled = true;
    saveApiKeyBtn.textContent = 'Connecting...';

    try {
        const response = await fetch(`${API_BASE}/athlete/0`, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${API_USERNAME}:${key}`)
            }
        });

        if (!response.ok) {
            throw new Error('Invalid API key or unable to connect');
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, key);
        apiKey = key;

        // Switch to workout screen
        showWorkoutScreen();
        loadLastWorkout();

    } catch (error) {
        showApiKeyError('Failed to connect: ' + error.message);
        console.error('API key validation error:', error);
    } finally {
        saveApiKeyBtn.disabled = false;
        saveApiKeyBtn.textContent = 'Connect';
    }
}

// Handle Clear API Key
function handleClearApiKey() {
    if (confirm('Are you sure you want to remove your API key?')) {
        localStorage.removeItem(STORAGE_KEY);
        apiKey = null;
        showApiKeyScreen();
    }
}

// Fetch last completed workout
async function loadLastWorkout() {
    try {
        showLoading();
        hideError();

        // Fetch activities - we'll get the most recent ones
        const response = await fetch(`${API_BASE}/athlete/0/activities`, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${API_USERNAME}:${apiKey}`)
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please re-enter your API key.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const activities = await response.json();

        if (!activities || activities.length === 0) {
            throw new Error('No activities found');
        }

        // Get the most recent completed activity (type !== null means it's completed)
        const lastActivity = activities.find(a => a.type !== null);

        if (!lastActivity) {
            throw new Error('No completed workouts found');
        }

        hideLoading();
        renderWorkout(lastActivity);

    } catch (error) {
        hideLoading();
        showError('Failed to load workout: ' + error.message);
        console.error('Fetch error:', error);

        if (error.message.includes('Invalid API key')) {
            setTimeout(() => handleClearApiKey(), 2000);
        }
    }
}

// Render workout details
function renderWorkout(activity) {
    const date = new Date(activity.start_date_local);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Convert duration from seconds to formatted time
    const duration = formatDuration(activity.moving_time || activity.elapsed_time);

    // Format distance (meters to km)
    const distance = activity.distance ? (activity.distance / 1000).toFixed(2) : null;

    const html = `
        <div class="workout-card">
            <div class="workout-header">
                <h2>${activity.name || 'Workout'}</h2>
                <span class="workout-type">${activity.type || 'Activity'}</span>
            </div>

            <div class="workout-date">
                <strong>${formattedDate}</strong> at ${formattedTime}
            </div>

            <div class="workout-stats">
                ${duration ? `
                    <div class="stat">
                        <div class="stat-label">Duration</div>
                        <div class="stat-value">${duration}</div>
                    </div>
                ` : ''}

                ${distance ? `
                    <div class="stat">
                        <div class="stat-label">Distance</div>
                        <div class="stat-value">${distance} km</div>
                    </div>
                ` : ''}

                ${activity.average_speed ? `
                    <div class="stat">
                        <div class="stat-label">Avg Speed</div>
                        <div class="stat-value">${(activity.average_speed * 3.6).toFixed(1)} km/h</div>
                    </div>
                ` : ''}

                ${activity.average_heartrate ? `
                    <div class="stat">
                        <div class="stat-label">Avg HR</div>
                        <div class="stat-value">${Math.round(activity.average_heartrate)} bpm</div>
                    </div>
                ` : ''}

                ${activity.average_watts ? `
                    <div class="stat">
                        <div class="stat-label">Avg Power</div>
                        <div class="stat-value">${Math.round(activity.average_watts)} W</div>
                    </div>
                ` : ''}

                ${activity.tss ? `
                    <div class="stat">
                        <div class="stat-label">TSS</div>
                        <div class="stat-value">${Math.round(activity.tss)}</div>
                    </div>
                ` : ''}

                ${activity.calories ? `
                    <div class="stat">
                        <div class="stat-label">Calories</div>
                        <div class="stat-value">${activity.calories}</div>
                    </div>
                ` : ''}

                ${activity.total_elevation_gain ? `
                    <div class="stat">
                        <div class="stat-label">Elevation</div>
                        <div class="stat-value">${Math.round(activity.total_elevation_gain)} m</div>
                    </div>
                ` : ''}
            </div>

            ${activity.description ? `
                <div class="workout-description">
                    <h3>Description</h3>
                    <p>${activity.description}</p>
                </div>
            ` : ''}

            <div class="workout-footer">
                <a href="${INTERVALS_ICU_BASE}/activities/${activity.id}" target="_blank" class="btn btn-link">
                    View on Intervals.icu →
                </a>
            </div>
        </div>
    `;

    workoutContent.innerHTML = html;
}

// Format duration from seconds to HH:MM:SS
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Show loading spinner
function showLoading() {
    loadingDiv.classList.remove('hidden');
    workoutContent.innerHTML = '';
}

// Hide loading spinner
function hideLoading() {
    loadingDiv.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorDiv.classList.add('hidden');
}

// Show API key error
function showApiKeyError(message) {
    apiKeyError.textContent = message;
    apiKeyError.classList.remove('hidden');
}

// Hide API key error
function hideApiKeyError() {
    apiKeyError.classList.add('hidden');
}

// Start the app
init();

console.log('Intervals.icu Workout Diary initialized!');
