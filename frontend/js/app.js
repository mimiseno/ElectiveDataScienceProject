/**
 * Main Application Module
 * Core functionality for the E-commerce Analytics Dashboard
 */

const App = {
  // Application state
  state: {
    currentPage: 'dashboard',
    apiStatus: false,
    sidebarOpen: false,
    predictions: [],
    forecasts: []
  },
  
  /**
   * Initialize the application
   */
  async init() {
    console.log('🚀 Initializing E-commerce Analytics Dashboard...');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Check API status
    await this.updateAPIStatus();
    
    // Start periodic API health check
    setInterval(() => this.updateAPIStatus(), 30000);
    
    // Load initial data
    await this.loadInitialData();
    
    console.log('✅ Dashboard initialized successfully');
  },
  
  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Mobile sidebar toggle
    document.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-menu-toggle')) {
        this.toggleSidebar();
      }
      
      // Close sidebar when clicking outside on mobile
      if (this.state.sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
        this.closeSidebar();
      }
    });
    
    // Handle navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape closes sidebar on mobile
      if (e.key === 'Escape' && this.state.sidebarOpen) {
        this.closeSidebar();
      }
    });
  },
  
  /**
   * Update API status indicator
   */
  async updateAPIStatus() {
    const result = await API.checkHealth();
    this.state.apiStatus = result.online;
    
    const statusDot = document.querySelector('.api-status-dot');
    const statusText = document.querySelector('.api-status-text');
    
    if (statusDot) {
      statusDot.classList.toggle('online', result.online);
      statusDot.classList.toggle('offline', !result.online);
    }
    
    if (statusText) {
      statusText.textContent = result.online ? 'API Online' : 'API Offline';
    }
    
    // Update models status if online
    if (result.online && result.data) {
      this.updateModelsStatus(result.data.models_loaded);
    }
  },
  
  /**
   * Update models status display
   */
  updateModelsStatus(models) {
    const modelsContainer = document.querySelector('.models-status');
    if (!modelsContainer) return;
    
    const modelsList = [
      { key: 'kmeans', name: 'K-Means', icon: '🎯' },
      { key: 'prophet', name: 'Prophet', icon: '📈' },
      { key: 'xgboost', name: 'XGBoost', icon: '🚀' },
      { key: 'rfm_scaler', name: 'Scaler', icon: '⚖️' }
    ];
    
    modelsContainer.innerHTML = modelsList.map(model => `
      <div class="model-status-item">
        <span class="model-icon">${model.icon}</span>
        <span class="model-name">${model.name}</span>
        <span class="badge ${models[model.key] ? 'badge-success' : 'badge-danger'}">
          ${models[model.key] ? 'Loaded' : 'Error'}
        </span>
      </div>
    `).join('');
  },
  
  /**
   * Load initial data for the dashboard
   */
  async loadInitialData() {
    // Load from localStorage
    this.state.predictions = JSON.parse(localStorage.getItem('predictions') || '[]');
    this.state.forecasts = JSON.parse(localStorage.getItem('forecasts') || '[]');
  },
  
  /**
   * Navigate to a page
   */
  navigateTo(page) {
    this.state.currentPage = page;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Update breadcrumb
    const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = this.getPageTitle(page);
    }
    
    // Hide all pages, show current
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.add('hidden');
    });
    
    const currentSection = document.querySelector(`#page-${page}`);
    if (currentSection) {
      currentSection.classList.remove('hidden');
    }
    
    // Close mobile sidebar
    this.closeSidebar();
  },
  
  /**
   * Get page title
   */
  getPageTitle(page) {
    const titles = {
      'dashboard': 'Dashboard',
      'segmentation': 'Customer Segmentation',
      'forecasting': 'Sales Forecasting',
      'analytics': 'Analytics',
      'history': 'History',
      'settings': 'Settings'
    };
    return titles[page] || 'Dashboard';
  },
  
  /**
   * Toggle sidebar (mobile)
   */
  toggleSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    document.querySelector('.sidebar')?.classList.toggle('open', this.state.sidebarOpen);
  },
  
  /**
   * Close sidebar
   */
  closeSidebar() {
    this.state.sidebarOpen = false;
    document.querySelector('.sidebar')?.classList.remove('open');
  },
  
  /**
   * Show toast notification
   */
  showToast(type, title, message, duration = 5000) {
    const container = document.querySelector('.toast-container') || this.createToastContainer();
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  /**
   * Create toast container if not exists
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },
  
  /**
   * Save prediction to history
   */
  savePrediction(prediction) {
    prediction.id = Date.now();
    prediction.timestamp = new Date().toISOString();
    this.state.predictions.unshift(prediction);
    
    // Keep only last 100 predictions
    if (this.state.predictions.length > 100) {
      this.state.predictions = this.state.predictions.slice(0, 100);
    }
    
    localStorage.setItem('predictions', JSON.stringify(this.state.predictions));
  },
  
  /**
   * Save forecast to history
   */
  saveForecast(forecast) {
    forecast.id = Date.now();
    forecast.timestamp = new Date().toISOString();
    this.state.forecasts.unshift(forecast);
    
    // Keep only last 50 forecasts
    if (this.state.forecasts.length > 50) {
      this.state.forecasts = this.state.forecasts.slice(0, 50);
    }
    
    localStorage.setItem('forecasts', JSON.stringify(this.state.forecasts));
  },
  
  /**
   * Format currency (PHP)
   */
  formatCurrency(value) {
    return '₱' + Number(value).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },
  
  /**
   * Format date
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  /**
   * Format relative time
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return this.formatDate(dateString);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
