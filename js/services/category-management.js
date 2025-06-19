function loadCategories() {
    Api.category.listAll()
      .then(function(response) {
        console.log('Categories loaded:', response.data);
        
        // 1. Handle Project Categories Navigation
        const categoryNav = document.querySelector('.category-nav');
        const existingLinks = document.querySelectorAll('.category-link:not([data-category="all"])');
        existingLinks.forEach(link => link.remove());
        
        // 2. Handle Video Filter Buttons
        const videoFilterContainer = document.querySelector('.filter-buttons');
        const existingVideoButtons = document.querySelectorAll('.filter-btn:not([data-filter="all"])');
        existingVideoButtons.forEach(button => button.remove());
        
        // Process categories for both sections
        response.data.forEach(category => {
            const categoryName = category.categoryName.toLowerCase();
            
            // A. Create Project Category Link
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.className = 'category-link';
            categoryLink.dataset.category = categoryName;
            categoryLink.innerHTML = `
                <i class="${getIconClass(categoryName)} me-2"></i> ${category.categoryName}
            `;
            const budgetContainer = document.querySelector('.budget-dropdown-container');
            categoryNav.insertBefore(categoryLink, budgetContainer);
            
            // B. Create Video Filter Button
            const filterButton = document.createElement('button');
            filterButton.className = 'filter-btn';
            filterButton.dataset.filter = categoryName;
            filterButton.textContent = category.categoryName;
            videoFilterContainer.appendChild(filterButton);
        });
        
        // Add click handlers for video filters
        setupVideoFilterHandlers();
      })
      .catch(function(error) {
        console.error('Failed to load categories:', error);
      });
}

// Helper function for icon classes
function getIconClass(categoryName) {
    switch(categoryName) {
        case 'health':
        case 'helth': return 'fa-solid fa-suitcase-medical';
        case 'environment': return 'fa-solid fa-seedling';
        case 'education': return 'fa-solid fa-school';
        default: return 'fas fa-hands-helping';
    }
}

// Setup video filter click handlers
function setupVideoFilterHandlers() {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter videos (implement your filtering logic here)
            const filterValue = this.dataset.filter;
            filterVideos(filterValue);
        });
    });
}

