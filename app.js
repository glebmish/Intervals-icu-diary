// API Base URL
const API_BASE = 'https://jsonplaceholder.typicode.com';

// DOM Elements
const loadUsersBtn = document.getElementById('loadUsersBtn');
const loadPostsBtn = document.getElementById('loadPostsBtn');
const loadPhotosBtn = document.getElementById('loadPhotosBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const contentDiv = document.getElementById('content');

// Event Listeners
loadUsersBtn.addEventListener('click', () => fetchData('users', renderUsers));
loadPostsBtn.addEventListener('click', () => fetchData('posts', renderPosts));
loadPhotosBtn.addEventListener('click', () => fetchData('photos', renderPhotos));

// Generic fetch function
async function fetchData(endpoint, renderFunction) {
    try {
        // Show loading state
        showLoading();
        hideError();

        // Fetch data from API
        const response = await fetch(`${API_BASE}/${endpoint}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Limit data for photos to avoid too many items
        const limitedData = endpoint === 'photos' ? data.slice(0, 12) : data.slice(0, 10);

        // Hide loading and render data
        hideLoading();
        renderFunction(limitedData);

    } catch (error) {
        hideLoading();
        showError(`Failed to fetch ${endpoint}: ${error.message}`);
        console.error('Fetch error:', error);
    }
}

// Show loading spinner
function showLoading() {
    loadingDiv.classList.remove('hidden');
    contentDiv.innerHTML = '';
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

// Render Users
function renderUsers(users) {
    const html = `
        <div class="grid">
            ${users.map(user => `
                <div class="card">
                    <h3>${user.name}</h3>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Website:</strong> ${user.website}</p>
                    <p><strong>Company:</strong> ${user.company.name}</p>
                    <p><strong>City:</strong> ${user.address.city}</p>
                </div>
            `).join('')}
        </div>
    `;
    contentDiv.innerHTML = html;
}

// Render Posts
function renderPosts(posts) {
    const html = `
        <div class="grid">
            ${posts.map(post => `
                <div class="card post-card">
                    <h3>${post.title}</h3>
                    <p>${post.body}</p>
                    <p style="margin-top: 10px;"><strong>Post ID:</strong> ${post.id} | <strong>User ID:</strong> ${post.userId}</p>
                </div>
            `).join('')}
        </div>
    `;
    contentDiv.innerHTML = html;
}

// Render Photos
function renderPhotos(photos) {
    const html = `
        <div class="grid">
            ${photos.map(photo => `
                <div class="card photo-card">
                    <img src="${photo.thumbnailUrl}" alt="${photo.title}" loading="lazy">
                    <h3>${photo.title}</h3>
                    <p><strong>Album ID:</strong> ${photo.albumId}</p>
                </div>
            `).join('')}
        </div>
    `;
    contentDiv.innerHTML = html;
}

// Initial message
console.log('User Directory App initialized!');
console.log('API Base:', API_BASE);
