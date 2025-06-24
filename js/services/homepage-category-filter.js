function loadCategories() {
    Api.category.listAll()
      .then(function(response) {
        console.log('Categories loaded:', response.data);
        
        // 1. Handle Project Categories Navigation
        const categoryNav = document.querySelector('.category-nav');
        const existingLinks = document.querySelectorAll('.category-link:not([data-category="all"])');
        existingLinks.forEach(link => link.remove());
        
        // Add "All" category link first
        const allCategoryLink = document.createElement('a');
        allCategoryLink.href = '#';
        allCategoryLink.className = 'category-link active';
        allCategoryLink.dataset.category = 'all';
        allCategoryLink.innerHTML = '<i class="fas fa-list me-2"></i> All';
        allCategoryLink.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveCategory('all');
            fetchProjectsByCategory(); // Fetch all projects
        });
        categoryNav.insertBefore(allCategoryLink, categoryNav.firstChild);
        
        // Process categories
        response.data.forEach(category => {
            const categoryName = category.categoryName.toLowerCase();
            
            // Create Project Category Link
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.className = 'category-link';
            categoryLink.dataset.category = categoryName;
            categoryLink.dataset.categoryId = category.categoryId;
            categoryLink.innerHTML = `
                <i class="${getIconClass(categoryName)} me-2"></i> ${category.categoryName}
            `;
            categoryLink.addEventListener('click', function(e) {
                e.preventDefault();
                setActiveCategory(categoryName);
                fetchProjectsByCategory(category.categoryId);
            });
            
            const budgetContainer = document.querySelector('.budget-dropdown-container');
            categoryNav.insertBefore(categoryLink, budgetContainer);
        });
        
        // 2. Handle Video Filter Buttons (existing code remains same)
        const videoFilterContainer = document.querySelector('.filter-buttons');
        const existingVideoButtons = document.querySelectorAll('.filter-btn:not([data-filter="all"])');
        existingVideoButtons.forEach(button => button.remove());
        
        response.data.forEach(category => {
            const categoryName = category.categoryName.toLowerCase();
            
            // Create Video Filter Button
            const filterButton = document.createElement('button');
            filterButton.className = 'filter-btn';
            filterButton.dataset.filter = categoryName;
            filterButton.textContent = category.categoryName;
            videoFilterContainer.appendChild(filterButton);
        });
        
        setupVideoFilterHandlers();
      })
      .catch(function(error) {
        console.error('Failed to load categories:', error);
      });
}

function setActiveCategory(categoryName) {
    // Remove active class from all category links
    document.querySelectorAll('.category-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked category
    const activeLink = document.querySelector(`.category-link[data-category="${categoryName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
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

// Global function to fetch projects by category
window.fetchProjectsByCategory = async function(categoryId = 0) {
    const projectList = document.getElementById('ongoingProjectsContainer');
    
    try {
        // Show loading indicator
        projectList.innerHTML = '<div class="loading">Loading projects...</div>';

        let response;
        if (categoryId > 0) {
            // Use filter API for specific category
            response = await ProjectService.filter({
                categoryId: categoryId,
                projectStatus: 'Ongoing'
            });
        } else {
            // Fetch all ongoing projects
            response = await ProjectService.filter({
                projectStatus: 'Ongoing'
            });
        }

        let projects = response?.data?.content || [];

        // Slice to show only the first 6
        const recentOngoingProjects = projects.slice(0, 6);

        // Show fallback if none
        if (!recentOngoingProjects.length) {
            projectList.innerHTML = '<div class="no-results">No ongoing projects found for this category</div>';
            return;
        }

        // Render all cards
        projectList.innerHTML = recentOngoingProjects.map(renderProjectCard).join('');
    } catch (err) {
        console.error('Failed to load projects:', err);
        projectList.innerHTML = '<div class="error">Unable to load projects</div>';
    }
}

// Keep the renderProjectCard function from ongoing-project.js
function renderProjectCard(project) {
    const imgSrc = project.projectMainImage?.startsWith('http')
        ? project.projectMainImage
        : (project.projectImages?.length ? project.projectImages[0] : 'placeholder.jpg');

    const statusClass = project.projectStatus
        ? project.projectStatus.toLowerCase().replace(/\s+/g, '-')
        : '';

    return `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <img src="${imgSrc}" class="card-img-top" alt="${project.projectName}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${project.projectName}</h5>
                    <p class="card-text flex-grow-1">${project.projectShortDescription || 'No description available.'}</p>
                    <div class="mt-auto text-center">
                        <a class="btn btn-primary px-4" href="./donatenow.html?id=${project.projectId || ''}">View Details</a>
                    </div>
                </div>
            </div>
        </div>`;
}