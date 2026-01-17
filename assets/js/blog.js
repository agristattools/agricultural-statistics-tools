// assets/js/blog.js

/**
 * Blog functionality for Zulqar Nain Statistical Tool
 * Handles public blog listing and single post display using Firebase Firestore
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

// Initialize Firebase (compatibility version for older SDK)
let firebaseApp, db;

try {
    // Initialize Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    showFirebaseError();
}

/**
 * Show Firebase initialization error message
 */
function showFirebaseError() {
    const blogListing = document.getElementById('blogListing');
    const blogPost = document.getElementById('blogPost');
    
    if (blogListing) {
        blogListing.innerHTML = `
            <div class="error">
                <h2>Connection Error</h2>
                <p>Unable to connect to the blog database. Please check your Firebase configuration.</p>
                <p><strong>For Admin:</strong> Make sure you have updated the Firebase configuration in blog.js with your actual project credentials.</p>
            </div>
        `;
    }
    
    if (blogPost) {
        const container = document.getElementById('blogPostContainer');
        if (container) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
        }
    }
}

/**
 * Fetch and display all blog posts
 */
async function loadBlogPosts() {
    const blogListing = document.getElementById('blogListing');
    
    if (!blogListing || !db) {
        showFirebaseError();
        return;
    }
    
    try {
        // Fetch posts from Firestore, ordered by date (newest first)
        const querySnapshot = await db.collection('posts')
            .orderBy('date', 'desc')
            .get();
        
        if (querySnapshot.empty) {
            blogListing.innerHTML = `
                <div class="no-posts">
                    <h2>No Blog Posts Yet</h2>
                    <p>Check back soon for new articles and tutorials.</p>
                </div>
            `;
            return;
        }
        
        // Generate HTML for each post
        let postsHTML = '<div class="blog-grid">';
        
        querySnapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            const date = post.date ? formatDate(post.date.toDate()) : 'No date';
            const excerpt = post.excerpt || (post.content ? post.content.substring(0, 200) + '...' : '');
            
            postsHTML += `
                <div class="blog-card">
                    <div class="blog-card-thumbnail">
                        ${post.thumbnail ? 
                            `<img src="${post.thumbnail}" alt="${post.title}" loading="lazy">` : 
                            '📝'
                        }
                    </div>
                    <div class="blog-card-content">
                        <h3 class="blog-card-title">${post.title || 'Untitled'}</h3>
                        <div class="blog-card-meta">
                            <span class="blog-card-author">By ${post.author || 'Admin'}</span>
                            <span class="blog-card-date">${date}</span>
                        </div>
                        <p class="blog-card-excerpt">${excerpt}</p>
                        <a href="blog-post.html?id=${postId}" class="blog-card-link">
                            Read more →
                        </a>
                    </div>
                </div>
            `;
        });
        
        postsHTML += '</div>';
        blogListing.innerHTML = postsHTML;
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogListing.innerHTML = `
            <div class="error">
                <h2>Error Loading Posts</h2>
                <p>Unable to load blog posts. Please try again later.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Fetch and display a single blog post
 * @param {string} postId - The ID of the post to load
 */
async function loadBlogPost(postId) {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const blogPostElement = document.getElementById('blogPost');
    
    if (!db || !postId) {
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        return;
    }
    
    try {
        // Fetch the specific post from Firestore
        const doc = await db.collection('posts').doc(postId).get();
        
        if (!doc.exists) {
            throw new Error('Post not found');
        }
        
        const post = doc.data();
        const date = post.date ? formatDate(post.date.toDate()) : 'No date';
        
        // Generate HTML for the post
        let postHTML = `
            <div class="blog-post-header">
                <h1 class="blog-post-title">${post.title || 'Untitled'}</h1>
                <div class="blog-post-meta">
                    <span class="blog-post-author">By ${post.author || 'Admin'}</span>
                    <span class="blog-post-date">${date}</span>
                </div>
            </div>
        `;
        
        if (post.thumbnail) {
            postHTML += `
                <img src="${post.thumbnail}" alt="${post.title}" class="blog-post-thumbnail" loading="lazy">
            `;
        }
        
        postHTML += `
            <div class="blog-post-content">
                ${post.content || '<p>No content available.</p>'}
            </div>
        `;
        
        // Update the page
        blogPostElement.innerHTML = postHTML;
        
        // Update page title and meta description for SEO
        updatePageMetadata(post.title, post.excerpt || post.content?.substring(0, 160));
        
        // Show the post and hide loading/error states
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
        blogPostElement.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        blogPostElement.style.display = 'none';
    }
}

/**
 * Update page metadata for SEO
 * @param {string} title - Page title
 * @param {string} description - Page description
 */
function updatePageMetadata(title, description) {
    if (title) {
        document.title = `${title} | Zulqar Nain Statistical Tool`;
        
        // Update Open Graph and Twitter card titles
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        
        if (ogTitle) ogTitle.setAttribute('content', title);
        if (twitterTitle) twitterTitle.setAttribute('content', title);
    }
    
    if (description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        
        if (metaDescription) metaDescription.setAttribute('content', description);
        if (ogDescription) ogDescription.setAttribute('content', description);
        if (twitterDescription) twitterDescription.setAttribute('content', description);
    }
}

/**
 * Format date to readable string
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date)) {
        return 'Invalid date';
    }
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
}

/**
 * Initialize blog functionality based on current page
 */
function initBlog() {
    // Check if we're on the blog listing page
    const blogListing = document.getElementById('blogListing');
    if (blogListing) {
        loadBlogPosts();
    }
    
    // Check if we're on a single blog post page
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (postId) {
        loadBlogPost(postId);
    }
}

// Initialize blog when DOM is loaded
document.addEventListener('DOMContentLoaded', initBlog);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadBlogPosts,
        loadBlogPost,
        formatDate,
        updatePageMetadata
    };

}


