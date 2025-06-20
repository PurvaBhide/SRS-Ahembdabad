
// Global functions - Define these first so they're available for onclick handlers
function toggleDescription(newsId) {
  // This function is no longer used but kept for compatibility
  openNewsModal(newsId);
}

function openNewsModal(newsId) {
  if (newsManager && newsManager.currentNewsData) {
    const newsItem = newsManager.currentNewsData.content.find(item => item.letestupdateid === newsId);
    if (newsItem) {
      showNewsInModal(newsItem);
    } else {
      console.error('News item not found with ID:', newsId);
    }
  } else {
    console.error('News manager or data not available');
  }
}

function showNewsInModal(newsItem) {
  const modal = document.getElementById('newsModal');
  const modalTitle = document.getElementById('newsModalLabel');
  const modalBody = document.getElementById('newsModalBody');
  
  if (!modal || !modalTitle || !modalBody) {
    console.error('Modal elements not found');
    return;
  }

  // Set modal title
  modalTitle.textContent = newsItem.letestupdatetitle || 'News Details';
  
  // Get badge info
  const badgeInfo = getBadgeInfo(newsItem.status);
  
  // Create modal content
  const modalContent = `
   <div class="modal-image-container" style="width: 100%; max-height: 400px; overflow: hidden; border-radius: 8px; margin-bottom: 1.5rem;">
          <img src="${newsItem.letestupdateimage}" 
               class="news-modal-image" 
               alt="${newsItem.letestupdatetitle}"
               onerror="this.src='https://via.placeholder.com/800x400'"
               style="width: 100%; height: 350px; object-fit: cover; border-radius: 8px;">
        </div>
      
      <div style="margin-top: 1.5rem;">
        <p style="font-size: 1.1rem; line-height: 1.7; color: #333; margin-bottom: 1.5rem;">
          ${newsItem.letestupdatedesc || 'No description available for this news item.'}
        </p>
      </div>
      
     
    </div>
  `;
  
  modalBody.innerHTML = modalContent;
  
  // Show modal
  if (typeof $ !== 'undefined') {
    $('#newsModal').modal('show');
  } else {
    // Fallback for vanilla JS
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.style.zIndex = '1050';
    document.body.classList.add('modal-open');
    
    // Create backdrop
    const existingBackdrop = document.getElementById('modalBackdrop');
    if (existingBackdrop) {
      existingBackdrop.remove();
    }
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'modalBackdrop';
    backdrop.style.zIndex = '1040';
    document.body.appendChild(backdrop);
    
    // Add click listener to backdrop
    backdrop.addEventListener('click', closeModal);
  }
}

function getBadgeInfo(status) {
  switch (status?.toLowerCase()) {
    case 'upcoming':
    case 'upcomming':
      return { text: 'Upcoming', color: '#28a745' };
    case 'live':
    case 'current':
      return { text: 'Live', color: '#dc3545' };
    case 'completed':
    case 'past':
      return { text: 'Completed', color: '#6c757d' };
    case 'announcement':
      return { text: 'Announcement', color: '#17a2b8' };
    default:
      return { text: 'News', color: '#3B82F6' };
  }
}

function closeModal() {
  const modal = document.getElementById('newsModal');
  const backdrop = document.getElementById('modalBackdrop');
  
  if (typeof $ !== 'undefined') {
    $('#newsModal').modal('hide');
  } else {
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
      modal.style.zIndex = '';
      document.body.classList.remove('modal-open');
    }
    
    if (backdrop) {
      backdrop.remove();
    }
  }
}

function showNewsDetail(newsId) {
  openNewsModal(newsId);
}

function refreshNewsEvents() {
  if (newsManager) {
    newsManager.refreshNews();
  }
}

function loadNewsPage(page) {
  if (newsManager && !isNaN(page) && page >= 0) {
    newsManager.loadNews(page);
  }
}

// Make functions available globally
window.toggleDescription = toggleDescription;
window.openNewsModal = openNewsModal;
window.showNewsInModal = showNewsInModal;
window.showNewsDetail = showNewsDetail;
window.closeModal = closeModal;
window.refreshNewsEvents = refreshNewsEvents;
window.loadNewsPage = loadNewsPage;
window.getBadgeInfo = getBadgeInfo;

// Make functions available globally
window.toggleDescription = toggleDescription;
window.openNewsModal = openNewsModal;
window.showNewsInModal = showNewsInModal;
window.showNewsDetail = showNewsDetail;
window.closeModal = closeModal;
window.refreshNewsEvents = refreshNewsEvents;
window.loadNewsPage = loadNewsPage;
window.getBadgeInfo = getBadgeInfo;
// News and Events Manager
class NewsEventsManager {
  constructor() {
    this.currentPage = 0;
    this.pageSize = 6;
    this.totalPages = 0;
    this.isLoading = false;
    this.service = window.newsandeventServices;
    this.currentNewsData = null;
    this.init();
  }

  init() {
    // Check if required elements exist before proceeding
    if (!this.checkRequiredElements()) {
      console.warn('Required elements not found. Skipping news initialization.');
      return;
    }
    
    this.showLoader();
    this.loadNews();
  }

  checkRequiredElements() {
    const newsContainer = document.querySelector('.row.g-4');
    return newsContainer !== null;
  }

  showLoader() {
    const newsContainer = document.querySelector('.row.g-4');
    if (newsContainer) {
      newsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading latest news and events...</p>
        </div>
      `;
    }
  }

  hideLoader() {
    // Loader will be replaced by content
  }

  async loadNews(page = 0) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.currentPage = page;

    try {
      console.log(`Loading news for page ${page}...`);
      
      // Create inline service if not available
      if (!this.service) {
        this.service = {
          listAll: async function(page, size) {
            return $.ajax({
              url: `https://mumbailocal.org:8087/listallLatestUpdates?page=${page}&size=${size}`,
              method: 'GET',
              dataType: 'json'
            });
          }
        };
      }
      
      const response = await this.service.listAll(page, this.pageSize);
      console.log('News data loaded:', response);

      if (response.status === 200 && response.data) {
        this.renderNews(response.data);
        this.updatePagination(response.data);
      } else {
        this.showError('Failed to load news and events');
      }
    } catch (error) {
      console.error('Error loading news:', error);
      this.showError('Error loading news and events. Please try again later.');
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  renderNews(data) {
    const newsContainer = document.querySelector('.row.g-4');
    if (!newsContainer) {
      console.error('News container not found');
      return;
    }

    if (!data.content || data.content.length === 0) {
      newsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="alert alert-info">
            <i class="fas fa-info-circle fa-2x mb-3" style="color: #17a2b8;"></i>
            <h4>No News Available</h4>
            <p>There are currently no news or events to display. Please check back later.</p>
          </div>
        </div>
      `;
      return;
    }

    // Store current data for modal access
    this.currentNewsData = data;

    const newsHTML = data.content.map(news => this.createNewsCard(news)).join('');
    newsContainer.innerHTML = newsHTML;
  }

  createNewsCard(news) {
    // Determine badge text and color based on status
    const badgeInfo = this.getBadgeInfo(news.status);
    
    // Always show truncated description initially
    const maxDescLength = 120;
    const truncatedDesc = news.letestupdatedesc && news.letestupdatedesc.length > maxDescLength 
      ? news.letestupdatedesc.substring(0, maxDescLength) + '...'
      : (news.letestupdatedesc || 'No description available');

    // Handle image with fallback
    const imageUrl = news.letestupdateimage || 'https://via.placeholder.com/600x400';

    return `
      <div class="col-md-4 mb-4">
        <div class="news-card h-100">
          <div class="position-relative">
            <img src="${imageUrl}" class="news-image" alt="${news.letestupdatetitle || 'News Image'}" 
                 onerror="this.src='https://via.placeholder.com/600x400'">
            <span class="news-badge" style="background-color: ${badgeInfo.color};">${badgeInfo.text}</span>
          </div>
          <div class="p-4 d-flex flex-column">
            <h3 class="news-title">${news.letestupdatetitle || 'Untitled News'}</h3>
            <div class="news-description flex-grow-1">
              <p class="news-excerpt">${truncatedDesc}</p>
            </div>
            <div class="mt-auto">
              <button class="read-more-btn" onclick="openNewsModal(${news.letestupdateid})">
                Read More <i class="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getBadgeInfo(status) {
    switch (status?.toLowerCase()) {
      case 'upcoming':
      case 'upcomming':
        return { text: 'Upcoming', color: '#28a745' };
      case 'live':
      case 'current':
        return { text: 'Live', color: '#dc3545' };
      case 'completed':
      case 'past':
        return { text: 'Completed', color: '#6c757d' };
      case 'announcement':
        return { text: 'Announcement', color: '#17a2b8' };
      default:
        return { text: 'News', color: '#3B82F6' };
    }
  }

  updatePagination(data) {
    this.totalPages = data.totalPages;
    const paginationContainer = document.querySelector('.pagination');
    
    if (!paginationContainer || this.totalPages <= 1) {
      if (paginationContainer && paginationContainer.parentElement) {
        paginationContainer.parentElement.style.display = 'none';
      }
      return;
    }

    paginationContainer.parentElement.style.display = 'block';
    paginationContainer.innerHTML = this.createPaginationHTML(data);
  }

  createPaginationHTML(data) {
    const currentPage = data.number;
    const totalPages = data.totalPages;
    const isFirst = data.first;
    const isLast = data.last;

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
      <li class="page-item ${isFirst ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="loadNewsPage(${currentPage - 1}); return false;" tabindex="-1">
          <i class="fas fa-chevron-left"></i> Previous
        </a>
      </li>
    `;

    // Page numbers
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    // First page if not in range
    if (startPage > 0) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="loadNewsPage(0); return false;">1</a>
        </li>
      `;
      if (startPage > 1) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
    }

    // Page range
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="loadNewsPage(${i}); return false;">${i + 1}</a>
        </li>
      `;
    }

    // Last page if not in range
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
      }
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="loadNewsPage(${totalPages - 1}); return false;">${totalPages}</a>
        </li>
      `;
    }

    // Next button
    paginationHTML += `
      <li class="page-item ${isLast ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="loadNewsPage(${currentPage + 1}); return false;">
          Next <i class="fas fa-chevron-right"></i>
        </a>
      </li>
    `;

    return paginationHTML;
  }

  showError(message) {
    const newsContainer = document.querySelector('.row.g-4');
    if (newsContainer) {
      newsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle fa-2x mb-3" style="color: #dc3545;"></i>
            <h4 class="alert-heading">Error!</h4>
            <p>${message}</p>
            <hr>
            <button class="btn btn-outline-danger" onclick="refreshNewsEvents()">
              <i class="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      `;
    }
  }

  refreshNews() {
    if (!this.checkRequiredElements()) {
      console.warn('Cannot refresh news: required elements not found');
      return;
    }
    this.showLoader();
    this.loadNews(0);
  }
}

// Global news manager instance
let newsManager;

// Initialize function
function initializeNewsEvents() {
  try {
    // Only initialize if we're on the news page and elements exist
    if (document.querySelector('.row.g-4')) {
      newsManager = new NewsEventsManager();
      console.log('News events manager initialized successfully');
      
      // Add modal close event listeners
      const modal = document.getElementById('newsModal');
      if (modal) {
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            closeModal();
          }
        });
        
        // Close button functionality
        const closeButtons = modal.querySelectorAll('[data-dismiss="modal"], .close');
        closeButtons.forEach(btn => {
          btn.addEventListener('click', closeModal);
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
          }
        });
      }
      
    } else {
      console.log('News container not found, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing news events:', error);
  }
}

// Initialize with multiple fallbacks and error handling
if (typeof $ !== 'undefined') {
  $(document).ready(function() {
    setTimeout(initializeNewsEvents, 100);
  });
} else if (typeof jQuery !== 'undefined') {
  jQuery(document).ready(function() {
    setTimeout(initializeNewsEvents, 100);
  });
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initializeNewsEvents, 100);
    });
  } else {
    setTimeout(initializeNewsEvents, 100);
  }
}

// CSS for loading states and enhancements
const newsLoadingStyles = `
.news-card {
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
 
}

.spinner-border {
  color: var(--primary-color,rgb(70, 10, 10)) !important;
}

.news-image {
  transition: transform 0.3s ease;
}

.news-card:hover .news-image {
  transform: scale(1.05);
}

.read-more-btn {
  border: none;
  background: none;
  color:  #0A1E46;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 4px;
 
}

.read-more-btn:hover {
  background-color:  #0A1E46;
  color: white;
  transform: translateY(-2px);
}

.page-link {
  color: var(--primary-color, #0A1E46);
  transition: all 0.3s ease;
}

.page-item.active .page-link {
  background-color: var(--accent-color, #3B82F6);
  border-color: var(--accent-color, #3B82F6);
}

.page-link:hover {
  color: var(--accent-color, #3B82F6);
  background-color: #f8f9fa;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1040;
}

.modal-open {
  overflow: hidden;
}

.alert {
  border: none;
  border-radius: 8px;
}

.alert-info {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  color: #0d47a1;
}

.alert-danger {
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
  color: #c62828;
}

@media (max-width: 768px) {
  .news-card {
    margin-bottom: 1.5rem;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
  
  .news-modal-image {
    height: 200px;
  }
}
`;

// Add styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('newsLoadingStyles')) {
  const style = document.createElement('style');
  style.id = 'newsLoadingStyles';
  style.textContent = newsLoadingStyles;
  document.head.appendChild(style);
}