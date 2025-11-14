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
const activityModal = document.getElementById('activityModal');
const activityForm = document.getElementById('activityForm');
const activityIdInput = document.getElementById('activityId');
const activityTitle = document.getElementById('activityTitle');
const closeActivityModalBtn = document.getElementById('closeActivityModalBtn');
const cancelActivityBtn = document.getElementById('cancelActivityBtn');
const eventsList = document.getElementById('eventsList');
const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const eventIdInput = document.getElementById('eventId');
const eventModalTitle = document.getElementById('eventModalTitle');
const closeEventModalBtn = document.getElementById('closeEventModalBtn');
const cancelEventBtn = document.getElementById('cancelEventBtn');
const deleteEventBtn = document.getElementById('deleteEventBtn');

// State
let apiKey = null;
let wellnessData = [];
let activitiesData = [];
let eventsData = [];
let currentEditDate = null;
let currentEditActivityId = null;
let currentEditEventId = null;

// Initialize app
function init() {
    // Check if API key exists in localStorage
    apiKey = localStorage.getItem(STORAGE_KEY);

    if (apiKey) {
        showWorkoutScreen();
        loadData();
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

    // Activity modal event listeners
    closeActivityModalBtn.addEventListener('click', closeActivityModal);
    cancelActivityBtn.addEventListener('click', closeActivityModal);
    activityForm.addEventListener('submit', handleSubmitActivity);

    // Close activity modal when clicking outside
    activityModal.addEventListener('click', (e) => {
        if (e.target === activityModal) {
            closeActivityModal();
        }
    });

    // Event modal event listeners
    addEventBtn.addEventListener('click', () => openEventForm());
    closeEventModalBtn.addEventListener('click', closeEventModal);
    cancelEventBtn.addEventListener('click', closeEventModal);
    deleteEventBtn.addEventListener('click', handleDeleteEvent);
    eventForm.addEventListener('submit', handleSubmitEvent);

    // Close event modal when clicking outside
    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) {
            closeEventModal();
        }
    });

    // Event delegation for activity item clicks
    workoutContent.addEventListener('click', (e) => {
        const activityItem = e.target.closest('.activity-item');
        if (activityItem) {
            e.stopPropagation();
            const activityId = activityItem.getAttribute('data-activity-id');
            openActivityForm(activityId);
        }
    });

    // Event delegation for wellness button selectors
    document.addEventListener('click', (e) => {
        // Only handle clicks on selector buttons
        if (e.target.classList.contains('selector-btn')) {
            e.preventDefault(); // Prevent any default behavior
            const buttonSelector = e.target.closest('.button-selector');
            if (!buttonSelector) return;

            // Remove selected class from all buttons in this selector
            buttonSelector.querySelectorAll('.selector-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Add selected class to clicked button
            e.target.classList.add('selected');
        }
    });

    // Handle OK button clicks (in addition to OK & NEXT)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('action-btn-primary') && e.target.textContent.trim() === 'OK') {
            const form = e.target.closest('form');
            if (form) {
                e.preventDefault();
                form.requestSubmit();
            }
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
        loadData();

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

// Load wellness and activity data for the last N days
async function loadData() {
    try {
        showLoading();
        hideError();

        // Calculate date range
        const today = new Date();
        const oldestDate = new Date(today.getTime() - (DAYS_TO_SHOW * 24 * 60 * 60 * 1000));
        const oldestStr = formatLocalDate(oldestDate);
        const newestStr = formatLocalDate(today);

        const credentials = btoa(`API_KEY:${apiKey}`);

        // Fetch wellness data
        const wellnessResponse = await fetch(`${API_BASE}/athlete/0/wellness?oldest=${oldestStr}&newest=${newestStr}`, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!wellnessResponse.ok) {
            if (wellnessResponse.status === 401) {
                throw new Error('Invalid API key. Please re-enter your API key.');
            }
            throw new Error(`HTTP error! status: ${wellnessResponse.status}`);
        }

        wellnessData = await wellnessResponse.json();

        // Fetch activities data
        const activitiesResponse = await fetch(`${API_BASE}/athlete/0/activities?oldest=${oldestStr}&newest=${newestStr}`, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!activitiesResponse.ok) {
            throw new Error(`Failed to load activities: ${activitiesResponse.status}`);
        }

        activitiesData = await activitiesResponse.json();

        // Fetch events data (30 days back to cover multi-day events)
        const eventsOldestDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const eventsOldestStr = formatLocalDate(eventsOldestDate);
        const eventsResponse = await fetch(`${API_BASE}/athlete/0/events?oldest=${eventsOldestStr}&newest=${newestStr}`, {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (eventsResponse.ok) {
            eventsData = await eventsResponse.json();
        } else {
            console.warn('Failed to load events:', eventsResponse.status);
            eventsData = [];
        }

        hideLoading();
        renderDaysList();
        renderEventsList();

    } catch (error) {
        hideLoading();
        showError('Failed to load data: ' + error.message);
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

        // Find activities for this date
        const dayActivities = activitiesData.filter(a => {
            const activityDate = formatLocalDate(new Date(a.start_date_local));
            // Exclude Strava activities (not editable via API) and incomplete activities
            return activityDate === dateStr &&
                   a.type !== null &&
                   a.source !== 'STRAVA';
        });

        days.push({
            date: date,
            dateStr: dateStr,
            wellness: wellness || {},
            activities: dayActivities
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
                    <div class="day-card ${isComplete ? 'completed' : 'pending'}" data-date="${day.dateStr}">
                        <div style="flex: 1; width: 100%;">
                            <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="openWellnessForm('${day.dateStr}')">
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
                            ${day.activities.length > 0 ? `
                                <div class="day-activities">
                                    ${day.activities.map(activity => {
                                        const activityComplete = isActivityComplete(activity);
                                        return `
                                            <div class="activity-item ${activityComplete ? 'completed' : 'pending'}" data-activity-id="${activity.id}">
                                                <div style="display: flex; align-items: center; flex: 1;">
                                                    <span class="activity-type">${activity.type || 'Activity'}</span>
                                                    <span class="activity-name">${activity.name || 'Unnamed Activity'}</span>
                                                </div>
                                                <div class="activity-status">
                                                    <span class="activity-status-icon">${activityComplete ? '✓' : '○'}</span>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : ''}
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

// Helper function to set button selector value
function setButtonSelectorValue(fieldName, value) {
    const selector = document.querySelector(`[data-field="${fieldName}"]`);
    if (!selector) return;

    // Remove selected from all buttons
    selector.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Select the button with matching value
    if (value !== null && value !== undefined && value !== '') {
        const button = selector.querySelector(`[data-value="${value}"]`);
        if (button) {
            button.classList.add('selected');
        }
    }
}

// Helper function to get button selector value
function getButtonSelectorValue(fieldName) {
    const selector = document.querySelector(`[data-field="${fieldName}"]`);
    if (!selector) return null;

    const selectedBtn = selector.querySelector('.selector-btn.selected');
    return selectedBtn ? parseInt(selectedBtn.getAttribute('data-value')) : null;
}

// Open wellness form for a specific date
function openWellnessForm(dateStr) {
    currentEditDate = dateStr;
    wellnessDateInput.value = dateStr;

    // Find wellness data for this date
    const wellness = wellnessData.find(w => w.id === dateStr) || {};

    // Populate button selectors with existing data or defaults
    setButtonSelectorValue('sleepQuality', wellness.sleepQuality !== undefined ? wellness.sleepQuality : 2);
    setButtonSelectorValue('soreness', wellness.soreness !== undefined ? wellness.soreness : 1);
    setButtonSelectorValue('fatigue', wellness.fatigue !== undefined ? wellness.fatigue : 1);
    setButtonSelectorValue('stress', wellness.stress !== undefined ? wellness.stress : 2);
    setButtonSelectorValue('mood', wellness.mood !== undefined ? wellness.mood : 3);
    setButtonSelectorValue('motivation', wellness.motivation !== undefined ? wellness.motivation : 3);
    setButtonSelectorValue('injury', wellness.injury !== undefined ? wellness.injury : 2);

    // Populate textarea
    document.getElementById('comments').value = wellness.comments || '';

    // Show modal and lock body scroll
    wellnessModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Helper function to reset all button selectors in a form
function resetButtonSelectors(form) {
    const selectors = form.querySelectorAll('.button-selector');
    selectors.forEach(selector => {
        selector.querySelectorAll('.selector-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    });
}

// Close modal
function closeModal() {
    wellnessModal.classList.add('hidden');
    currentEditDate = null;
    wellnessForm.reset();
    resetButtonSelectors(wellnessForm);
    document.body.style.overflow = '';
}

// Handle form submission
async function handleSubmitWellness(e) {
    e.preventDefault();

    const dateStr = wellnessDateInput.value;

    // Get form values from button selectors
    const formData = {
        id: dateStr,
        sleepQuality: getButtonSelectorValue('sleepQuality'),
        soreness: getButtonSelectorValue('soreness'),
        fatigue: getButtonSelectorValue('fatigue'),
        stress: getButtonSelectorValue('stress'),
        mood: getButtonSelectorValue('mood'),
        motivation: getButtonSelectorValue('motivation'),
        injury: getButtonSelectorValue('injury'),
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
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'OK & NEXT';
        }
    }
}

// Check if all required activity fields are filled
function isActivityComplete(activity) {
    const requiredFields = ['description', 'icu_rpe', 'feel'];

    return requiredFields.every(field => {
        const value = activity[field];
        return value !== null && value !== undefined && value !== '';
    });
}

// Open activity form for a specific activity
function openActivityForm(activityId) {
    currentEditActivityId = activityId;
    activityIdInput.value = activityId;

    // Find activity data - compare as strings since IDs come from data attributes
    const activity = activitiesData.find(a => String(a.id) === String(activityId));
    if (!activity) {
        return;
    }

    // Populate form with existing data
    document.getElementById('activityType').value = activity.type || '';
    document.getElementById('activityName').value = activity.name || '';
    document.getElementById('activityDescription').value = activity.description || '';

    // Populate button selectors
    setButtonSelectorValue('activityRpe', activity.icu_rpe || null);
    setButtonSelectorValue('activityFeel', activity.feel || null);

    // Show modal and lock body scroll
    activityModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close activity modal
function closeActivityModal() {
    activityModal.classList.add('hidden');
    currentEditActivityId = null;
    activityForm.reset();
    resetButtonSelectors(activityForm);
    document.body.style.overflow = '';
}

// Handle activity form submission
async function handleSubmitActivity(e) {
    e.preventDefault();

    const activityId = activityIdInput.value;

    // Get form values
    const formData = {
        type: document.getElementById('activityType').value || null,
        name: document.getElementById('activityName').value || null,
        description: document.getElementById('activityDescription').value || null,
        icu_rpe: getButtonSelectorValue('activityRpe'),
        feel: getButtonSelectorValue('activityFeel')
    };

    // Remove null values
    const cleanedData = {};
    Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
            cleanedData[key] = formData[key];
        }
    });

    try {
        // Disable submit button
        const submitBtn = activityForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const credentials = btoa(`API_KEY:${apiKey}`);
        const response = await fetch(`${API_BASE}/athlete/0/activities/${activityId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cleanedData)
        });

        if (!response.ok) {
            throw new Error(`Failed to save: ${response.status}`);
        }

        // Update local data
        const existingIndex = activitiesData.findIndex(a => String(a.id) === String(activityId));
        if (existingIndex >= 0) {
            activitiesData[existingIndex] = { ...activitiesData[existingIndex], ...cleanedData };
        }

        // Close modal and refresh display
        closeActivityModal();
        renderDaysList();

    } catch (error) {
        alert('Failed to save activity data: ' + error.message);
        console.error('Save error:', error);
    } finally {
        const submitBtn = activityForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'OK & NEXT';
        }
    }
}

// Render events list as bars aligned with day cards
function renderEventsList() {
    // This will be called after renderDaysList to sync positioning
    // We need to wait for the DOM to be ready
    setTimeout(() => {
        const relevantCategories = ['SICK', 'INJURED', 'HOLIDAY', 'NOTE'];

        // Get all day cards from the main list
        const dayCards = document.querySelectorAll('.day-card');
        if (dayCards.length === 0) {
            eventsList.innerHTML = '<p class="no-events">No active events</p>';
            return;
        }

        // Build a map of dateStr to card position
        const datePositions = new Map();
        dayCards.forEach((card, index) => {
            const dateStr = card.getAttribute('data-date');
            if (dateStr) {
                const rect = card.getBoundingClientRect();
                const containerRect = eventsList.getBoundingClientRect();
                datePositions.set(dateStr, {
                    index: index,
                    top: rect.top - containerRect.top + eventsList.scrollTop,
                    height: rect.height
                });
            }
        });

        // Generate date range
        const today = new Date();
        const dates = [];
        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
            dates.push({
                date: date,
                dateStr: formatLocalDate(date)
            });
        }

        // Filter events that overlap with our date range
        const relevantEvents = eventsData.filter(event => {
            if (!relevantCategories.includes(event.category)) return false;

            const eventStart = new Date(event.start_date_local);
            const eventEnd = new Date(event.end_date_local || event.start_date_local);
            const oldestDate = dates[dates.length - 1].date;
            const newestDate = dates[0].date;

            return eventEnd >= oldestDate && eventStart <= newestDate;
        });

        const categoryIcons = {
            'SICK': '🤒',
            'INJURED': '🤕',
            'HOLIDAY': '🏖️',
            'NOTE': '📝'
        };

        const categoryColors = {
            'SICK': 'var(--event-sick)',
            'INJURED': 'var(--event-injured)',
            'HOLIDAY': 'var(--event-holiday)',
            'NOTE': 'var(--event-note)'
        };

        if (relevantEvents.length === 0) {
            eventsList.innerHTML = '<p class="no-events">No active events</p>';
            return;
        }

        // Build event bars
        let html = '<div class="events-bars-container">';

        relevantEvents.forEach(event => {
            const eventStart = new Date(event.start_date_local);
            const eventEnd = new Date(event.end_date_local || event.start_date_local);

            // Find which days this event spans
            const spannedDates = dates.filter(({dateStr}) => {
                const dayDate = new Date(dateStr);
                return dayDate >= eventStart && dayDate < eventEnd;
            });

            if (spannedDates.length === 0) return;

            // Get positions for start and end
            const startDateStr = spannedDates[0].dateStr;
            const endDateStr = spannedDates[spannedDates.length - 1].dateStr;

            const startPos = datePositions.get(startDateStr);
            const endPos = datePositions.get(endDateStr);

            if (!startPos || !endPos) return;

            const top = startPos.top;
            const bottom = endPos.top + endPos.height;
            const height = bottom - top;

            const icon = categoryIcons[event.category] || '📅';
            const color = categoryColors[event.category] || '#666';

            html += `
                <div class="event-bar"
                     data-event-id="${event.id}"
                     style="top: ${top}px; height: ${height}px; background-color: ${color}"
                     title="${event.name}">
                    <span class="event-bar-icon">${icon}</span>
                </div>
            `;
        });

        html += '</div>';
        eventsList.innerHTML = html;

        // Add click handlers
        eventsList.querySelectorAll('.event-bar').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = parseInt(item.getAttribute('data-event-id'));
                openEventForm(eventId);
            });
        });
    }, 50); // Small delay to ensure DOM is ready
}

// Open event form for creating or editing
function openEventForm(eventId = null) {
    currentEditEventId = eventId;

    if (eventId) {
        // Edit mode
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;

        eventModalTitle.textContent = 'Edit Event';
        deleteEventBtn.classList.remove('hidden');

        eventIdInput.value = event.id;
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventName').value = event.name;

        // Parse dates - start_date_local is inclusive
        const startDate = new Date(event.start_date_local);
        document.getElementById('eventStartDate').value = formatLocalDate(startDate);

        // end_date_local is exclusive, so subtract 1 day for display
        const endDate = new Date(event.end_date_local || event.start_date_local);
        const displayEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        document.getElementById('eventEndDate').value = formatLocalDate(displayEndDate);

        document.getElementById('eventDescription').value = event.description || '';
    } else {
        // Create mode
        eventModalTitle.textContent = 'Create Event';
        deleteEventBtn.classList.add('hidden');
        eventForm.reset();
        eventIdInput.value = '';

        // Set default dates to today
        const today = new Date();
        document.getElementById('eventStartDate').value = formatLocalDate(today);
        document.getElementById('eventEndDate').value = formatLocalDate(today);
    }

    // Show modal and lock body scroll
    eventModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close event modal
function closeEventModal() {
    eventModal.classList.add('hidden');
    currentEditEventId = null;
    eventForm.reset();
    document.body.style.overflow = '';
}

// Handle event form submission
async function handleSubmitEvent(e) {
    e.preventDefault();

    const category = document.getElementById('eventCategory').value;
    const name = document.getElementById('eventName').value;
    const startDateStr = document.getElementById('eventStartDate').value;
    const endDateStr = document.getElementById('eventEndDate').value;
    const description = document.getElementById('eventDescription').value;

    // Convert dates to ISO format with T00:00:00
    const startDateLocal = `${startDateStr}T00:00:00`;

    // Add 1 day to end date because end_date_local is exclusive
    const endDate = new Date(endDateStr);
    endDate.setDate(endDate.getDate() + 1);
    const endDateLocal = `${formatLocalDate(endDate)}T00:00:00`;

    const eventData = {
        category,
        name,
        start_date_local: startDateLocal,
        end_date_local: endDateLocal
    };

    if (description) {
        eventData.description = description;
    }

    try {
        const submitBtn = eventForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const credentials = btoa(`API_KEY:${apiKey}`);
        const eventId = eventIdInput.value;
        const isEdit = !!eventId;

        const url = isEdit
            ? `${API_BASE}/athlete/0/events/${eventId}`
            : `${API_BASE}/athlete/0/events`;

        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error(`Failed to save event: ${response.status}`);
        }

        const savedEvent = await response.json();

        // Update local data
        if (isEdit) {
            const existingIndex = eventsData.findIndex(e => e.id === parseInt(eventId));
            if (existingIndex >= 0) {
                eventsData[existingIndex] = savedEvent;
            }
        } else {
            eventsData.push(savedEvent);
        }

        // Close modal and refresh display
        closeEventModal();
        renderEventsList();

    } catch (error) {
        alert('Failed to save event: ' + error.message);
        console.error('Save event error:', error);
    } finally {
        const submitBtn = eventForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SAVE';
        }
    }
}

// Handle event deletion
async function handleDeleteEvent() {
    if (!currentEditEventId) return;

    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        deleteEventBtn.disabled = true;
        deleteEventBtn.textContent = 'Deleting...';

        const credentials = btoa(`API_KEY:${apiKey}`);
        const response = await fetch(`${API_BASE}/athlete/0/events/${currentEditEventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete event: ${response.status}`);
        }

        // Remove from local data
        eventsData = eventsData.filter(e => e.id !== currentEditEventId);

        // Close modal and refresh display
        closeEventModal();
        renderEventsList();

    } catch (error) {
        alert('Failed to delete event: ' + error.message);
        console.error('Delete event error:', error);
    } finally {
        if (deleteEventBtn) {
            deleteEventBtn.disabled = false;
            deleteEventBtn.textContent = 'DELETE';
        }
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

// Make functions available globally for onclick handlers
window.openWellnessForm = openWellnessForm;

// Start the app
init();
