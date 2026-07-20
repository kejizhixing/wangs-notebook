// Wang's Notebook - Main JavaScript
// Handles: theme toggle, navigation, auth state, toast notifications

const API_BASE = '/api';

// ---------- Theme Management ----------
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.innerHTML = theme === 'dark'
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
}

// ---------- Auth State ----------
function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    updateNavAuth();
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavAuth();
}

function isLoggedIn() {
    return !!getToken();
}

function updateNavAuth() {
    const navUser = document.getElementById('nav-user');
    if (!navUser) return;

    const user = getUser();
    if (user) {
        navUser.innerHTML = `
            <span style="font-size:0.9rem;color:var(--text-secondary)">${escapeHtml(user.username)}</span>
            <button class="btn-nav" onclick="handleLogout()">退出</button>
        `;
    } else {
        navUser.innerHTML = `
            <a href="login.html" class="btn-nav">登录</a>
            <a href="register.html" class="btn-nav primary">注册</a>
        `;
    }
}

function handleLogout() {
    clearAuth();
    showToast('已退出登录', 'success');
    if (window.location.pathname.includes('post.html')) {
        // Refresh comments to show login prompt
        loadComments();
    }
}

// ---------- Toast Notifications ----------
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ---------- Utility ----------
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryLabel(category) {
    const labels = {
        tech: '技术',
        life: '生活',
        resource: '资源'
    };
    return labels[category] || category;
}

function getCategoryClass(category) {
    return category || 'tech';
}

// ---------- Mobile Menu ----------
function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
        navLinks.classList.toggle('open');
    }
}

// ---------- API Helper ----------
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
}

// ---------- Simple Markdown Renderer ----------
function renderMarkdown(text) {
    if (!text) return '';

    let html = escapeHtml(text);

    // Headings
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Blockquote
    html = html.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Unordered lists
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

    // Paragraphs
    html = html.replace(/\n{2,}/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up around block elements
    html = html.replace(/<p><h(\d)>/g, '<h$1>');
    html = html.replace(/<\/h\d><\/p>/g, match => match.replace('</p>', ''));
    html = html.replace(/<p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p>/g, '</pre>');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');
    html = html.replace(/<p><blockquote>/g, '<blockquote>');
    html = html.replace(/<\/blockquote><\/p>/g, '</blockquote>');

    return html;
}

// ---------- Initialize on load ----------
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateNavAuth();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMobileMenu);
    }
});
