

class CompleteLatestUpdatesLoader {
    constructor() {
        this.container = null;
        this.loadingElement = null;
        this.newsServices = null;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.isInitialized = false;
    
        this.init();
    }

    /**
     * Initialize the loader
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup the loader after DOM is ready
     */
    setup() {
        this.container = document.querySelector('#section-letestupdate .updates-container');
        this.loadingElement = document.getElementById('updates-loading');
        
        if (!this.container) {
         
            return;
        }
        
      
        this.checkForServices();
    }

    /**
     * Check if newsandeventServices is available
     */
    checkForServices() {
        if (typeof newsandeventServices !== 'undefined' && newsandeventServices.listAllUpdates) {
            this.newsServices = newsandeventServices;

            this.loadUpdates();
        } else {
            this.retryCount++;
            if (this.retryCount <= this.maxRetries) {
              
                setTimeout(() => this.checkForServices(), 1000);
            } else {
                
                this.showFallbackContent();
            }
        }
    }

    /**
     * Load updates from API
     */
    async loadUpdates() {
        try {
            
            const response = await this.newsServices.listAllUpdates();
          
            if (response && response.status === 200 && response.data && response.data.content) {
                const filteredUpdates = this.filterUpdates(response.data.content);
                  
                if (filteredUpdates.length > 0) {
                    this.renderUpdates(filteredUpdates);
                } else {
                    this.showEmptyState();
                }
            } else {
                 this.showFallbackContent();
            }
        } catch (error) {
            this.showErrorState();
        }
    }


    filterUpdates(updates) {
        return updates.filter(update => 
            update.status === 'live' || update.status === 'upcomming'
        );
    }

    
    renderUpdates(updates) {
        const carouselHTML = this.createCarouselHTML(updates);
        this.container.innerHTML = carouselHTML;
        
        setTimeout(() => {
            this.initializeCarousel();
        }, 100);
        
       
    }

    createCarouselHTML(updates) {
        const items = updates.map(update => this.createUpdateItemHTML(update)).join('');
        
        return `
            <div class="owl-carousel updates-carousel">
                ${items}
            </div>
        `;
    }


    createUpdateItemHTML(update) {
        const statusClass = update.status === 'live' ? 'status-live' : 'status-upcoming';
        const statusText = update.status === 'live' ? 'Live' : 'Upcoming';
        const imageUrl = this.validateImageUrl(update.letestupdateimage);
        
        return `
            <div class="item">
                <div class="row no-gutters">
                    <div class="col-md-5">
                        <div class="block-18 color-1">
                            <div class="text">
                                <img src="${imageUrl}" 
                                     alt="${this.escapeHtml(update.letestupdatetitle)}"
                                     onerror="this.src='https://via.placeholder.com/400x300/0A1E46/ffffff?text=AMC+Update'"
                                     loading="lazy">
                               
                            </div>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="block-18 color-2">
                            <div class="text">
                                <div class="update-content">
                                    <h3>${this.escapeHtml(update.letestupdatetitle)}</h3>
                                    <p>${this.escapeHtml(update.letestupdatedesc)}</p>
                                </div>
                                <div class="update-meta">
                                  
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize Owl Carousel
     */
    initializeCarousel() {
        if (typeof $ === 'undefined' || !$.fn.owlCarousel) {
        
            return;
        }

        try {
            const $carousel = $('.updates-carousel');
            const itemCount = $carousel.find('.item').length;
             
            $carousel.owlCarousel({
                items: 1,
                loop: itemCount > 1,
                autoplay: itemCount > 1,
                autoplayTimeout: 6000,
                autoplayHoverPause: true,
                nav: true,
                navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
                dots: itemCount > 1,
                smartSpeed: 800,
                animateOut: 'fadeOut',
                animateIn: 'fadeIn',
                responsive: {
                    0: { items: 1 },
                    768: { items: 1 },
                    992: { items: 1 }
                }
            });
            
             this.isInitialized = true;
            
        } catch (error) {
            this.showStaticContent();
        }
    }

    /**
     * Show fallback content when API is unavailable
     */
    showFallbackContent() {
        this.container.innerHTML = `
          
        `;
        
        setTimeout(() => this.initializeCarousel(), 100);
    }

    /**
     * Show error state
     */
    showErrorState() {
        this.container.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h4 style="color: #dc3545; margin-bottom: 15px;">Unable to Load Updates</h4>
                <p style="color: #666; margin-bottom: 25px;">There was a problem loading the latest updates. Please try again.</p>
                <button class="retry-btn" onclick="window.latestUpdatesLoader.refresh()">
                    Try Again
                </button>
            </div>
        `;
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        this.container.innerHTML = `
            <div class="error-container">
                <div style="font-size: 3rem; margin-bottom: 20px;">📭</div>
                <h4 style="color: #0A1E46; margin-bottom: 15px;">No Updates Available</h4>
                <p style="color: #666;">There are currently no live or upcoming updates to display.</p>
            </div>
        `;
    }

    /**
     * Show content without carousel functionality
     */
    showStaticContent() {
        const items = this.container.querySelectorAll('.item');
        items.forEach((item, index) => {
            item.style.display = 'block';
            item.style.marginBottom = '30px';
        });
     }

    /**
     * Validate image URL
     */
    validateImageUrl(url) {
        if (!url || url.trim() === '') {
            return 'https://via.placeholder.com/400x300/0A1E46/ffffff?text=AMC+Update';
        }
        
        try {
            new URL(url);
            return url;
        } catch {
            return 'https://via.placeholder.com/400x300/dc3545/ffffff?text=Invalid+Image';
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Public method to refresh updates
     */
    refresh() {
         this.retryCount = 0;
        
        if (this.loadingElement) {
            this.container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h4 style="color: #0A1E46; margin-bottom: 10px;">Refreshing Updates</h4>
                    <p style="color: #666;">Loading the latest information...</p>
                </div>
            `;
        }
        
        this.checkForServices();
    }

    /**
     * Get current loader status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            servicesAvailable: !!this.newsServices,
            retryCount: this.retryCount,
            containerFound: !!this.container
        };
    }
}

// Initialize the loader
window.latestUpdatesLoader = new CompleteLatestUpdatesLoader();

// Debugging helpers
window.debugLatestUpdates = function() {

};

window.refreshLatestUpdates = function() {
    if (window.latestUpdatesLoader) {
        window.latestUpdatesLoader.refresh();
    } else {
        console.log(' Loader not available');
    }
};
