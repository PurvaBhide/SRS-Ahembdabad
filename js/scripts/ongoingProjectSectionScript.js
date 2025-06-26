// Project filtering and display functionality with styled category buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS styles directly to the page
    addCategoryButtonStyles();
    
    const categoryFilter = document.getElementById('categoryFilter');
    const scaleFilter = document.getElementById('scaleFilter');
    const projectList = document.getElementById('projectList');
    
    // Create category buttons container if it doesn't exist
    createCategoryButtons();
    
    // Initialize the page
    loadProjects();
    
    // Event listeners for filters
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilterChange);
    }
    if (scaleFilter) {
        scaleFilter.addEventListener('change', handleFilterChange);
    }
    
    // Add CSS styles for category buttons
    function addCategoryButtonStyles() {
        // Add Font Awesome if not already included
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }
        
        const style = document.createElement('style');
        style.textContent = `
            .category-filter-container {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin: 20px 0;
                padding: 0 20px;
                justify-content: center;
                align-items: center;
            }
            
            .category-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                border: 2px solid #0A1E46;
                border-radius: 25px;
                background: transparent;
                color: #0A1E46;
                font-size: 17px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                white-space: nowrap;
            }
            
            .category-btn:hover {
                border-color: #0A1E46;
                color: #0A1E46;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
            }
            
            .category-btn.active {
                background: #0A1E46;
                border-color: #0A1E46;
                color: white;
            }
            
            .category-btn.active:hover {
                background: #0A1E46;
                border-color: #0A1E46;
                color: white;
            }
            
            .category-btn i {
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 8px;
            }
            
            .budget-select {
                padding: 12px 20px;
                border: 2px solid #0A1E46;
                border-radius: 25px;
                background: transparent;
                color: #0A1E46;
                font-size: 17px;
                font-weight: 500;
                cursor: pointer;
                outline: none;
                min-width: 180px;
            }
            
            .budget-select:focus {
                border-color: #0A1E46;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            @media (max-width: 768px) {
                .category-filter-container {
                    padding: 0 10px;
                    gap: 8px;
                }
                
                .category-btn {
                    padding: 10px 16px;
                    font-size: 13px;
                }
                
                .budget-select {
                    padding: 10px 16px;
                    font-size: 13px;
                    min-width: 150px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create category buttons
    function createCategoryButtons() {
        // Find existing container or create new one
        let container = document.querySelector('.category-filter-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'category-filter-container';
            
            // Insert before project list or after a specific element
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
        
        // Add category buttons
        categories.forEach(function(category) {
            const isActive = category.id === 'all' ? 'active' : '';
            buttonsHTML += `
                <button class="category-btn ${isActive}" data-category="${category.id}">
                    <i class="${category.icon}"></i>
                    ${category.name}
                </button>
            `;
        });
        
        // Add budget select
        buttonsHTML += `
            <select class="budget-select" id="budgetSelect">
                <option value="all"><i class="fas fa-rupee-sign"></i> Select Budget</option>
                <option value="50000">₹50,000</option>
                <option value="100000">₹1,00,000</option>
                <option value="150000">₹1,50,000</option>
                <option value="200000">₹2,00,000</option>
                <option value="250000">₹2,50,000</option>
                <option value="300000">₹3,00,000</option>
                <option value="350000">₹3,50,000</option>
                <option value="400000">₹4,00,000</option>
                <option value="450000">₹4,50,000</option>
                <option value="500000">₹5,00,000</option>
                <option value="700000">₹7,00,000</option>
                <option value="1300000">₹13,00,000</option>
            </select>
        `;
        
        container.innerHTML = buttonsHTML;
        
        // Add event listeners to category buttons
        container.querySelectorAll('.category-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                container.querySelectorAll('.category-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update hidden select if it exists
                const categoryId = this.dataset.category;
                if (categoryFilter) {
                    categoryFilter.value = categoryId === 'all' ? '0' : categoryId;
                }
                
                // Trigger filter change
                handleCategoryButtonChange(categoryId);
            });
        });
        
        // Add event listener to budget select
        const budgetSelect = container.querySelector('#budgetSelect');
        if (budgetSelect) {
            budgetSelect.addEventListener('change', function() {
                if (scaleFilter) {
                    scaleFilter.value = this.value;
                }
                handleBudgetChange();
            });
        }
    }
    
    // Handle budget changes
    function handleBudgetChange() {
        // Get currently active category button
        const activeButton = document.querySelector('.category-btn.active');
        const selectedCategory = activeButton ? activeButton.dataset.category : 'all';
        
        const budgetSelect = document.querySelector('#budgetSelect');
        const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
        // Show loading state
        showLoading();
        
        // Determine which API to call based on selections
        if (selectedCategory === 'all' && selectedBudget === 'all') {
            // No filters selected - load all ongoing projects
            loadProjects();
        } else if (selectedCategory !== 'all' && selectedBudget === 'all') {
            // Only category selected
            loadProjectsByCategory(selectedCategory);
        } else if (selectedCategory === 'all' && selectedBudget !== 'all') {
            // Only budget selected
            loadProjectsByBudget(selectedBudget);
        } else {
            // Both category and budget selected
            loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
        }
    }
    
    // Handle category button changes
    function handleCategoryButtonChange(categoryId) {
        const budgetSelect = document.querySelector('#budgetSelect');
        const selectedBudget = budgetSelect ? budgetSelect.value : 'all';
        
        // Show loading state
        showLoading();
        
        // Determine which API to call based on selections
        if (categoryId === 'all' && selectedBudget === 'all') {
            // No filters selected - load all ongoing projects
            loadProjects();
        } else if (categoryId !== 'all' && selectedBudget === 'all') {
            // Only category selected
            loadProjectsByCategory(categoryId);
        } else if (categoryId === 'all' && selectedBudget !== 'all') {
            // Only budget selected
            loadProjectsByBudget(selectedBudget);
        } else {
            // Both category and budget selected
            loadProjectsByCategoryAndBudget(categoryId, selectedBudget);
        }
    }
    
    // Main function to handle filter changes
    function handleFilterChange() {
        const selectedCategory = categoryFilter ? categoryFilter.value : '0';
        const selectedBudget = scaleFilter ? scaleFilter.value : 'all';
        
        // Update button states
        updateButtonStates(selectedCategory, selectedBudget);
        
        // Show loading state
        showLoading();
        
        // Determine which API to call based on selections
        if (selectedCategory === '0' && selectedBudget === 'all') {
            // No filters selected - load all ongoing projects
            loadProjects();
        } else if (selectedCategory !== '0' && selectedBudget === 'all') {
            // Only category selected
            loadProjectsByCategory(selectedCategory);
        } else if (selectedCategory === '0' && selectedBudget !== 'all') {
            // Only budget selected
            loadProjectsByBudget(selectedBudget);
        } else {
            // Both category and budget selected
            loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
        }
    }
    
    // Update button states based on current filters
    function updateButtonStates(categoryId, budgetValue) {
        const container = document.querySelector('.category-filter-container');
        if (!container) return;
        
        // Update category buttons
        container.querySelectorAll('.category-btn').forEach(function(btn) {
            btn.classList.remove('active');
            const btnCategory = btn.dataset.category;
            if ((categoryId === '0' && btnCategory === 'all') || categoryId === btnCategory) {
                btn.classList.add('active');
            }
        });
        
        // Update budget select
        const budgetSelect = container.querySelector('#budgetSelect');
        if (budgetSelect) {
            budgetSelect.value = budgetValue;
        }
    }
    
    // Load all projects (default)
    function loadProjects() {
       
        ProjectService.listAll(0, 100)
            .then(function(response) {
                  // Handle the specific response structure from your API
                if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
                     const ongoingProjects = filterOngoingProjects(response.data.content);
                      displayProjects(ongoingProjects);
                } else {
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects:', error);
                displayNoProjects();
            });
    }
    
    // Load projects by category
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
                        const ongoingProjects = filterOngoingProjects(projectsArray);
                        displayProjects(ongoingProjects);
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
    
    // Load projects by budget
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
                        const ongoingProjects = filterOngoingProjects(projectsArray);
                        displayProjects(ongoingProjects);
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
    
    // Load projects by both category and budget
    function loadProjectsByCategoryAndBudget(categoryId, budget) {
          
        // Strategy: First filter by category (usually fewer results), then filter by budget locally
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
                
                  
                if (projectsArray.length > 0) {
                    // Filter by budget and ongoing status
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isOngoing = project.projectStatus === 'Ongoing';
                        const matchesBudget = project.projectBudget == budget;
                          return isOngoing && matchesBudget;
                    });
                      displayProjects(filteredProjects);
                } else {
                     displayNoProjects();
                }
            })
            .catch(function(error) {
                   displayNoProjects();
            });
    }
    
    // Filter projects to show only ongoing ones
    function filterOngoingProjects(projects) {
         
        if (!Array.isArray(projects)) {
             return [];
        }
        
        // Log each project's status
        projects.forEach(function(project, index) {
        
        });
        
        const ongoingProjects = projects.filter(function(project) {
            const isOngoing = project.projectStatus === 'Ongoing';
             return isOngoing;
        });
        
       return ongoingProjects;
    }
    
    // Display projects in the UI
    function displayProjects(projects) {
        
        if (!projects || projects.length === 0) {
             displayNoProjects();
            return;
        }
        
        let html = '';
        projects.forEach(function(project, index) {
             const cardHtml = createProjectCard(project);
           html += cardHtml;
        });
        projectList.innerHTML = html;
        }
    
    // Create HTML for a single project card using your CSS classes
    function createProjectCard(project) {
        const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
        const title = project.projectName || project.projectTitle || 'Untitled Project';
        const description = project.projectShortDescription || project.projectDescription || 'No description available';
        const category = getCategoryName(project.categoryId) || 'Uncategorized';
        const mainImage = project.projectMainImage || 'https://via.placeholder.com/300x180?text=No+Image';
        const projectId = project.projectId || project.id || 0;
        const impactPeople = project.impactpeople || 0;
        const raisedAmount = project.raisedAmount || 0;
        const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
          
        return `
            <div class="card" data-project-id="${projectId}" style="position: relative;">
                
                <div class="placeholder">
                    <img src="${mainImage}" alt="${escapeHtml(title)}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-text\\'>No Image Available</div>';">
                </div>
                <div class="card-content">
                    <div class="tag">${escapeHtml(category)}</div>
                    <div class="cost">
                        Funding Required: <span class="cost-amount">${budget}</span>
                    </div>
                    <h3 class="title">${escapeHtml(title)}</h3>
                    ${raisedAmount > 0 ? `
                        <div class="donate-progress">
                            <div class="progress-info">
                                <span class="raised-amount">₹${Number(raisedAmount).toLocaleString('en-IN')} raised</span>
                                <span class="target-amount">of ${budget}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                            </div>
                        </div>
                    ` : ''}
                    <a class="view-link" href="./donatenow.html?id=${projectId}">View Details</a>
                </div>
            </div>
        `;
    }
    
    // Display message when no projects are found
    function displayNoProjects() {
        projectList.innerHTML = `
            <div class="no-results">
                <p>No ongoing projects match your current filter criteria.</p>
                <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: 600;">Reset Filters</button>
            </div>
        `;
    }
    
    // Show loading state
    function showLoading() {
        projectList.innerHTML = `
            <div class="no-results">
                <div style="border: 4px solid #f3f4f6; border-top: 4px solid #0A1E46; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p>Loading projects...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    // Get category name by ID
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
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Global reset function
    window.resetFilters = function() {
        // Reset original selects if they exist
        if (categoryFilter) categoryFilter.value = '0';
        if (scaleFilter) scaleFilter.value = 'all';
        
        // Reset button states
        updateButtonStates('0', 'all');
        
        // Load all projects
        loadProjects();
    };
});

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});