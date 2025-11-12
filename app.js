// Constants
const INTERVALS_ICU_BASE = 'https://intervals.icu';
const API_BASE = `${INTERVALS_ICU_BASE}/api/v1`;
const STORAGE_KEY = 'intervals_icu_api_key';
const DAYS_TO_SHOW = 14; // Show last 14 days

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
const wellnessModal = document.getElementById('wellnessModal');
const wellnessForm = document.getElementById('wellnessForm');
const wellnessDateInput = document.getElementById('wellnessDate');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');

// State
let apiKey = null;
let wellnessData = [];
let currentEditDate = null;

// Initialize app
function init() {
    // Check if API key exists in localStorage
    apiKey = localStorage.getItem(STORAGE_KEY);

    if (apiKey) {
        showWorkoutScreen();
        loadWellnessData();
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

    // Modal event listeners
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    wellnessForm.addEventListener('submit', handleSubmitWellness);

    // Close modal when clicking outside
    wellnessModal.addEventListener('click', (e) => {
        if (e.target === wellnessModal) {
            closeModal();
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
        // Intervals.icu uses Basic Auth with username "API_KEY" and password as the API key
        const credentials = btoa(`API_KEY:${key}`);
        const response = await fetch(`${API_BASE}/athlete/0`, {
            headers: {
                'Authorization': `Basic ${credentials}`
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
        loadWellnessData();

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

// Load wellness data for the last N days
async function loadWellnessData() {
    try {
        showLoading();
        hideError();

        // Calculate date range
        const today = new Date();
        const oldestDate = new Date(today.getTime() - (DAYS_TO_SHOW * 24 * 60 * 60 * 1000));
        const oldestStr = formatLocalDate(oldestDate);
        const newestStr = formatLocalDate(today);

        const credentials = btoa(`API_KEY:${apiKey}`);
        const response = await fetch(`${API_BASE}/athlete/0/wellness?oldest=${oldestStr}&newest=${newestStr}`, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please re-enter your API key.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        wellnessData = await response.json();

        hideLoading();
        renderDaysList();

    } catch (error) {
        hideLoading();
        showError('Failed to load wellness data: ' + error.message);
        console.error('Fetch error:', error);

        if (error.message.includes('Invalid API key')) {
            setTimeout(() => handleClearApiKey(), 2000);
        }
    }
}

// Render list of days
function renderDaysList() {
    const days = [];
    const today = new Date();

    // Generate array of dates for the last N days
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
        const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dateStr = formatLocalDate(date);

        // Find wellness data for this date
        const wellness = wellnessData.find(w => w.id === dateStr);

        days.push({
            date: date,
            dateStr: dateStr,
            wellness: wellness || {}
        });
    }

    const html = `
        <div class="day-list">
            ${days.map(day => {
                const isComplete = isDayComplete(day.wellness);
                const weekday = day.date.toLocaleDateString('en-US', { weekday: 'long' });
                const formattedDate = day.date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                return `
                    <div class="day-card ${isComplete ? 'completed' : 'pending'}" onclick="openWellnessForm('${day.dateStr}')">
                        <div class="day-info">
                            <div class="day-date">${formattedDate}</div>
                            <div class="day-weekday">${weekday}</div>
                        </div>
                        <div class="day-status">
                            <span class="status-badge ${isComplete ? 'completed' : 'pending'}">
                                ${isComplete ? 'Complete' : 'Pending'}
                            </span>
                            <span class="status-icon">${isComplete ? '✓' : '○'}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    workoutContent.innerHTML = html;
}

// Check if all required wellness fields are filled
function isDayComplete(wellness) {
    const requiredFields = ['sleepQuality', 'soreness', 'fatigue', 'stress', 'mood', 'motivation', 'injury', 'comments'];

    // Check if wellness object exists and has values for all required fields
    return requiredFields.every(field => {
        const value = wellness[field];
        // Consider field complete if it has a value (including 0, but not null/undefined/empty string)
        return value !== null && value !== undefined && value !== '';
    });
}

// Open wellness form for a specific date
function openWellnessForm(dateStr) {
    currentEditDate = dateStr;
    wellnessDateInput.value = dateStr;

    // Find wellness data for this date
    const wellness = wellnessData.find(w => w.id === dateStr) || {};

    // Populate form with existing data
    document.getElementById('sleepQuality').value = wellness.sleepQuality || '';
    document.getElementById('soreness').value = wellness.soreness !== undefined ? wellness.soreness : '';
    document.getElementById('fatigue').value = wellness.fatigue !== undefined ? wellness.fatigue : '';
    document.getElementById('stress').value = wellness.stress !== undefined ? wellness.stress : '';
    document.getElementById('mood').value = wellness.mood || '';
    document.getElementById('motivation').value = wellness.motivation || '';
    document.getElementById('injury').value = wellness.injury || '';
    document.getElementById('comments').value = wellness.comments || '';

    // Show modal
    wellnessModal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    wellnessModal.classList.add('hidden');
    currentEditDate = null;
    wellnessForm.reset();
}

// Handle form submission
async function handleSubmitWellness(e) {
    e.preventDefault();

    const dateStr = wellnessDateInput.value;

    // Get form values
    const formData = {
        id: dateStr,
        sleepQuality: parseInt(document.getElementById('sleepQuality').value) || null,
        soreness: document.getElementById('soreness').value !== '' ? parseInt(document.getElementById('soreness').value) : null,
        fatigue: document.getElementById('fatigue').value !== '' ? parseInt(document.getElementById('fatigue').value) : null,
        stress: document.getElementById('stress').value !== '' ? parseInt(document.getElementById('stress').value) : null,
        mood: parseInt(document.getElementById('mood').value) || null,
        motivation: parseInt(document.getElementById('motivation').value) || null,
        injury: parseInt(document.getElementById('injury').value) || null,
        comments: document.getElementById('comments').value || null
    };

    // Remove null values to avoid overwriting with null
    const cleanedData = {};
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
            cleanedData[key] = formData[key];
        }
    });
    cleanedData.id = dateStr; // Always include the ID

    try {
        // Disable submit button
        const submitBtn = wellnessForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const credentials = btoa(`API_KEY:${apiKey}`);
        const response = await fetch(`${API_BASE}/athlete/0/wellness-bulk`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([cleanedData])
        });

        if (!response.ok) {
            throw new Error(`Failed to save: ${response.status}`);
        }

        // Update local data
        const existingIndex = wellnessData.findIndex(w => w.id === dateStr);
        if (existingIndex >= 0) {
            wellnessData[existingIndex] = { ...wellnessData[existingIndex], ...cleanedData };
        } else {
            wellnessData.push(cleanedData);
        }

        // Close modal and refresh display
        closeModal();
        renderDaysList();

    } catch (error) {
        alert('Failed to save wellness data: ' + error.message);
        console.error('Save error:', error);
    } finally {
        const submitBtn = wellnessForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Wellness Data';
    }
}

// Format date to local YYYY-MM-DD (not UTC)
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

// Make openWellnessForm available globally
window.openWellnessForm = openWellnessForm;

// Start the app
init();

console.log('Intervals.icu Wellness Diary initialized!');
