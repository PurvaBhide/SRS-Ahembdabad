// // Project filtering and display functionality with styled category buttons
// document.addEventListener('DOMContentLoaded', function() {
//     // Add CSS styles directly to the page
//     addCategoryButtonStyles();
    
//     const categoryFilter = document.getElementById('categoryFilter');
//     const scaleFilter = document.getElementById('scaleFilter');
//     const projectList = document.getElementById('projectList');
    
//     // Create category buttons container if it doesn't exist
//     createCategoryButtons();
    
//     // Initialize the page
//     loadProjects();
    
//     // Event listeners for filters
//     if (categoryFilter) {
//         categoryFilter.addEventListener('change', handleFilterChange);
//     }
//     if (scaleFilter) {
//         scaleFilter.addEventListener('change', handleFilterChange);
//     }
    
//     // Add CSS styles for category buttons
//     function addCategoryButtonStyles() {
//         // Add Font Awesome if not already included
//         if (!document.querySelector('link[href*="font-awesome"]')) {
//             const fontAwesome = document.createElement('link');
//             fontAwesome.rel = 'stylesheet';
//             fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
//             document.head.appendChild(fontAwesome);
//         }
        
//         const style = document.createElement('style');
//         style.textContent = `
//             .category-filter-container {
//                 display: flex;
//                 flex-wrap: wrap;
//                 gap: 12px;
//                 margin: 20px 0;
//                 padding: 0 20px;
//                 justify-content: center;
//                 align-items: center;
//             }
            
//             .category-btn {
//                 display: inline-flex;
//                 align-items: center;
//                 gap: 8px;
//                 padding: 12px 20px;
//                 border: 2px solid #0A1E46;
//                 border-radius: 25px;
//                 background: transparent;
//                 color: #0A1E46;
//                 font-size: 17px;
//                 font-weight: 500;
//                 cursor: pointer;
//                 transition: all 0.3s ease;
//                 text-decoration: none;
//                 white-space: nowrap;
//             }
            
//             .category-btn:hover {
//                 border-color: #0A1E46;
//                 color: #0A1E46;
//                 transform: translateY(-2px);
//                 box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
//             }
            
//             .category-btn.active {
//                 background: #0A1E46;
//                 border-color: #0A1E46;
//                 color: white;
//             }
            
//             .category-btn.active:hover {
//                 background: #0A1E46;
//                 border-color: #0A1E46;
//                 color: white;
//             }
            
//             .category-btn i {
//                 width: 18px;
//                 height: 18px;
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 margin-right: 8px;
//             }
            
//             .budget-select {
//                 padding: 12px 20px;
//                 border: 2px solid #0A1E46;
//                 border-radius: 25px;
//                 background: transparent;
//                 color: #0A1E46;
//                 font-size: 17px;
//                 font-weight: 500;
//                 cursor: pointer;
//                 outline: none;
//                 min-width: 180px;
//             }
            
//             .budget-select:focus {
//                 border-color: #0A1E46;
//                 box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//             }
            
//             @media (max-width: 768px) {
//                 .category-filter-container {
//                     padding: 0 10px;
//                     gap: 8px;
//                 }
                
//                 .category-btn {
//                     padding: 10px 16px;
//                     font-size: 13px;
//                 }
                
//                 .budget-select {
//                     padding: 10px 16px;
//                     font-size: 13px;
//                     min-width: 150px;
//                 }
//             }
//         `;
//         document.head.appendChild(style);
//     }
    
//     // Create category buttons
//     function createCategoryButtons() {
//         // Find existing container or create new one
//         let container = document.querySelector('.category-filter-container');
//         if (!container) {
//             container = document.createElement('div');
//             container.className = 'category-filter-container';
            
//             // Insert before project list or after a specific element
//             const projectSection = projectList || document.body;
//             projectSection.parentNode.insertBefore(container, projectSection);
//         }
        
//         const categories = [
//             { id: 'all', name: 'All Projects', icon: 'fas fa-star' },
//             { id: '1', name: 'Health', icon: 'fas fa-heartbeat' },
//             { id: '2', name: 'Environment', icon: 'fas fa-leaf' },
//             { id: '3', name: 'Education', icon: 'fas fa-graduation-cap' },
//             { id: '5', name: 'Infrastructure', icon: 'fas fa-city' },
//             { id: '4', name: 'Social', icon: 'fas fa-users' }
//         ];
        
//         let buttonsHTML = '';
        
//         // Add category buttons
//         categories.forEach(function(category) {
//             const isActive = category.id === 'all' ? 'active' : '';
//             buttonsHTML += `
//                 <button class="category-btn ${isActive}" data-category="${category.id}">
//                     <i class="${category.icon}"></i>
//                     ${category.name}
//                 </button>
//             `;
//         });
        
//         // Add budget select
//         buttonsHTML += `
//             <select class="budget-select" id="budgetSelect">
//                 <option value="all"><i class="fas fa-rupee-sign"></i> Select Budget</option>
//                 <option value="50000">₹50,000</option>
//                 <option value="100000">₹1,00,000</option>
//                 <option value="150000">₹1,50,000</option>
//                 <option value="200000">₹2,00,000</option>
//                 <option value="250000">₹2,50,000</option>
//                 <option value="300000">₹3,00,000</option>
//                 <option value="350000">₹3,50,000</option>
//                 <option value="400000">₹4,00,000</option>
//                 <option value="450000">₹4,50,000</option>
//                 <option value="500000">₹5,00,000</option>
//                 <option value="700000">₹7,00,000</option>
//                 <option value="1300000">₹13,00,000</option>
//             </select>
//         `;
        
//         container.innerHTML = buttonsHTML;
        
//         // Add event listeners to category buttons
//         container.querySelectorAll('.category-btn').forEach(function(btn) {
//             btn.addEventListener('click', function() {
//                 // Remove active class from all buttons
//                 container.querySelectorAll('.category-btn').forEach(function(b) {
//                     b.classList.remove('active');
//                 });
//                 // Add active class to clicked button
//                 this.classList.add('active');
                
//                 // Update hidden select if it exists
//                 const categoryId = this.dataset.category;
//                 if (categoryFilter) {
//                     categoryFilter.value = categoryId === 'all' ? '0' : categoryId;
//                 }
                
//                 // Trigger filter change
//                 handleCategoryButtonChange(categoryId);
//             });
//         });
        
//         // Add event listener to budget select
//         const budgetSelect = container.querySelector('#budgetSelect');
//         if (budgetSelect) {
//             budgetSelect.addEventListener('change', function() {
//                 if (scaleFilter) {
//                     scaleFilter.value = this.value;
//                 }
//                 handleBudgetChange();
//             });
//         }
//     }
    
//     // Handle budget changes
//     function handleBudgetChange() {
//         // Get currently active category button
//         const activeButton = document.querySelector('.category-btn.active');
//         const selectedCategory = activeButton ? activeButton.dataset.category : 'all';
        
//         const budgetSelect = document.querySelector('#budgetSelect');
//         const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
//         // Show loading state
//         showLoading();
        
//         // Determine which API to call based on selections
//         if (selectedCategory === 'all' && selectedBudget === 'all') {
//             // No filters selected - load all ongoing projects
//             loadProjects();
//         } else if (selectedCategory !== 'all' && selectedBudget === 'all') {
//             // Only category selected
//             loadProjectsByCategory(selectedCategory);
//         } else if (selectedCategory === 'all' && selectedBudget !== 'all') {
//             // Only budget selected
//             loadProjectsByBudget(selectedBudget);
//         } else {
//             // Both category and budget selected
//             loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
//         }
//     }
    
//     // Handle category button changes
//     function handleCategoryButtonChange(categoryId) {
//         const budgetSelect = document.querySelector('#budgetSelect');
//         const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
//         // Show loading state
//         showLoading();
        
//         // Determine which API to call based on selections
//         if (categoryId === 'all' && selectedBudget === 'all') {
//             // No filters selected - load all ongoing projects
//             loadProjects();
//         } else if (categoryId !== 'all' && selectedBudget === 'all') {
//             // Only category selected
//             loadProjectsByCategory(categoryId);
//         } else if (categoryId === 'all' && selectedBudget !== 'all') {
//             // Only budget selected
//             loadProjectsByBudget(selectedBudget);
//         } else {
//             // Both category and budget selected
//             loadProjectsByCategoryAndBudget(categoryId, selectedBudget);
//         }
//     }
    
//     // Main function to handle filter changes
//     function handleFilterChange() {
//         const selectedCategory = categoryFilter ? categoryFilter.value : '0';
//         const selectedBudget = scaleFilter ? scaleFilter.value : 'all';
        
//         // Update button states
//         updateButtonStates(selectedCategory, selectedBudget);
        
//         // Show loading state
//         showLoading();
        
//         // Determine which API to call based on selections
//         if (selectedCategory === '0' && selectedBudget === 'all') {
//             // No filters selected - load all ongoing projects
//             loadProjects();
//         } else if (selectedCategory !== '0' && selectedBudget === 'all') {
//             // Only category selected
//             loadProjectsByCategory(selectedCategory);
//         } else if (selectedCategory === '0' && selectedBudget !== 'all') {
//             // Only budget selected
//             loadProjectsByBudget(selectedBudget);
//         } else {
//             // Both category and budget selected
//             loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
//         }
//     }
    
//     // Update button states based on current filters
//     function updateButtonStates(categoryId, budgetValue) {
//         const container = document.querySelector('.category-filter-container');
//         if (!container) return;
        
//         // Update category buttons
//         container.querySelectorAll('.category-btn').forEach(function(btn) {
//             btn.classList.remove('active');
//             const btnCategory = btn.dataset.category;
//             if ((categoryId === '0' && btnCategory === 'all') || categoryId === btnCategory) {
//                 btn.classList.add('active');
//             }
//         });
        
//         // Update budget select
//         const budgetSelect = container.querySelector('#budgetSelect');
//         if (budgetSelect) {
//             budgetSelect.value = budgetValue;
//         }
//     }
    
//     // Load all projects (default)
//     function loadProjects() {
       
//         ProjectService.listAll(0, 100)
//             .then(function(response) {
//                   // Handle the specific response structure from your API
//                 if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
//                      const ongoingProjects = filterOngoingProjects(response.data.content);
//                       displayProjects(ongoingProjects);
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Load projects by category
//     function loadProjectsByCategory(categoryId) {
//         ProjectService.projectbycategry(categoryId)
//             .then(function(response) {
                 
//                 if (response && response.status === 200 && response.data) {
//                     let projectsArray = [];
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
                    
//                     if (projectsArray.length > 0) {
//                         const ongoingProjects = filterOngoingProjects(projectsArray);
//                         displayProjects(ongoingProjects);
//                     } else {
//                         displayNoProjects();
//                     }
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects by category:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Load projects by budget
//     function loadProjectsByBudget(budget) {
//         ProjectService.projectbybudget(budget)
//             .then(function(response) {
//                  if (response && response.status === 200 && response.data) {
//                     let projectsArray = [];
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
                    
//                     if (projectsArray.length > 0) {
//                         const ongoingProjects = filterOngoingProjects(projectsArray);
//                         displayProjects(ongoingProjects);
//                     } else {
//                         displayNoProjects();
//                     }
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects by budget:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Load projects by both category and budget
//     function loadProjectsByCategoryAndBudget(categoryId, budget) {
          
//         // Strategy: First filter by category (usually fewer results), then filter by budget locally
//         ProjectService.projectbycategry(categoryId)
//             .then(function(response) {
                 
//                 let projectsArray = [];
//                 if (response && response.status === 200 && response.data) {
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
//                 }
                
                  
//                 if (projectsArray.length > 0) {
//                     // Filter by budget and ongoing status
//                     const filteredProjects = projectsArray.filter(function(project) {
//                         const isOngoing = project.projectStatus === 'Ongoing';
//                         const matchesBudget = project.projectBudget == budget;
//                           return isOngoing && matchesBudget;
//                     });
//                       displayProjects(filteredProjects);
//                 } else {
//                      displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                    displayNoProjects();
//             });
//     }
    
//     // Filter projects to show only ongoing ones
//     function filterOngoingProjects(projects) {
         
//         if (!Array.isArray(projects)) {
//              return [];
//         }
        
//         // Log each project's status
//         projects.forEach(function(project, index) {
        
//         });
        
//         const ongoingProjects = projects.filter(function(project) {
//             const isOngoing = project.projectStatus === 'Ongoing';
//              return isOngoing;
//         });
        
//        return ongoingProjects;
//     }
    
//     // Display projects in the UI
//     function displayProjects(projects) {
        
//         if (!projects || projects.length === 0) {
//              displayNoProjects();
//             return;
//         }
        
//         let html = '';
//         projects.forEach(function(project, index) {
//              const cardHtml = createProjectCard(project);
//            html += cardHtml;
//         });
//         projectList.innerHTML = html;
//         }
    
//     // Create HTML for a single project card using your CSS classes
//     function createProjectCard(project) {
//         const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
//         const title = project.projectName || project.projectTitle || 'Untitled Project';
//         const description = project.projectShortDescription || project.projectDescription || 'No description available';
//         const category = getCategoryName(project.categoryId) || 'Uncategorized';
//         const mainImage = project.projectMainImage || 'https://via.placeholder.com/300x180?text=No+Image';
//         const projectId = project.projectId || project.id || 0;
//         const impactPeople = project.impactpeople || 0;
//         const raisedAmount = project.raisedAmount || 0;
//         const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
          
//         return `
//             <div class="card" data-project-id="${projectId}" style="position: relative;">
                
//                 <div class="placeholder">
//                     <img src="${mainImage}" alt="${escapeHtml(title)}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-text\\'>No Image Available</div>';">
//                 </div>
//                 <div class="card-content">
//                     <div class="tag">${escapeHtml(category)}</div>
//                     <div class="cost">
//                         Funding Required: <span class="cost-amount">${budget}</span>
//                     </div>
//                     <h3 class="title">${escapeHtml(title)}</h3>
//                     ${raisedAmount > 0 ? `
//                         <div class="donate-progress">
//                             <div class="progress-info">
//                                 <span class="raised-amount">₹${Number(raisedAmount).toLocaleString('en-IN')} raised</span>
//                                 <span class="target-amount">of ${budget}</span>
//                             </div>
//                             <div class="progress-bar">
//                                 <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
//                             </div>
//                         </div>
//                     ` : ''}
//                     <a class="view-link" href="./donatenow.html?id=${projectId}">View Details</a>
//                 </div>
//             </div>
//         `;
//     }
    
//     // Display message when no projects are found
//     function displayNoProjects() {
//         projectList.innerHTML = `
//             <div class="no-results">
//                 <p>No ongoing projects match your current filter criteria.</p>
//                 <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: 600;">Reset Filters</button>
//             </div>
//         `;
//     }
    
//     // Show loading state
//     function showLoading() {
//         projectList.innerHTML = `
//             <div class="no-results">
//                 <div style="border: 4px solid #f3f4f6; border-top: 4px solid #0A1E46; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
//                 <p>Loading projects...</p>
//             </div>
//             <style>
//                 @keyframes spin {
//                     0% { transform: rotate(0deg); }
//                     100% { transform: rotate(360deg); }
//                 }
//             </style>
//         `;
//     }
    
//     // Get category name by ID
//     function getCategoryName(categoryId) {
//         const categories = {
//             1: 'Health',
//             2: 'Environment',
//             3: 'Education',
//             4: 'Social',
//             5: 'Infrastructure'
//         };
//         return categories[categoryId] || 'Uncategorized';
//     }
    
//     // Escape HTML to prevent XSS
//     function escapeHtml(text) {
//         if (typeof text !== 'string') return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }
    
//     // Global reset function
//     window.resetFilters = function() {
//         // Reset original selects if they exist
//         if (categoryFilter) categoryFilter.value = '0';
//         if (scaleFilter) scaleFilter.value = 'all';
        
//         // Reset button states
//         updateButtonStates('0', 'all');
        
//         // Load all projects
//         loadProjects();
//     };
// });

// // Prevent form submission on Enter key
// document.addEventListener('keydown', function(e) {
//     if (e.key === 'Enter') {
//         e.preventDefault();
//     }
// });

















































































// Complete Project Carousel Solution - All Features
document.addEventListener('DOMContentLoaded', function() {
    console.log('Carousel script loaded');
    
    // Force add carousel styles with higher specificity
    addCarouselStyles();
    
    const categoryFilter = document.getElementById('categoryFilter');
    const scaleFilter = document.getElementById('scaleFilter');
    const projectList = document.getElementById('projectList');
    
    // Carousel state
    let currentSlide = 0;
    let slidesPerView = getSlidesPerView();
    let totalSlides = 0;
    let autoSlideInterval = null;
    
    // Create category buttons
    createCategoryButtons();
    
    // Initialize
    loadProjects();
    
    // Window resize handler
    window.addEventListener('resize', function() {
        slidesPerView = getSlidesPerView();
        updateCarouselPosition();
    });
    
    function getSlidesPerView() {
        const width = window.innerWidth;
        if (width >= 1200) return 3;
        if (width >= 768) return 2;
        return 1;
    }
    
    // Complete CSS with all styles
    function addCarouselStyles() {
        const existingStyle = document.getElementById('carousel-styles');
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = 'carousel-styles';
        style.textContent = `
            /* Force override existing styles */
            #projectList, .project-list {
                display: block !important;
                overflow: hidden !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            /* Category Filter Styles */
            .category-filter-container {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 12px !important;
                margin: 20px 0 !important;
                padding: 0 20px !important;
                justify-content: center !important;
                align-items: center !important;
            }
            
            .category-btn {
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 12px 20px !important;
                border: 2px solid #0A1E46 !important;
                border-radius: 25px !important;
                background: transparent !important;
                color: #0A1E46 !important;
                font-size: 17px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                text-decoration: none !important;
                white-space: nowrap !important;
            }
            
            .category-btn:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
            }
            
            .category-btn.active {
                background: #0A1E46 !important;
                color: white !important;
            }
            
            .budget-select {
                padding: 12px 20px !important;
                border: 2px solid #0A1E46 !important;
                border-radius: 25px !important;
                background: white !important;
                color: #0A1E46 !important;
                font-size: 17px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                outline: none !important;
                min-width: 180px !important;
            }
            
            /* CAROUSEL CONTAINER */
            .carousel-container {
                position: relative !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 20px !important;
                overflow: hidden !important;
                background: transparent !important;
                min-height: 590px !important;
            }
            
            .carousel-wrapper {
                position: relative !important;
                overflow: hidden !important;
                border-radius: 15px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
                background: white !important;
                min-height: 400px !important;
            }
            
            /* CAROUSEL TRACK */
            .carousel-track {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                transition: transform 0.5s ease-in-out !important;
                will-change: transform !important;
                width: 100% !important;
                min-height: 400px !important;
            }
            
            /* CAROUSEL SLIDES */
            .carousel-slide {
                flex: 0 0 33.333% !important;
                min-width: 0 !important;
                padding: 10px !important;
                box-sizing: border-box !important;
                display: block !important;
                height:550px;
            }
            
            /* Responsive slide widths */
            @media (max-width: 1199px) {
                .carousel-slide {
                    flex: 0 0 50% !important;
                }
            }
            
            @media (max-width: 767px) {
                .carousel-slide {
                    flex: 0 0 100% !important;
                }
            }
            
            /* CARD STYLES */
            .carousel-slide .card, .simple-grid-item .card {
                height: 100% !important;
                background: white !important;
                border-radius: 15px !important;
                overflow: hidden !important;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s ease !important;
                border: 1px solid #e1e5e9 !important;
                position: relative !important;
                display: block !important;
               
            }
            
            .carousel-slide .card:hover, .simple-grid-item .card:hover {
                transform: translateY(-5px) !important;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* Navigation Controls */
            .carousel-controls {
                position: absolute !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                background: rgba(255, 255, 255, 0.9) !important;
                border: none !important;
                width: 50px !important;
                height: 50px !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 18px !important;
                color: #0A1E46 !important;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s ease !important;
                z-index: 1000 !important;
            }
            
            .carousel-controls:hover {
                background: #0A1E46 !important;
                color: white !important;
                transform: translateY(-50%) scale(1.1) !important;
            }
            
            .carousel-prev {
                left: 10px !important;
            }
            
            .carousel-next {
                right: 10px !important;
            }
            
            .carousel-play-pause {
                position: absolute !important;
                top: 15px !important;
                right: 15px !important;
                background: rgba(255, 255, 255, 0.9) !important;
                border: none !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                cursor: pointer !important;
                display: none !important;
                align-items: center !important;
                justify-content: center !important;
                font-size: 14px !important;
                color: #0A1E46 !important;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.3s ease !important;
                z-index: 1000 !important;
            }
            
            /* Indicators */
            .carousel-indicators {
                display: none !important;
                justify-content: center !important;
                gap: 8px !important;
                margin-top: 20px !important;
                padding: 10px !important;
            }
            
            .carousel-indicator {
                width: 12px !important;
                height: 12px !important;
                border-radius: 50% !important;
                background: #d1d5db !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            }
            
            .carousel-indicator.active {
                background: #0A1E46 !important;
                transform: scale(1.2) !important;
            }
            
            /* Simple Grid Layout for Few Items */
            .simple-grid-container {
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 20px !important;
            }
            
            .simple-grid {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
                gap: 20px !important;
                justify-content: center !important;
                align-items: start !important;
            }
            
            .simple-grid-item {
                display: block !important;
                width: 100% !important;
                max-width: 400px !important;
                margin: 0 auto !important;
            }
            
            /* Responsive grid adjustments */
            @media (max-width: 768px) {
                .simple-grid {
                    grid-template-columns: 1fr !important;
                    gap: 15px !important;
                }
                
                .simple-grid-container {
                    padding: 15px !important;
                }
                
                .category-btn {
                    padding: 10px 16px !important;
                    font-size: 14px !important;
                }
                
                .budget-select {
                    padding: 10px 16px !important;
                    font-size: 14px !important;
                    min-width: 150px !important;
                }
            }
            
            @media (min-width: 769px) and (max-width: 1199px) {
                .simple-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
            }
            
            @media (min-width: 1200px) {
                .simple-grid {
                    grid-template-columns: repeat(3, 1fr) !important;
                }
            }
            
            /* Status Badges */
            .status-badge {
                position: absolute !important;
                top: 0 !important;
                right: 0 !important;
                color: white !important;
                padding: 6px 12px !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                border-radius: 0 15px 0 12px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                z-index: 10 !important;
            }
            
            .status-proposed {
                background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
            }
            
            .status-ongoing {
                background: linear-gradient(135deg, #27ae60, #229954) !important;
            }
            
            .status-completed {
                background: linear-gradient(135deg, #2980b9, #2471a3) !important;
            }
            
            .status-onhold {
                background: linear-gradient(135deg, #f39c12, #e67e22) !important;
            }
            
            .status-unknown {
                background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
            }
            
            /* Loading and No Results */
            .carousel-loading, .carousel-no-results {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 60px 20px !important;
                text-align: center !important;
                color: #6b7280 !important;
                min-height: 400px !important;
            }
            
            .loading-spinner {
                width: 50px !important;
                height: 50px !important;
                border: 4px solid #f3f4f6 !important;
                border-top: 4px solid #0A1E46 !important;
                border-radius: 50% !important;
                animation: spin 1s linear infinite !important;
                margin-bottom: 20px !important;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Font Awesome Fix */
            .fas, .fa {
                font-family: "Font Awesome 6 Free" !important;
                font-weight: 900 !important;
            }
        `;
        document.head.appendChild(style);
        
        // Add Font Awesome
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
    }
    
    function createCategoryButtons() {
        let container = document.querySelector('.category-filter-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'category-filter-container';
            
            const projectSection = projectList || document.body;
            projectSection.parentNode.insertBefore(container, projectSection);
        }
        
        const categories = [
            { id: 'all', name: 'All Projects', icon: 'fas fa-star' },
            { id: '1', name: 'Health', icon: 'fas fa-heartbeat' },
            { id: '2', name: 'Environment', icon: 'fas fa-leaf' },
            { id: '3', name: 'Education', icon: 'fas fa-graduation-cap' },
            { id: '5', name: 'Infrastructure', icon: 'fas fa-city' },
            { id: '4', name: 'Social', icon: 'fas fa-users' }
        ];
        
        let buttonsHTML = '';
        
        categories.forEach(function(category) {
            const isActive = category.id === 'all' ? 'active' : '';
            buttonsHTML += `
                <button class="category-btn ${isActive}" data-category="${category.id}">
                    <i class="${category.icon}"></i>
                    ${category.name}
                </button>
            `;
        });
        
        buttonsHTML += `
           <select class="budget-select" id="budgetSelect">
    <option value="all">Select Budget</option>
    <option value="50000">₹50,000</option>
    <option value="100000">₹1,00,000</option>
    <option value="200000">₹2,00,000</option>
    <option value="300000">₹3,00,000</option>
    <option value="400000">₹4,00,000</option>
    <option value="450000">₹4,50,000</option>
    <option value="500000">₹5,00,000</option>
    <option value="750000">₹7,50,000</option>
    <option value="1000000">₹10,00,000</option>
    <option value="1500000">₹15,00,000</option>
    <option value="2000000">₹20,00,000</option>
    <option value="2500000">₹25,00,000</option>
    <option value="3000000">₹30,00,000</option>
    <option value="4000000">₹40,00,000</option>
    <option value="5000000">₹50,00,000</option>
    <option value="7500000">₹75,00,000</option>
    <option value="10000000">₹1 Crore</option>
</select>

        `;
        
        container.innerHTML = buttonsHTML;
        
        // Add event listeners
        container.querySelectorAll('.category-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                container.querySelectorAll('.category-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                const categoryId = this.dataset.category;
                handleCategoryButtonChange(categoryId);
            });
        });
        
        const budgetSelect = container.querySelector('#budgetSelect');
        if (budgetSelect) {
            budgetSelect.addEventListener('change', function() {
                handleBudgetChange();
            });
        }
    }
    
    // Smart carousel initialization that handles different scenarios
    function initializeCarousel(projects) {
        console.log('Initializing carousel with projects:', projects.length);
        
        if (!projects || projects.length === 0) {
            displayNoProjects();
            return;
        }
        
        slidesPerView = getSlidesPerView();
        
        // Smart layout decision
        if (projects.length <= slidesPerView) {
            displaySimpleGrid(projects);
            return;
        }
        
        // Normal carousel for multiple items
        totalSlides = Math.ceil(projects.length / slidesPerView);
        currentSlide = 0;
        
        const carouselHTML = createCarouselHTML(projects);
        projectList.innerHTML = carouselHTML;
        
        setTimeout(function() {
            updateSlideWidths();
            updateCarouselPosition();
            addCarouselEventListeners();
            addTouchSupport();
            
            if (totalSlides > 1) {
                startAutoPlay();
            }
            
            updateIndicators();
            
            const carouselContainer = document.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.setAttribute('tabindex', '0');
                carouselContainer.style.outline = 'none';
            }
        }, 100);
    }
    
    // Simple grid layout for few items
    function displaySimpleGrid(projects) {
        console.log('Displaying simple grid for', projects.length, 'projects');
        
        let projectsHTML = '';
        projects.forEach(function(project) {
            projectsHTML += `
                <div class="simple-grid-item">
                    ${createProjectCard(project)}
                </div>
            `;
        });
        
        projectList.innerHTML = `
            <div class="simple-grid-container">
                <div class="simple-grid">
                    ${projectsHTML}
                </div>
            </div>
        `;
    }
    
    function createCarouselHTML(projects) {
        let slidesHTML = '';
        
        projects.forEach(function(project, index) {
            slidesHTML += `
                <div class="carousel-slide" role="listitem" aria-label="Project ${index + 1}">
                    ${createProjectCard(project)}
                </div>
            `;
        });
        
        let indicatorsHTML = '';
        if (totalSlides > 1) {
            for (let i = 0; i < totalSlides; i++) {
                const activeClass = i === 0 ? 'active' : '';
                indicatorsHTML += `
                    <div class="carousel-indicator ${activeClass}" 
                         data-slide="${i}" 
                         role="button" 
                         aria-label="Go to slide ${i + 1}"
                         tabindex="0">
                    </div>`;
            }
        }
        
        const showControls = totalSlides > 1;
        
        return `
            <div class="carousel-container" role="region" aria-label="Project Carousel" tabindex="0">
                <div class="carousel-wrapper">
                    ${showControls ? `
                        <button class="carousel-controls carousel-prev" id="prevBtn" aria-label="Previous project">
                            <i class="fas fa-chevron-left" aria-hidden="true"></i>
                        </button>
                        <button class="carousel-controls carousel-next" id="nextBtn" aria-label="Next project">
                            <i class="fas fa-chevron-right" aria-hidden="true"></i>
                        </button>
                        <button class="carousel-play-pause" id="playPauseBtn" aria-label="Toggle auto-play">
                            <i class="fas fa-pause" aria-hidden="true"></i>
                        </button>
                    ` : ''}
                    <div class="carousel-track" id="carouselTrack" role="list">
                        ${slidesHTML}
                    </div>
                </div>
                ${showControls && indicatorsHTML ? `
                    <div class="carousel-indicators" id="carouselIndicators" role="group" aria-label="Carousel navigation">
                        ${indicatorsHTML}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    function addCarouselEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const indicators = document.querySelectorAll('.carousel-indicator');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                previousSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                nextSlide();
            });
        }
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleAutoPlay();
            });
        }
        
        indicators.forEach(function(indicator, index) {
            indicator.addEventListener('click', function() {
                goToSlide(index);
            });
        });
    }
    
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarouselPosition();
    }
    
    function previousSlide() {
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = totalSlides - 1;
        }
        updateCarouselPosition();
    }
    
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateCarouselPosition();
    }
    
    function updateCarouselPosition() {
        const track = document.getElementById('carouselTrack');
        if (track) {
            const translateX = -(currentSlide * (100 / slidesPerView));
            track.style.transform = `translateX(${translateX}%)`;
        }
        updateIndicators();
    }
    
    function updateIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach(function(indicator, index) {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    function updateSlideWidths() {
        const slides = document.querySelectorAll('.carousel-slide');
        const width = (100 / slidesPerView) + '%';
        
        slides.forEach(function(slide) {
            slide.style.flex = `0 0 ${width}`;
        });
    }
    
    function startAutoPlay() {
        stopAutoPlay();
        if (totalSlides > 1) {
            autoSlideInterval = setInterval(function() {
                nextSlide();
            }, 4000);
            
            const carouselWrapper = document.querySelector('.carousel-wrapper');
            if (carouselWrapper) {
                carouselWrapper.addEventListener('mouseenter', function() {
                    stopAutoPlay();
                });
                
                carouselWrapper.addEventListener('mouseleave', function() {
                    const playPauseBtn = document.getElementById('playPauseBtn');
                    const isPaused = playPauseBtn && playPauseBtn.innerHTML.includes('fa-play');
                    
                    if (!isPaused) {
                        startAutoPlay();
                    }
                });
            }
        }
    }
    
    function stopAutoPlay() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }
    
    function toggleAutoPlay() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (autoSlideInterval) {
            stopAutoPlay();
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        } else {
            startAutoPlay();
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        }
    }
    
    // Touch support
    function addTouchSupport() {
        const carouselWrapper = document.querySelector('.carousel-wrapper');
        if (!carouselWrapper) return;
        
        let touchStartX = 0;
        let touchEndX = 0;
        let isDragging = false;
        
        carouselWrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
            stopAutoPlay();
        }, { passive: true });
        
        carouselWrapper.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
        }, { passive: false });
        
        carouselWrapper.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            const minSwipeDistance = 50;
            
            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    nextSlide();
                } else {
                    previousSlide();
                }
            }
            
            isDragging = false;
            startAutoPlay();
        }, { passive: true });
    }
    
    // Filter handling functions
    function handleCategoryButtonChange(categoryId) {
        const budgetSelect = document.querySelector('#budgetSelect');
        const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
        showLoading();
        
        if (categoryId === 'all' && selectedBudget === 'all') {
            loadProjects();
        } else if (categoryId !== 'all' && selectedBudget === 'all') {
            loadProjectsByCategory(categoryId);
        } else if (categoryId === 'all' && selectedBudget !== 'all') {
            loadProjectsByBudget(selectedBudget);
        } else {
            loadProjectsByCategoryAndBudget(categoryId, selectedBudget);
        }
    }
    
    function handleBudgetChange() {
        const activeButton = document.querySelector('.category-btn.active');
        const selectedCategory = activeButton ? activeButton.dataset.category : 'all';
        
        const budgetSelect = document.querySelector('#budgetSelect');
        const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
        showLoading();
        
        if (selectedCategory === 'all' && selectedBudget === 'all') {
            loadProjects();
        } else if (selectedCategory !== 'all' && selectedBudget === 'all') {
            loadProjectsByCategory(selectedCategory);
        } else if (selectedCategory === 'all' && selectedBudget !== 'all') {
            loadProjectsByBudget(selectedBudget);
        } else {
            loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
        }
    }
    
    // API functions
    function loadProjects() {
        console.log('Loading all projects...');
        ProjectService.listAll(0, 100)
            .then(function(response) {
                if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
                    const activeProjects = filterActiveProjects(response.data.content);
                    console.log('Active projects found:', activeProjects.length);
                    initializeCarousel(activeProjects);
                } else {
                    console.log('No valid data in response');
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects:', error);
                displayNoProjects();
            });
    }
    
    function loadProjectsByCategory(categoryId) {
        ProjectService.projectbycategry(categoryId)
            .then(function(response) {
                if (response && response.status === 200 && response.data) {
                    let projectsArray = [];
                    if (response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                    } else if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    }
                    
                    if (projectsArray.length > 0) {
                        const activeProjects = filterActiveProjects(projectsArray);
                        initializeCarousel(activeProjects);
                    } else {
                        displayNoProjects();
                    }
                } else {
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects by category:', error);
                displayNoProjects();
            });
    }
    
    function loadProjectsByBudget(budget) {
        ProjectService.projectbybudget(budget)
            .then(function(response) {
                if (response && response.status === 200 && response.data) {
                    let projectsArray = [];
                    if (response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                    } else if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    }
                    
                    if (projectsArray.length > 0) {
                        const activeProjects = filterActiveProjects(projectsArray);
                        initializeCarousel(activeProjects);
                    } else {
                        displayNoProjects();
                    }
                } else {
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects by budget:', error);
                displayNoProjects();
            });
    }
    
    function loadProjectsByCategoryAndBudget(categoryId, budget) {
        console.log('Loading projects with Category:', categoryId, 'Budget:', budget);
        
        ProjectService.projectbycategry(categoryId)
            .then(function(response) {
                let projectsArray = [];
                if (response && response.status === 200 && response.data) {
                    if (response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                    } else if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    }
                }
                
                console.log('Projects from category API:', projectsArray.length);
                
                if (projectsArray.length > 0) {
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
                        const matchesBudget = project.projectBudget == budget;
                        
                        console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Active: ${isActive}, Budget Match: ${matchesBudget}`);
                        
                        return isActive && matchesBudget;
                    });
                    
                    console.log('Final filtered projects:', filteredProjects.length);
                    
                    if (filteredProjects.length > 0) {
                        initializeCarousel(filteredProjects);
                    } else {
                        displayNoProjectsWithDetails(categoryId, budget);
                    }
                } else {
                    displayNoProjectsWithDetails(categoryId, budget);
                }
            })
            .catch(function(error) {
                console.error('Error loading projects:', error);
                displayNoProjectsWithDetails(categoryId, budget);
            });
    }
    
    function filterActiveProjects(projects) {
        if (!Array.isArray(projects)) {
            return [];
        }
        
        const activeProjects = projects.filter(function(project) {
            const isProposed = project.projectStatus === 'Proposed';
            const isOngoing = project.projectStatus === 'Ongoing';
            return isProposed || isOngoing;
        });
        
        console.log('Filtered active projects:', activeProjects.length, 'from', projects.length);
        return activeProjects;
    }
    
    function createProjectCard(project) {
        const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
        const title = project.projectName || project.projectTitle || 'Untitled Project';
        const description = project.projectShortDescription || project.projectDescription || 'No description available';
        const category = getCategoryName(project.categoryId) || 'Uncategorized';
        const mainImage = project.projectMainImage || 'https://via.placeholder.com/300x200?text=No+Image';
        const projectId = project.projectId || project.id || 0;
        const raisedAmount = project.raisedAmount || 0;
        const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
        
        const statusDisplay = project.projectStatus || 'Unknown';
        const statusClass = getStatusClass(project.projectStatus);
        
        return `
            <div class="card" data-project-id="${projectId}">
                <div class="status-badge ${statusClass}">
                    ${statusDisplay}
                </div>
                <div class="placeholder" style="height: 200px; overflow: hidden;">
                    <img src="${mainImage}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'height: 200px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #6b7280;\\'>No Image Available</div>';">
                </div>
                <div class="card-content" style="padding: 20px;">
                    <div class="tag" style="background: #e5f3ff; color: #0066cc; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-block; margin-bottom: 10px;">${escapeHtml(category)}</div>
                    <h3 class="title" style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 10px 0; line-height: 1.4;">${escapeHtml(title)}</h3>
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px; line-height: 1.5;">${escapeHtml(description.substring(0, 100))}${description.length > 100 ? '...' : ''}</p>
                    <div class="cost" style="color: #059669; font-weight: 600; margin-bottom: 15px;">
                        Funding Required: ${budget}
                    </div>
                    ${raisedAmount > 0 ? `
                        <div class="donate-progress" style="margin-bottom: 15px;">
                            <div class="progress-info" style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 5px;">
                                <span>₹${Number(raisedAmount).toLocaleString('en-IN')} raised</span>
                                <span>${progressPercentage}%</span>
                            </div>
                            <div class="progress-bar" style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                                <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); width: ${Math.min(progressPercentage, 100)}%; transition: width 0.3s ease;"></div>
                            </div>
                        </div>
                    ` : ''}
                    <a class="view-link" href="./donatenow.html?id=${projectId}" style="display: inline-block; background: #0A1E46; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500; text-align: center; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">View Details</a>
                </div>
            </div>
        `;
    }
    
    function getStatusClass(status) {
        switch(status) {
            case 'Proposed':
                return 'status-proposed';
            case 'Ongoing':
                return 'status-ongoing'; 
            case 'Completed':
                return 'status-completed';
            case 'On Hold':
                return 'status-onhold';
            default:
                return 'status-unknown';
        }
    }
    
    function getCategoryName(categoryId) {
        const categories = {
            1: 'Health',
            2: 'Environment',
            3: 'Education',
            4: 'Social',
            5: 'Infrastructure'
        };
        return categories[categoryId] || 'Uncategorized';
    }
    
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Enhanced no projects display with filter details
    function displayNoProjectsWithDetails(categoryId, budget) {
        const categoryName = getCategoryName(parseInt(categoryId)) || 'Selected Category';
        const budgetFormatted = budget ? '₹' + Number(budget).toLocaleString('en-IN') : 'Selected Budget';
        
        stopAutoPlay();
        projectList.innerHTML = `
            <div class="carousel-no-results">
                <i class="fas fa-filter" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
                <h3 style="color: #374151; margin-bottom: 10px;">No Projects Found</h3>
                <p style="color: #6b7280; margin-bottom: 15px; text-align: center; max-width: 400px;">
                    No active projects found for <strong>${categoryName}</strong> with budget <strong>${budgetFormatted}</strong>
                </p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
                    <button onclick="clearBudgetFilter()" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">Clear Budget Filter</button>
                    <button onclick="clearCategoryFilter()" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.3s ease;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">Clear Category Filter</button>
                    <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">Reset All Filters</button>
                </div>
            </div>
        `;
    }
    
    function displayNoProjects() {
        stopAutoPlay();
        projectList.innerHTML = `
            <div class="carousel-no-results">
                <i class="fas fa-search" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
                <h3 style="color: #374151; margin-bottom: 10px;">No Active Projects Found</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">No active projects (Proposed or Ongoing) match your current filter criteria.</p>
                <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">Reset Filters</button>
            </div>
        `;
    }
    
    function showLoading() {
        stopAutoPlay();
        projectList.innerHTML = `
            <div class="carousel-loading">
                <div class="loading-spinner"></div>
                <p style="color: #6b7280; font-size: 16px;">Loading amazing projects...</p>
            </div>
        `;
    }
    
    // Helper functions for partial filter clearing
    window.clearBudgetFilter = function() {
        const budgetSelect = document.querySelector('#budgetSelect');
        if (budgetSelect) {
            budgetSelect.value = 'all';
        }
        
        const activeButton = document.querySelector('.category-btn.active');
        const selectedCategory = activeButton ? activeButton.dataset.category : 'all';
        
        if (selectedCategory === 'all') {
            loadProjects();
        } else {
            loadProjectsByCategory(selectedCategory);
        }
    };
    
    window.clearCategoryFilter = function() {
        const container = document.querySelector('.category-filter-container');
        if (container) {
            container.querySelectorAll('.category-btn').forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') {
                    btn.classList.add('active');
                }
            });
        }
        
        const budgetSelect = document.querySelector('#budgetSelect');
        const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
        if (selectedBudget === 'all') {
            loadProjects();
        } else {
            loadProjectsByBudget(selectedBudget);
        }
    };
    
    // Global reset function
    window.resetFilters = function() {
        const container = document.querySelector('.category-filter-container');
        if (container) {
            container.querySelectorAll('.category-btn').forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') {
                    btn.classList.add('active');
                }
            });
            
            const budgetSelect = container.querySelector('#budgetSelect');
            if (budgetSelect) {
                budgetSelect.value = 'all';
            }
        }
        
        loadProjects();
    };
    
    // Enhanced responsive handling
    function handleResponsiveChanges() {
        const newSlidesPerView = getSlidesPerView();
        if (newSlidesPerView !== slidesPerView) {
            slidesPerView = newSlidesPerView;
            
            const slides = document.querySelectorAll('.carousel-slide');
            if (slides.length > 0) {
                totalSlides = Math.ceil(slides.length / slidesPerView);
                
                if (currentSlide >= totalSlides) {
                    currentSlide = Math.max(0, totalSlides - 1);
                }
                
                updateCarouselPosition();
                updateIndicators();
                updateSlideWidths();
            }
        }
    }
    
    // Enhanced window resize handler with debouncing
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            handleResponsiveChanges();
        }, 250);
    });
    
    // Keyboard navigation support
    function handleKeyboardNavigation(e) {
        const carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer) return;
        
        if (!carouselContainer.contains(document.activeElement)) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
            case ' ':
                e.preventDefault();
                toggleAutoPlay();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides - 1);
                break;
        }
    }
    
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Accessibility improvements
    function addAccessibilityFeatures() {
        const carouselContainer = document.querySelector('.carousel-container');
        if (!carouselContainer) return;
        
        carouselContainer.setAttribute('role', 'region');
        carouselContainer.setAttribute('aria-label', 'Project Carousel');
        
        const track = document.getElementById('carouselTrack');
        if (track) {
            track.setAttribute('role', 'list');
        }
        
        const slides = document.querySelectorAll('.carousel-slide');
        slides.forEach(function(slide, index) {
            slide.setAttribute('role', 'listitem');
            slide.setAttribute('aria-label', `Project ${index + 1} of ${slides.length}`);
        });
        
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const playPauseBtn = document.getElementById('playPauseBtn');
        
        if (prevBtn) {
            prevBtn.setAttribute('aria-label', 'Previous project');
        }
        
        if (nextBtn) {
            nextBtn.setAttribute('aria-label', 'Next project');
        }
        
        if (playPauseBtn) {
            playPauseBtn.setAttribute('aria-label', 'Toggle auto-play');
        }
        
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach(function(indicator, index) {
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.setAttribute('tabindex', '0');
            
            indicator.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToSlide(index);
                }
            });
        });
    }
    
    // Performance optimization: Intersection Observer for lazy loading
    function initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        }
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', function() {
        stopAutoPlay();
    });
    
    // Initialize accessibility and lazy loading after carousel creation
    setTimeout(function() {
        if (document.querySelector('.carousel-container')) {
            addAccessibilityFeatures();
            initializeLazyLoading();
        }
    }, 200);
});

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        e.preventDefault();
    }
});

































// // Fixed Project Carousel - Debug Version
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Carousel script loaded'); // Debug log
    
//     // Force add carousel styles with higher specificity
//     addCarouselStyles();
    
//     const categoryFilter = document.getElementById('categoryFilter');
//     const scaleFilter = document.getElementById('scaleFilter');
//     const projectList = document.getElementById('projectList');
    
//     // Carousel state
//     let currentSlide = 0;
//     let slidesPerView = getSlidesPerView();
//     let totalSlides = 0;
//     let autoSlideInterval = null;
    
//     // Create category buttons
//     createCategoryButtons();
    
//     // Initialize
//     loadProjects();
    
//     // Window resize handler
//     window.addEventListener('resize', function() {
//         slidesPerView = getSlidesPerView();
//         updateCarouselPosition();
//     });
    
//     function getSlidesPerView() {
//         const width = window.innerWidth;
//         if (width >= 1200) return 3;
//         if (width >= 768) return 2;
//         return 1;
//     }
    
//     // Enhanced CSS with !important to override existing styles
//     function addCarouselStyles() {
//         // Remove any existing carousel styles
//         const existingStyle = document.getElementById('carousel-styles');
//         if (existingStyle) existingStyle.remove();
        
//         const style = document.createElement('style');
//         style.id = 'carousel-styles';
//         style.textContent = `
//             /* Force override existing styles */
//             #projectList, .project-list {
//                 display: block !important;
//                 overflow: hidden !important;
//                 padding: 0 !important;
//                 margin: 0 !important;
//             }
            
//             /* Category Filter Styles */
//             .category-filter-container {
//                 display: flex !important;
//                 flex-wrap: wrap !important;
//                 gap: 12px !important;
//                 margin: 20px 0 !important;
//                 padding: 0 20px !important;
//                 justify-content: center !important;
//                 align-items: center !important;
//             }
            
//             .category-btn {
//                 display: inline-flex !important;
//                 align-items: center !important;
//                 gap: 8px !important;
//                 padding: 12px 20px !important;
//                 border: 2px solid #0A1E46 !important;
//                 border-radius: 25px !important;
//                 background: transparent !important;
//                 color: #0A1E46 !important;
//                 font-size: 17px !important;
//                 font-weight: 500 !important;
//                 cursor: pointer !important;
//                 transition: all 0.3s ease !important;
//                 text-decoration: none !important;
//                 white-space: nowrap !important;
//             }
            
//             .category-btn:hover {
//                 transform: translateY(-2px) !important;
//                 box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
//             }
            
//             .category-btn.active {
//                 background: #0A1E46 !important;
//                 color: white !important;
//             }
            
//             .budget-select {
//                 padding: 12px 20px !important;
//                 border: 2px solid #0A1E46 !important;
//                 border-radius: 25px !important;
//                 background: white !important;
//                 color: #0A1E46 !important;
//                 font-size: 17px !important;
//                 font-weight: 500 !important;
//                 cursor: pointer !important;
//                 outline: none !important;
//                 min-width: 180px !important;
//             }
            
//             /* CAROUSEL CONTAINER - FORCE OVERRIDE */
//             .carousel-container {
//                 position: relative !important;
//                 max-width: 1200px !important;
//                 margin: 0 auto !important;
//                 padding: 20px !important;
//                 overflow: hidden !important;
//                 background: transparent !important;
//                 height:550px;
//             }
            
//             .carousel-wrapper {
//                 position: relative !important;
//                 overflow: hidden !important;
//                 border-radius: 15px !important;
//                 box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
//                 background: white !important;
//             }
            
//             /* CAROUSEL TRACK - CRITICAL FLEXBOX */
//             .carousel-track {
//                 display: flex !important;
//                 flex-direction: row !important;
//                 flex-wrap: nowrap !important;
//                 transition: transform 0.5s ease-in-out !important;
//                 will-change: transform !important;
//                 width: 100% !important;
//             }
            
//             /* CAROUSEL SLIDES - FORCE FLEX BASIS */
//             .carousel-slide {
//                 flex: 0 0 33.333% !important; /* 3 slides default */
//                 min-width: 0 !important;
//                 padding: 10px !important;
//                 box-sizing: border-box !important;
//                 display: block !important;
//             }
            
//             /* Responsive slide widths */
//             @media (max-width: 1199px) {
//                 .carousel-slide {
//                     flex: 0 0 50% !important; /* 2 slides */
//                 }
//             }
            
//             @media (max-width: 767px) {
//                 .carousel-slide {
//                     flex: 0 0 100% !important; /* 1 slide */
//                 }
//             }
            
//             /* CARD STYLES - OVERRIDE ANY EXISTING */
//             .carousel-slide .card {
//                 height: 100% !important;
//                 background: white !important;
//                 border-radius: 15px !important;
//                 overflow: hidden !important;
//                 box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
//                 transition: all 0.3s ease !important;
//                 border: 1px solid #e1e5e9 !important;
//                 position: relative !important;
//                 display: block !important;
//             }
            
//             .carousel-slide .card:hover {
//                 transform: translateY(-5px) !important;
//                 box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
//             }
            
//             /* Navigation Controls */
//             .carousel-controls {
//                 position: absolute !important;
//                 top: 50% !important;
//                 transform: translateY(-50%) !important;
//                 background: rgba(255, 255, 255, 0.9) !important;
//                 border: none !important;
//                 width: 50px !important;
//                 height: 50px !important;
//                 border-radius: 50% !important;
//                 cursor: pointer !important;
//                 display: flex !important;
//                 align-items: center !important;
//                 justify-content: center !important;
//                 font-size: 18px !important;
//                 color: #0A1E46 !important;
//                 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
//                 transition: all 0.3s ease !important;
//                 z-index: 1000 !important;
//             }
            
//             .carousel-controls:hover {
//                 background: #0A1E46 !important;
//                 color: white !important;
//                 transform: translateY(-50%) scale(1.1) !important;
//             }
            
//             .carousel-prev {
//                 left: 10px !important;
//             }
            
//             .carousel-next {
//                 right: 10px !important;
//             }
            
//             .carousel-play-pause {
//                 position: absolute !important;
//                 top: 15px !important;
//                 right: 15px !important;
//                 background: rgba(255, 255, 255, 0.9) !important;
//                 border: none !important;
//                 width: 40px !important;
//                 height: 40px !important;
//                 border-radius: 50% !important;
//                 cursor: pointer !important;
//                 display: none !important;
//                 align-items: center !important;
//                 justify-content: center !important;
//                 font-size: 14px !important;
//                 color: #0A1E46 !important;
//                 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
//                 transition: all 0.3s ease !important;
//                 z-index: 1000 !important;
              
//             }
            
//             /* Indicators */
//             .carousel-indicators {
//                 display: none !important;
//                 justify-content: center !important;
//                 gap: 8px !important;
//                 margin-top: 20px !important;
//                 padding: 10px !important;
               
//             }
            
//             .carousel-indicator {
//                 width: 12px !important;
//                 height: 12px !important;
//                 border-radius: 50% !important;
//                 background: #d1d5db !important;
//                 cursor: pointer !important;
//                 transition: all 0.3s ease !important;
//             }
            
//             .carousel-indicator.active {
//                 background: #0A1E46 !important;
//                 transform: scale(1.2) !important;
//             }
            
//             /* Status Badges */
//             .status-badge {
//                 position: absolute !important;
//                 top: 0 !important;
//                 right: 0 !important;
//                 color: white !important;
//                 padding: 6px 12px !important;
//                 font-size: 12px !important;
//                 font-weight: 500 !important;
//                 border-radius: 0 15px 0 12px !important;
//                 text-transform: uppercase !important;
//                 letter-spacing: 0.5px !important;
//                 z-index: 10 !important;
//             }
            
//             .status-proposed {
//                 background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
//             }
            
//             .status-ongoing {
//                 background: linear-gradient(135deg, #27ae60, #229954) !important;
//             }
            
//             /* Loading and No Results */
//             .carousel-loading, .carousel-no-results {
//                 display: flex !important;
//                 flex-direction: column !important;
//                 align-items: center !important;
//                 justify-content: center !important;
//                 padding: 60px 20px !important;
//                 text-align: center !important;
//                 color: #6b7280 !important;
//                 min-height: 300px !important;
//             }
            
//             .loading-spinner {
//                 width: 50px !important;
//                 height: 50px !important;
//                 border: 4px solid #f3f4f6 !important;
//                 border-top: 4px solid #0A1E46 !important;
//                 border-radius: 50% !important;
//                 animation: spin 1s linear infinite !important;
//                 margin-bottom: 20px !important;
//             }
            
//             @keyframes spin {
//                 0% { transform: rotate(0deg); }
//                 100% { transform: rotate(360deg); }
//             }
            
//             /* Font Awesome Fix */
//             .fas, .fa {
//                 font-family: "Font Awesome 6 Free" !important;
//                 font-weight: 900 !important;
//             }
//         `;
//         document.head.appendChild(style);
        
//         // Add Font Awesome
//         if (!document.querySelector('link[href*="font-awesome"]')) {
//             const fontAwesome = document.createElement('link');
//             fontAwesome.rel = 'stylesheet';
//             fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
//             document.head.appendChild(fontAwesome);
//         }
//     }
    
//     function createCategoryButtons() {
//         let container = document.querySelector('.category-filter-container');
//         if (!container) {
//             container = document.createElement('div');
//             container.className = 'category-filter-container';
            
//             const projectSection = projectList || document.body;
//             projectSection.parentNode.insertBefore(container, projectSection);
//         }
        
//         const categories = [
//             { id: 'all', name: 'All Projects', icon: 'fas fa-star' },
//             { id: '1', name: 'Health', icon: 'fas fa-heartbeat' },
//             { id: '2', name: 'Environment', icon: 'fas fa-leaf' },
//             { id: '3', name: 'Education', icon: 'fas fa-graduation-cap' },
//             { id: '5', name: 'Infrastructure', icon: 'fas fa-city' },
//             { id: '4', name: 'Social', icon: 'fas fa-users' }
//         ];
        
//         let buttonsHTML = '';
        
//         categories.forEach(function(category) {
//             const isActive = category.id === 'all' ? 'active' : '';
//             buttonsHTML += `
//                 <button class="category-btn ${isActive}" data-category="${category.id}">
//                     <i class="${category.icon}"></i>
//                     ${category.name}
//                 </button>
//             `;
//         });
        
//         buttonsHTML += `
//             <select class="budget-select" id="budgetSelect">
//                 <option value="all">Select Budget</option>
//                 <option value="50000">₹50,000</option>
//                 <option value="100000">₹1,00,000</option>
//                 <option value="450000">₹4,50,000</option>
//                 <option value="500000">₹5,00,000</option>
//                 <option value="1000000">₹10,00,000</option>
//                 <option value="5000000">₹50,00,000</option>
//             </select>
//         `;
        
//         container.innerHTML = buttonsHTML;
        
//         // Add event listeners
//         container.querySelectorAll('.category-btn').forEach(function(btn) {
//             btn.addEventListener('click', function() {
//                 container.querySelectorAll('.category-btn').forEach(function(b) {
//                     b.classList.remove('active');
//                 });
//                 this.classList.add('active');
                
//                 const categoryId = this.dataset.category;
//                 handleCategoryButtonChange(categoryId);
//             });
//         });
        
//         const budgetSelect = container.querySelector('#budgetSelect');
//         if (budgetSelect) {
//             budgetSelect.addEventListener('change', function() {
//                 handleBudgetChange();
//             });
//         }
//     }
    
//     // Initialize carousel - FIXED VERSION
//     function initializeCarousel(projects) {
//         console.log('Initializing carousel with projects:', projects.length); // Debug
        
//         if (!projects || projects.length === 0) {
//             displayNoProjects();
//             return;
//         }
        
//         totalSlides = Math.ceil(projects.length / slidesPerView);
//         currentSlide = 0;
        
//         console.log('Total slides:', totalSlides, 'Slides per view:', slidesPerView); // Debug
        
//         const carouselHTML = createCarouselHTML(projects);
//         projectList.innerHTML = carouselHTML;
        
//         // Force apply carousel styles after DOM update
//         setTimeout(function() {
//             updateCarouselPosition();
//             addCarouselEventListeners();
//             startAutoPlay();
//             updateIndicators();
//         }, 100);
//     }
    
//     function createCarouselHTML(projects) {
//         let slidesHTML = '';
        
//         projects.forEach(function(project, index) {
//             console.log('Creating slide for project:', project.projectName); // Debug
//             slidesHTML += `
//                 <div class="carousel-slide">
//                     ${createProjectCard(project)}
//                 </div>
//             `;
//         });
        
//         let indicatorsHTML = '';
//         for (let i = 0; i < totalSlides; i++) {
//             const activeClass = i === 0 ? 'active' : '';
//             indicatorsHTML += `<div class="carousel-indicator ${activeClass}" data-slide="${i}"></div>`;
//         }
        
//         return `
//             <div class="carousel-container">
//                 <div class="carousel-wrapper">
//                     <button class="carousel-controls carousel-prev" id="prevBtn">
//                         <i class="fas fa-chevron-left"></i>
//                     </button>
//                     <button class="carousel-controls carousel-next" id="nextBtn">
//                         <i class="fas fa-chevron-right"></i>
//                     </button>
//                     <button class="carousel-play-pause" id="playPauseBtn">
//                         <i class="fas fa-pause"></i>
//                     </button>
//                     <div class="carousel-track" id="carouselTrack">
//                         ${slidesHTML}
//                     </div>
//                 </div>
//                 <div class="carousel-indicators" id="carouselIndicators">
//                     ${indicatorsHTML}
//                 </div>
//             </div>
//         `;
//     }
    
//     function addCarouselEventListeners() {
//         const prevBtn = document.getElementById('prevBtn');
//         const nextBtn = document.getElementById('nextBtn');
//         const playPauseBtn = document.getElementById('playPauseBtn');
//         const indicators = document.querySelectorAll('.carousel-indicator');
        
//         if (prevBtn) {
//             prevBtn.addEventListener('click', function(e) {
//                 e.preventDefault();
//                 previousSlide();
//             });
//         }
        
//         if (nextBtn) {
//             nextBtn.addEventListener('click', function(e) {
//                 e.preventDefault();
//                 nextSlide();
//             });
//         }
        
//         if (playPauseBtn) {
//             playPauseBtn.addEventListener('click', function(e) {
//                 e.preventDefault();
//                 toggleAutoPlay();
//             });
//         }
        
//         indicators.forEach(function(indicator, index) {
//             indicator.addEventListener('click', function() {
//                 goToSlide(index);
//             });
//         });
//     }
    
//     function nextSlide() {
//         if (currentSlide < totalSlides - 1) {
//             currentSlide++;
//         } else {
//             currentSlide = 0;
//         }
//         updateCarouselPosition();
//     }
    
//     function previousSlide() {
//         if (currentSlide > 0) {
//             currentSlide--;
//         } else {
//             currentSlide = totalSlides - 1;
//         }
//         updateCarouselPosition();
//     }
    
//     function goToSlide(slideIndex) {
//         currentSlide = slideIndex;
//         updateCarouselPosition();
//     }
    
//     function updateCarouselPosition() {
//         const track = document.getElementById('carouselTrack');
//         if (track) {
//             const translateX = -(currentSlide * (100 / slidesPerView));
//             track.style.transform = `translateX(${translateX}%)`;
//             console.log('Updated position:', translateX + '%'); // Debug
//         }
        
//         updateIndicators();
//     }
    
//     function updateIndicators() {
//         const indicators = document.querySelectorAll('.carousel-indicator');
//         indicators.forEach(function(indicator, index) {
//             indicator.classList.toggle('active', index === currentSlide);
//         });
//     }
    
//     function startAutoPlay() {
//         stopAutoPlay();
//         if (totalSlides > 1) {
//             autoSlideInterval = setInterval(function() {
//                 nextSlide();
//             }, 4000);
//         }
//     }
    
//     function stopAutoPlay() {
//         if (autoSlideInterval) {
//             clearInterval(autoSlideInterval);
//             autoSlideInterval = null;
//         }
//     }
    
//     function toggleAutoPlay() {
//         const playPauseBtn = document.getElementById('playPauseBtn');
//         if (autoSlideInterval) {
//             stopAutoPlay();
//             if (playPauseBtn) {
//                 playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
//             }
//         } else {
//             startAutoPlay();
//             if (playPauseBtn) {
//                 playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
//             }
//         }
//     }
    
//     // Filter handling functions
//     function handleCategoryButtonChange(categoryId) {
//         const budgetSelect = document.querySelector('#budgetSelect');
//         const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
//         showLoading();
        
//         if (categoryId === 'all' && selectedBudget === 'all') {
//             loadProjects();
//         } else if (categoryId !== 'all' && selectedBudget === 'all') {
//             loadProjectsByCategory(categoryId);
//         } else if (categoryId === 'all' && selectedBudget !== 'all') {
//             loadProjectsByBudget(selectedBudget);
//         } else {
//             loadProjectsByCategoryAndBudget(categoryId, selectedBudget);
//         }
//     }
    
//     function handleBudgetChange() {
//         const activeButton = document.querySelector('.category-btn.active');
//         const selectedCategory = activeButton ? activeButton.dataset.category : 'all';
        
//         const budgetSelect = document.querySelector('#budgetSelect');
//         const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
//         showLoading();
        
//         if (selectedCategory === 'all' && selectedBudget === 'all') {
//             loadProjects();
//         } else if (selectedCategory !== 'all' && selectedBudget === 'all') {
//             loadProjectsByCategory(selectedCategory);
//         } else if (selectedCategory === 'all' && selectedBudget !== 'all') {
//             loadProjectsByBudget(selectedBudget);
//         } else {
//             loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
//         }
//     }
    
//     // API functions
//     function loadProjects() {
//         console.log('Loading all projects...'); // Debug
//         ProjectService.listAll(0, 100)
//             .then(function(response) {
//                 if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
//                     const activeProjects = filterActiveProjects(response.data.content);
//                     console.log('Active projects found:', activeProjects.length); // Debug
//                     initializeCarousel(activeProjects);
//                 } else {
//                     console.log('No valid data in response'); // Debug
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects:', error);
//                 displayNoProjects();
//             });
//     }
    
//     function loadProjectsByCategory(categoryId) {
//         ProjectService.projectbycategry(categoryId)
//             .then(function(response) {
//                 if (response && response.status === 200 && response.data) {
//                     let projectsArray = [];
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
                    
//                     if (projectsArray.length > 0) {
//                         const activeProjects = filterActiveProjects(projectsArray);
//                         initializeCarousel(activeProjects);
//                     } else {
//                         displayNoProjects();
//                     }
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects by category:', error);
//                 displayNoProjects();
//             });
//     }
    
//     function loadProjectsByBudget(budget) {
//         ProjectService.projectbybudget(budget)
//             .then(function(response) {
//                 if (response && response.status === 200 && response.data) {
//                     let projectsArray = [];
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
                    
//                     if (projectsArray.length > 0) {
//                         const activeProjects = filterActiveProjects(projectsArray);
//                         initializeCarousel(activeProjects);
//                     } else {
//                         displayNoProjects();
//                     }
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects by budget:', error);
//                 displayNoProjects();
//             });
//     }
    
//     function loadProjectsByCategoryAndBudget(categoryId, budget) {
//         ProjectService.projectbycategry(categoryId)
//             .then(function(response) {
//                 let projectsArray = [];
//                 if (response && response.status === 200 && response.data) {
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
//                 }
                
//                 if (projectsArray.length > 0) {
//                     const filteredProjects = projectsArray.filter(function(project) {
//                         const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
//                         const matchesBudget = project.projectBudget == budget;
//                         return isActive && matchesBudget;
//                     });
//                     initializeCarousel(filteredProjects);
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 displayNoProjects();
//             });
//     }
    
//     function filterActiveProjects(projects) {
//         if (!Array.isArray(projects)) {
//             return [];
//         }
        
//         const activeProjects = projects.filter(function(project) {
//             const isProposed = project.projectStatus === 'Proposed';
//             const isOngoing = project.projectStatus === 'Ongoing';
//             return isProposed || isOngoing;
//         });
        
//         console.log('Filtered active projects:', activeProjects.length, 'from', projects.length); // Debug
//         return activeProjects;
//     }
    
//     function createProjectCard(project) {
//         const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
//         const title = project.projectName || project.projectTitle || 'Untitled Project';
//         const description = project.projectShortDescription || project.projectDescription || 'No description available';
//         const category = getCategoryName(project.categoryId) || 'Uncategorized';
//         const mainImage = project.projectMainImage || 'https://via.placeholder.com/300x200?text=No+Image';
//         const projectId = project.projectId || project.id || 0;
//         const raisedAmount = project.raisedAmount || 0;
//         const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
        
//         const statusDisplay = project.projectStatus || 'Unknown';
//         const statusClass = getStatusClass(project.projectStatus);
        
//         return `
//             <div class="card" data-project-id="${projectId}">
//                 <div class="status-badge ${statusClass}">
//                     ${statusDisplay}
//                 </div>
//                 <div class="placeholder" style="height: 200px; overflow: hidden;">
//                     <img src="${mainImage}" alt="${escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'height: 200px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #6b7280;\\'>No Image Available</div>';">
//                 </div>
//                 <div class="card-content" style="padding: 20px;">
//                     <div class="tag" style="background: #e5f3ff; color: #0066cc; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-block; margin-bottom: 10px;">${escapeHtml(category)}</div>
//                     <h3 class="title" style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 10px 0; line-height: 1.4;">${escapeHtml(title)}</h3>
//                     <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px; line-height: 1.5;">${escapeHtml(description.substring(0, 100))}${description.length > 100 ? '...' : ''}</p>
//                     <div class="cost" style="color: #059669; font-weight: 600; margin-bottom: 15px;">
//                         Funding Required: ${budget}
//                     </div>
//                     ${raisedAmount > 0 ? `
//                         <div class="donate-progress" style="margin-bottom: 15px;">
//                             <div class="progress-info" style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 5px;">
//                                 <span>₹${Number(raisedAmount).toLocaleString('en-IN')} raised</span>
//                                 <span>${progressPercentage}%</span>
//                             </div>
//                             <div class="progress-bar" style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
//                                 <div class="progress-fill" style="height: 100%; background: linear-gradient(90deg, #10b981, #059669); width: ${Math.min(progressPercentage, 100)}%; transition: width 0.3s ease;"></div>
//                             </div>
//                         </div>
//                     ` : ''}
//                     <a class="view-link" href="./donatenow.html?id=${projectId}" style="display: inline-block; background: #0A1E46; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500; text-align: center; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">View Details</a>
//                 </div>
//             </div>
//         `;
//     }
    
//     function getStatusClass(status) {
//         switch(status) {
//             case 'Proposed':
//                 return 'status-proposed';
//             case 'Ongoing':
//                 return 'status-ongoing'; 
//             case 'Completed':
//                 return 'status-completed';
//             case 'On Hold':
//                 return 'status-onhold';
//             default:
//                 return 'status-unknown';
//         }
//     }
    
//     function getCategoryName(categoryId) {
//         const categories = {
//             1: 'Health',
//             2: 'Environment',
//             3: 'Education',
//             4: 'Social',
//             5: 'Infrastructure'
//         };
//         return categories[categoryId] || 'Uncategorized';
//     }
    
//     function escapeHtml(text) {
//         if (typeof text !== 'string') return '';
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }
    
//     function displayNoProjects() {
//         stopAutoPlay();
//         projectList.innerHTML = `
//             <div class="carousel-no-results">
//                 <i class="fas fa-search" style="font-size: 48px; color: #d1d5db; margin-bottom: 20px;"></i>
//                 <h3 style="color: #374151; margin-bottom: 10px;">No Active Projects Found</h3>
               
//                 <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;" onmouseover="this.style.background='#1e40af'" onmouseout="this.style.background='#0A1E46'">Reset Filters</button>
//             </div>
//         `;
//     }
    
//     function showLoading() {
//         stopAutoPlay();
//         projectList.innerHTML = `
//             <div class="carousel-loading">
//                 <div class="loading-spinner"></div>
//                 <p style="color: #6b7280; font-size: 16px;">Loading amazing projects...</p>
//             </div>
//         `;
//     }
    
//     // Global reset function
//     window.resetFilters = function() {
//         const container = document.querySelector('.category-filter-container');
//         if (container) {
//             container.querySelectorAll('.category-btn').forEach(function(btn) {
//                 btn.classList.remove('active');
//                 if (btn.dataset.category === 'all') {
//                     btn.classList.add('active');
//                 }
//             });
            
//             const budgetSelect = container.querySelector('#budgetSelect');
//             if (budgetSelect) {
//                 budgetSelect.value = 'all';
//             }
//         }
        
//         loadProjects();
//     };
    
//     // Cleanup on page unload
//     window.addEventListener('beforeunload', function() {
//         stopAutoPlay();
//     });
    
//     // Enhanced responsive handling
//     function handleResponsiveChanges() {
//         const newSlidesPerView = getSlidesPerView();
//         if (newSlidesPerView !== slidesPerView) {
//             slidesPerView = newSlidesPerView;
            
//             // Recalculate total slides
//             const slides = document.querySelectorAll('.carousel-slide');
//             if (slides.length > 0) {
//                 totalSlides = Math.ceil(slides.length / slidesPerView);
                
//                 // Adjust current slide if necessary
//                 if (currentSlide >= totalSlides) {
//                     currentSlide = Math.max(0, totalSlides - 1);
//                 }
                
//                 updateCarouselPosition();
//                 updateIndicators();
                
//                 // Update slide flex basis
//                 updateSlideWidths();
//             }
//         }
//     }
    
//     function updateSlideWidths() {
//         const slides = document.querySelectorAll('.carousel-slide');
//         const width = (100 / slidesPerView) + '%';
        
//         slides.forEach(function(slide) {
//             slide.style.flex = `0 0 ${width}`;
//         });
//     }
    
//     // Enhanced window resize handler with debouncing
//     let resizeTimeout;
//     window.addEventListener('resize', function() {
//         clearTimeout(resizeTimeout);
//         resizeTimeout = setTimeout(function() {
//             handleResponsiveChanges();
//         }, 250); // Debounce resize events
//     });
    
//     // Touch and swipe handling for mobile
//     let touchStartX = 0;
//     let touchEndX = 0;
//     let isDragging = false;
    
//     function handleTouchStart(e) {
//         touchStartX = e.touches[0].clientX;
//         isDragging = true;
//         stopAutoPlay(); // Pause auto-play during interaction
//     }
    
//     function handleTouchMove(e) {
//         if (!isDragging) return;
//         e.preventDefault(); // Prevent scrolling while swiping
//     }
    
//     function handleTouchEnd(e) {
//         if (!isDragging) return;
        
//         touchEndX = e.changedTouches[0].clientX;
//         const swipeDistance = touchStartX - touchEndX;
//         const minSwipeDistance = 50;
        
//         if (Math.abs(swipeDistance) > minSwipeDistance) {
//             if (swipeDistance > 0) {
//                 nextSlide(); // Swipe left - next slide
//             } else {
//                 previousSlide(); // Swipe right - previous slide
//             }
//         }
        
//         isDragging = false;
//         startAutoPlay(); // Resume auto-play
//     }
    
//     // Add touch event listeners when carousel is created
//     function addTouchSupport() {
//         const carouselWrapper = document.querySelector('.carousel-wrapper');
//         if (carouselWrapper) {
//             carouselWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
//             carouselWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
//             carouselWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
//         }
//     }
    
//     // Keyboard navigation support
//     function handleKeyboardNavigation(e) {
//         const carouselContainer = document.querySelector('.carousel-container');
//         if (!carouselContainer) return;
        
//         // Only handle keyboard if carousel is in focus
//         if (!carouselContainer.contains(document.activeElement)) return;
        
//         switch(e.key) {
//             case 'ArrowLeft':
//                 e.preventDefault();
//                 previousSlide();
//                 break;
//             case 'ArrowRight':
//                 e.preventDefault();
//                 nextSlide();
//                 break;
//             case ' ': // Spacebar
//                 e.preventDefault();
//                 toggleAutoPlay();
//                 break;
//             case 'Home':
//                 e.preventDefault();
//                 goToSlide(0);
//                 break;
//             case 'End':
//                 e.preventDefault();
//                 goToSlide(totalSlides - 1);
//                 break;
//         }
//     }
    
//     // Add keyboard support
//     document.addEventListener('keydown', handleKeyboardNavigation);
    
//     // Enhanced carousel initialization with all features
//     function initializeCarousel(projects) {
//         console.log('Initializing enhanced carousel with projects:', projects.length);
        
//         if (!projects || projects.length === 0) {
//             displayNoProjects();
//             return;
//         }
        
//         totalSlides = Math.ceil(projects.length / slidesPerView);
//         currentSlide = 0;
        
//         const carouselHTML = createCarouselHTML(projects);
//         projectList.innerHTML = carouselHTML;
        
//         // Initialize all features with slight delay to ensure DOM is ready
//         setTimeout(function() {
//             updateSlideWidths();
//             updateCarouselPosition();
//             addCarouselEventListeners();
//             addTouchSupport();
//             startAutoPlay();
//             updateIndicators();
            
//             // Make carousel container focusable for keyboard navigation
//             const carouselContainer = document.querySelector('.carousel-container');
//             if (carouselContainer) {
//                 carouselContainer.setAttribute('tabindex', '0');
//                 carouselContainer.style.outline = 'none';
//             }
//         }, 100);
//     }
    
//     // Enhanced auto-play with pause on hover
//     function startAutoPlay() {
//         stopAutoPlay();
//         if (totalSlides > 1) {
//             autoSlideInterval = setInterval(function() {
//                 nextSlide();
//             }, 4000);
            
//             // Pause on hover
//             const carouselWrapper = document.querySelector('.carousel-wrapper');
//             if (carouselWrapper) {
//                 carouselWrapper.addEventListener('mouseenter', function() {
//                     stopAutoPlay();
//                 });
                
//                 carouselWrapper.addEventListener('mouseleave', function() {
//                     const playPauseBtn = document.getElementById('playPauseBtn');
//                     const isPaused = playPauseBtn && playPauseBtn.innerHTML.includes('fa-play');
                    
//                     if (!isPaused) {
//                         startAutoPlay();
//                     }
//                 });
//             }
//         }
//     }
    
//     // Accessibility improvements
//     function addAccessibilityFeatures() {
//         const carouselContainer = document.querySelector('.carousel-container');
//         if (!carouselContainer) return;
        
//         // Add ARIA labels
//         carouselContainer.setAttribute('role', 'region');
//         carouselContainer.setAttribute('aria-label', 'Project Carousel');
        
//         const track = document.getElementById('carouselTrack');
//         if (track) {
//             track.setAttribute('role', 'list');
//         }
        
//         const slides = document.querySelectorAll('.carousel-slide');
//         slides.forEach(function(slide, index) {
//             slide.setAttribute('role', 'listitem');
//             slide.setAttribute('aria-label', `Project ${index + 1} of ${slides.length}`);
//         });
        
//         const prevBtn = document.getElementById('prevBtn');
//         const nextBtn = document.getElementById('nextBtn');
//         const playPauseBtn = document.getElementById('playPauseBtn');
        
//         if (prevBtn) {
//             prevBtn.setAttribute('aria-label', 'Previous project');
//         }
        
//         if (nextBtn) {
//             nextBtn.setAttribute('aria-label', 'Next project');
//         }
        
//         if (playPauseBtn) {
//             playPauseBtn.setAttribute('aria-label', 'Toggle auto-play');
//         }
        
//         const indicators = document.querySelectorAll('.carousel-indicator');
//         indicators.forEach(function(indicator, index) {
//             indicator.setAttribute('role', 'button');
//             indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
//             indicator.setAttribute('tabindex', '0');
            
//             // Add keyboard support for indicators
//             indicator.addEventListener('keydown', function(e) {
//                 if (e.key === 'Enter' || e.key === ' ') {
//                     e.preventDefault();
//                     goToSlide(index);
//                 }
//             });
//         });
//     }
    
//     // Enhanced carousel HTML creation with accessibility
//     function createCarouselHTML(projects) {
//         let slidesHTML = '';
        
//         projects.forEach(function(project, index) {
//             slidesHTML += `
//                 <div class="carousel-slide" role="listitem" aria-label="Project ${index + 1}">
//                     ${createProjectCard(project)}
//                 </div>
//             `;
//         });
        
//         let indicatorsHTML = '';
//         for (let i = 0; i < totalSlides; i++) {
//             const activeClass = i === 0 ? 'active' : '';
//             indicatorsHTML += `
//                 <div class="carousel-indicator ${activeClass}" 
//                      data-slide="${i}" 
//                      role="button" 
//                      aria-label="Go to slide ${i + 1}"
//                      tabindex="0">
//                 </div>`;
//         }
        
//         return `
//             <div class="carousel-container" role="region" aria-label="Project Carousel" tabindex="0">
//                 <div class="carousel-wrapper">
//                     <button class="carousel-controls carousel-prev" id="prevBtn" aria-label="Previous project">
//                         <i class="fas fa-chevron-left" aria-hidden="true"></i>
//                     </button>
//                     <button class="carousel-controls carousel-next" id="nextBtn" aria-label="Next project">
//                         <i class="fas fa-chevron-right" aria-hidden="true"></i>
//                     </button>
//                     <button class="carousel-play-pause" id="playPauseBtn" aria-label="Toggle auto-play">
//                         <i class="fas fa-pause" aria-hidden="true"></i>
//                     </button>
//                     <div class="carousel-track" id="carouselTrack" role="list">
//                         ${slidesHTML}
//                     </div>
//                 </div>
//                 <div class="carousel-indicators" id="carouselIndicators" role="group" aria-label="Carousel navigation">
//                     ${indicatorsHTML}
//                 </div>
//             </div>
//         `;
//     }
    
//     // Performance optimization: Intersection Observer for lazy loading
//     function initializeLazyLoading() {
//         if ('IntersectionObserver' in window) {
//             const imageObserver = new IntersectionObserver(function(entries, observer) {
//                 entries.forEach(function(entry) {
//                     if (entry.isIntersecting) {
//                         const img = entry.target;
//                         if (img.dataset.src) {
//                             img.src = img.dataset.src;
//                             img.removeAttribute('data-src');
//                             observer.unobserve(img);
//                         }
//                     }
//                 });
//             });
            
//             const images = document.querySelectorAll('img[data-src]');
//             images.forEach(function(img) {
//                 imageObserver.observe(img);
//             });
//         }
//     }
    
//     // Call lazy loading after carousel initialization
//     setTimeout(function() {
//         if (document.querySelector('.carousel-container')) {
//             addAccessibilityFeatures();
//             initializeLazyLoading();
//         }
//     }, 200);
// });

// // Prevent form submission on Enter key
// document.addEventListener('keydown', function(e) {
//     if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
//         e.preventDefault();
//     }
// });