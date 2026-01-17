// assets/js/admin.js

/**
 * Admin functionality for Zulqar Nain Statistical Tool
 * Handles blog post management using Firebase Authentication and Firestore
 */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqwm2_yUZSiGnRjHULHoPSgh9u_8Xewmk",
  authDomain: "zulqar-nain-statistical-tool.firebaseapp.com",
  projectId: "zulqar-nain-statistical-tool",
  storageBucket: "zulqar-nain-statistical-tool.firebasestorage.app",
  messagingSenderId: "459867311033",
  appId: "1:459867311033:web:89f7c968bd6d7b45ab0468",
  measurementId: "G-G08GNXRN5J"
};

// Initialize Firebase
let firebaseApp, auth, db;
let currentUser = null;
let editingPostId = null;

try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('Firebase initialized for admin');
} catch (error) {
    console.error('Firebase initialization error:', error);
    showAdminError('Failed to initialize Firebase. Please check your configuration.');
}

/**
 * Show error message in admin panel
 * @param {string} message - Error message to display
 */
function showAdminError(message) {
    const loginMessage = document.getElementById('loginMessage');
    const postFormMessage = document.getElementById('postFormMessage');
    
    if (loginMessage) {
        loginMessage.innerHTML = `<div class="error">${message}</div>`;
        loginMessage.className = 'form-message error';
    }
    
    if (postFormMessage) {
        postFormMessage.innerHTML = `<div class="error">${message}</div>`;
        postFormMessage.className = 'form-message error';
    }
    
    console.error('Admin Error:', message);
}

/**
 * Show success message in admin panel
 * @param {string} message - Success message to display
 * @param {HTMLElement} element - Element to show message in
 */
function showAdminSuccess(message, element) {
    if (element) {
        element.innerHTML = `<div class="success">${message}</div>`;
        element.className = 'form-message success';
        
        // Clear message after 3 seconds
        setTimeout(() => {
            element.innerHTML = '';
            element.className = 'form-message';
        }, 3000);
    }
}

/**
 * Handle admin login
 */
async function handleLogin(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    const loginMessage = document.getElementById('loginMessage');
    
    if (!auth) {
        showAdminError('Authentication not initialized');
        return;
    }
    
    try {
        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = 'Logging in...';
        
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Show success message
        showAdminSuccess('Login successful! Redirecting...', loginMessage);
        
        // Switch to dashboard after a short delay
        setTimeout(() => {
            showDashboard();
            loadPosts();
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        let errorMessage = 'Login failed. Please try again.';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled.';
                break;
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password.';
                break;
            default:
                errorMessage = error.message || 'Login failed. Please try again.';
        }
        
        showAdminError(errorMessage);
    } finally {
        // Restore button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Login';
    }
}

/**
 * Handle admin logout
 */
async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        showLoginScreen();
    } catch (error) {
        console.error('Logout error:', error);
        showAdminError('Logout failed. Please try again.');
    }
}

/**
 * Show login screen
 */
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    editingPostId = null;
}

/**
 * Show admin dashboard
 */
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

/**
 * Load all blog posts for the admin
 */
async function loadPosts() {
    const postsList = document.getElementById('postsList');
    
    if (!postsList || !db) return;
    
    try {
        // Show loading state
        postsList.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Loading posts...</p></div>';
        
        // Fetch posts from Firestore
        const querySnapshot = await db.collection('posts')
            .orderBy('date', 'desc')
            .get();
        
        if (querySnapshot.empty) {
            postsList.innerHTML = '<p class="no-posts">No blog posts yet. Create your first post!</p>';
            return;
        }
        
        // Generate HTML for posts list
        let postsHTML = '';
        
        querySnapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            const date = post.date ? formatDate(post.date.toDate()) : 'No date';
            const excerpt = post.excerpt || (post.content ? post.content.substring(0, 100) + '...' : 'No content');
            
            postsHTML += `
                <div class="post-item" data-post-id="${postId}">
                    <div class="post-item-info">
                        <h4>${post.title || 'Untitled'}</h4>
                        <div class="post-item-meta">
                            <span>By ${post.author || 'Admin'}</span>
                            <span>${date}</span>
                        </div>
                        <p class="post-item-excerpt">${excerpt}</p>
                    </div>
                    <div class="post-item-actions">
                        <button class="btn btn-small edit-post-btn" data-post-id="${postId}">Edit</button>
                        <button class="btn btn-small btn-outline delete-post-btn" data-post-id="${postId}">Delete</button>
                    </div>
                </div>
            `;
        });
        
        postsList.innerHTML = postsHTML;
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-post-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                editPost(postId);
            });
        });
        
        document.querySelectorAll('.delete-post-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                deletePost(postId);
            });
        });
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsList.innerHTML = `<div class="error">Error loading posts: ${error.message}</div>`;
    }
}

/**
 * Edit a blog post
 * @param {string} postId - The ID of the post to edit
 */
async function editPost(postId) {
    if (!postId || !db) return;
    
    try {
        // Fetch the post data
        const doc = await db.collection('posts').doc(postId).get();
        
        if (!doc.exists) {
            showAdminError('Post not found');
            return;
        }
        
        const post = doc.data();
        editingPostId = postId;
        
        // Fill the form with post data
        document.getElementById('postTitle').value = post.title || '';
        document.getElementById('postSlug').value = post.slug || '';
        document.getElementById('postAuthor').value = post.author || 'Zulqar Nain';
        document.getElementById('postDate').value = post.date ? formatDateForInput(post.date.toDate()) : formatDateForInput(new Date());
        document.getElementById('postTags').value = post.tags || '';
        document.getElementById('postThumbnail').value = post.thumbnail || '';
        document.getElementById('postContent').value = post.content || '';
        document.getElementById('postExcerpt').value = post.excerpt || '';
        
        // Update form title
        document.getElementById('formTitle').textContent = 'Edit Post';
        
        // Show the form and scroll to it
        document.getElementById('postsListSection').style.display = 'none';
        document.getElementById('postFormSection').style.display = 'block';
        document.getElementById('postFormSection').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading post for editing:', error);
        showAdminError('Error loading post: ' + error.message);
    }
}

/**
 * Create a new blog post
 */
function createNewPost() {
    editingPostId = null;
    
    // Reset the form
    document.getElementById('postForm').reset();
    document.getElementById('postAuthor').value = 'Zulqar Nain';
    document.getElementById('postDate').value = formatDateForInput(new Date());
    
    // Update form title
    document.getElementById('formTitle').textContent = 'Create New Post';
    
    // Show the form
    document.getElementById('postsListSection').style.display = 'none';
    document.getElementById('postFormSection').style.display = 'block';
    document.getElementById('postFormSection').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Save a blog post (create or update)
 */
async function savePost(postData) {
    const savePostBtn = document.getElementById('savePostBtn');
    const postFormMessage = document.getElementById('postFormMessage');
    
    if (!db || !currentUser) {
        showAdminError('Not authenticated or database not available');
        return;
    }
    
    try {
        // Show loading state
        savePostBtn.disabled = true;
        savePostBtn.innerHTML = 'Saving...';
        
        // Prepare post data
        const postToSave = {
            ...postData,
            updatedAt: new Date(),
            updatedBy: currentUser.email
        };
        
        // If creating new post, add created timestamp
        if (!editingPostId) {
            postToSave.createdAt = new Date();
            postToSave.createdBy = currentUser.email;
        }
        
        // Convert date string to Firestore Timestamp
        if (postToSave.date) {
            postToSave.date = firebase.firestore.Timestamp.fromDate(new Date(postToSave.date));
        }
        
        // Save to Firestore
        if (editingPostId) {
            // Update existing post
            await db.collection('posts').doc(editingPostId).update(postToSave);
            showAdminSuccess('Post updated successfully!', postFormMessage);
        } else {
            // Create new post
            await db.collection('posts').add(postToSave);
            showAdminSuccess('Post created successfully!', postFormMessage);
        }
        
        // Reset form and go back to posts list
        setTimeout(() => {
            document.getElementById('postForm').reset();
            document.getElementById('postsListSection').style.display = 'block';
            document.getElementById('postFormSection').style.display = 'none';
            loadPosts();
        }, 1500);
        
    } catch (error) {
        console.error('Error saving post:', error);
        showAdminError('Error saving post: ' + error.message);
    } finally {
        // Restore button state
        savePostBtn.disabled = false;
        savePostBtn.innerHTML = 'Save Post';
    }
}

/**
 * Delete a blog post
 * @param {string} postId - The ID of the post to delete
 */
async function deletePost(postId) {
    if (!postId || !db) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }
    
    try {
        await db.collection('posts').doc(postId).delete();
        showAdminSuccess('Post deleted successfully!', document.getElementById('postFormMessage'));
        loadPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        showAdminError('Error deleting post: ' + error.message);
    }
}

/**
 * Cancel editing and go back to posts list
 */
function cancelEdit() {
    editingPostId = null;
    document.getElementById('postForm').reset();
    document.getElementById('postsListSection').style.display = 'block';
    document.getElementById('postFormSection').style.display = 'none';
}

/**
 * Format date for date input field (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDateForInput(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * Generate slug from title
 * @param {string} title - Title to convert to slug
 * @returns {string} - Generated slug
 */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}

/**
 * Initialize admin functionality
 */
function initAdmin() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Create new post button
    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', createNewPost);
    }
    
    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
    
    // Post form submission
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form data
            const postData = {
                title: document.getElementById('postTitle').value,
                slug: document.getElementById('postSlug').value || generateSlug(document.getElementById('postTitle').value),
                author: document.getElementById('postAuthor').value,
                date: document.getElementById('postDate').value,
                tags: document.getElementById('postTags').value,
                thumbnail: document.getElementById('postThumbnail').value,
                content: document.getElementById('postContent').value,
                excerpt: document.getElementById('postExcerpt').value
            };
            
            savePost(postData);
        });
    }
    
    // Auto-generate slug from title
    const titleInput = document.getElementById('postTitle');
    const slugInput = document.getElementById('postSlug');
    
    if (titleInput && slugInput) {
        titleInput.addEventListener('blur', () => {
            if (!slugInput.value && titleInput.value) {
                slugInput.value = generateSlug(titleInput.value);
            }
        });
    }
    
    // Check authentication state
    if (auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                showDashboard();
                loadPosts();
            } else {
                currentUser = null;
                showLoginScreen();
            }
        });
    }
}

// Initialize admin when DOM is loaded

document.addEventListener('DOMContentLoaded', initAdmin);

