// Project filtering and display functionality with pagination
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const scaleFilter = document.getElementById('scaleFilter');
    const projectList = document.getElementById('projectList');
    
    // Pagination state
    let currentPage = 0;
    let pageSize = 10; // Number of projects per page
    let totalPages = 0;
    let totalElements = 0;
    let currentFilters = {
        category: '0',
        budget: 'all'
    };
    
    // Initialize the page
    loadProjects();
    
    // Event listeners for filters
    categoryFilter.addEventListener('change', handleFilterChange);
    scaleFilter.addEventListener('change', handleFilterChange);
    
    // Main function to handle filter changes
    function handleFilterChange() {
        const selectedCategory = categoryFilter.value;
        const selectedBudget = scaleFilter.value;
        
        // Update current filters
        currentFilters.category = selectedCategory;
        currentFilters.budget = selectedBudget;
        
        // Reset to first page when filters change
        currentPage = 0;
        
        // Reset pagination state
        totalPages = 0;
        totalElements = 0;
        
        // Show loading state
        showLoading();
        
        // Load projects with new filters
        loadProjectsWithFilters();
    }
    
    // Load projects based on current filters and pagination
    function loadProjectsWithFilters() {
        const { category, budget } = currentFilters;
        
        if (category === '0' && budget === 'all') {
            // No filters selected - load all projects with server pagination
            loadProjects();
        } else if (category !== '0' && budget === 'all') {
            // Only category selected - use server pagination with direct API call
            loadProjectsByCategory(category);
        } else if (category === '0' && budget !== 'all') {
            // Only budget selected - use client-side pagination for now
            loadProjectsByBudget(budget);
        } else {
            // Both category and budget selected - use client-side pagination
            loadProjectsByCategoryAndBudget(category, budget);
        }
    }
    
    // Load all projects with pagination
    function loadProjects() {
        console.log(`Loading all projects - Page: ${currentPage}, Size: ${pageSize}`);
        ProjectService.listAll(currentPage, pageSize)
            .then(function(response) {
                console.log('List All API Response:', response);
                handleProjectResponseWithServerPagination(response);
            })
            .catch(function(error) {
                console.error('Error loading projects:', error);
                displayNoProjects();
            });
    }
    
    // Load projects by category with pagination support using enhanced service call
    function loadProjectsByCategory(categoryId) {
        console.log(`Loading projects by category ${categoryId} - Page: ${currentPage}, Size: ${pageSize}`);
        
        // Create a custom API call with pagination parameters since ProjectService doesn't support them
        const customCategoryCall = {
            path: `/projectshowbycategoryid/${categoryId}?page=${currentPage}&size=${pageSize}`,
            method: "GET"
        };
        
        api.request(customCategoryCall)
            .then(function(response) {
                console.log('Category API Response:', response);
                handleProjectResponseWithServerPagination(response);
            })
            .catch(function(error) {
                console.error('Error loading projects by category:', error);
                displayNoProjects();
            });
    }
    
    // Load projects by budget with client-side pagination
    function loadProjectsByBudget(budget) {
        console.log(`Loading projects by budget ${budget} - Page: ${currentPage}, Size: ${pageSize}`);
        
        // Get all projects and filter by budget on client side
        ProjectService.listAll(0, 1000) // Get more data to ensure we have all results
            .then(function(response) {
                console.log('Budget API Response:', response);
                
                let projectsArray = [];
                if (response && response.status === 200) {
                    if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                    }
                }
                
                if (projectsArray.length > 0) {
                    // Filter by budget (less than or equal to selected budget) and active status
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
                        const matchesBudget = project.projectBudget <= parseInt(budget);
                        return isActive && matchesBudget;
                    });
                    
                    // Use client-side pagination for budget filtered results
                    handleClientSidePagination(filteredProjects);
                } else {
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects by budget:', error);
                displayNoProjects();
            });
    }
    
    // Load projects by both category and budget using enhanced API call
    function loadProjectsByCategoryAndBudget(categoryId, budget) {
        console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
        
        // Use custom API call to get all category data, then filter by budget
        const customCategoryCall = {
            path: `/projectshowbycategoryid/${categoryId}?page=0&size=1000`, // Get more data to ensure we have all results
            method: "GET"
        };
        
        api.request(customCategoryCall)
            .then(function(response) {
                console.log('Category API Response for combined filter:', response);
                
                let projectsArray = [];
                if (response && response.status === 200 && response.data) {
                    if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    }
                }
                
                if (projectsArray.length > 0) {
                    // Filter by budget (less than or equal to selected budget) and active status
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
                        const matchesBudget = project.projectBudget <= parseInt(budget);
                        return isActive && matchesBudget;
                    });
                    
                    // Use client-side pagination for combined filtered results
                    handleClientSidePagination(filteredProjects);
                } else {
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects with combined filters:', error);
                displayNoProjects();
            });
    }
    
    // Handle server-side paginated responses
    function handleProjectResponseWithServerPagination(response) {
        if (response && response.status === 200) {
            let projectsArray = [];
            
            // Handle different response structures
            if (Array.isArray(response.data)) {
                // Direct array response (like category API)
                projectsArray = response.data;
            } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                // Paginated response with content array (like listAll API)
                projectsArray = response.data.content;
            }
            
            // Extract pagination info from API response
            if (response.totalPages !== undefined) {
                // Category API format: response.totalPages, response.currentPage, response.totalItems
                totalPages = response.totalPages;
                totalElements = response.totalItems || response.totalElements || projectsArray.length;
                currentPage = response.currentPage || 0;
            } else if (response.data && response.data.totalPages !== undefined) {
                // listAll API format: response.data.totalPages, response.data.number, response.data.totalElements
                totalPages = response.data.totalPages || 1;
                totalElements = response.data.totalElements || projectsArray.length;
                currentPage = response.data.number || 0;
            } else {
                // Fallback to client-side pagination if no server pagination info
                handleClientSidePagination(projectsArray);
                return;
            }
            
            // Filter active projects and display
            const activeProjects = filterActiveProjects(projectsArray);
            displayProjects(activeProjects);
            updatePaginationControls();
        } else {
            displayNoProjects();
        }
    }
    
    // Handle client-side pagination when API doesn't support it
    function handleClientSidePagination(allProjects) {
        const activeProjects = filterActiveProjects(allProjects);
        
        // Calculate pagination info
        totalElements = activeProjects.length;
        totalPages = Math.ceil(totalElements / pageSize);
        
        // Ensure currentPage is within bounds
        if (currentPage >= totalPages) {
            currentPage = Math.max(0, totalPages - 1);
        }
        
        // Get projects for current page
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const pageProjects = activeProjects.slice(startIndex, endIndex);
        
        displayProjects(pageProjects);
        updatePaginationControls();
    }
    
    // Filter projects to show only active ones (Proposed + Ongoing)
    function filterActiveProjects(projects) {
        if (!Array.isArray(projects)) {
            return [];
        }
        
        return projects.filter(function(project) {
            return project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
        });
    }
    
    // Display projects in the UI
    function displayProjects(projects) {
        if (!projects || projects.length === 0) {
            displayNoProjects();
            return;
        }
        
        let html = '';
        projects.forEach(function(project) {
            html += createProjectCard(project);
        });
        
        projectList.innerHTML = html;
    }
    
    // Create pagination controls
    function updatePaginationControls() {
        // Remove existing pagination if any
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        // Don't show pagination if there's only one page or no results
        if (totalPages <= 1) {
            return;
        }
        
        const paginationHtml = createPaginationHTML();
        
        // Insert pagination after the project list
        const projectSection = projectList.parentElement;
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        paginationContainer.innerHTML = paginationHtml;
        projectSection.appendChild(paginationContainer);
        
        // Add event listeners to pagination buttons
        addPaginationEventListeners();
    }
    
    // Create pagination HTML
    function createPaginationHTML() {
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        
        // Adjust start page if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }
        
        const startItem = Math.min(currentPage * pageSize + 1, totalElements);
        const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
        
        let paginationHTML = `
            <div class="projectpagination">
                <div class="pagination-info">
                    Showing ${startItem} to ${endItem} of ${totalElements} projects
                </div>
                <div class="pagination-controls">
        `;
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${currentPage === 0 ? 'disabled' : ''}" 
                    data-page="${currentPage - 1}" 
                    ${currentPage === 0 ? 'disabled' : ''}>
                <span>‹</span> Previous
            </button>
        `;
        
        // Page numbers
        if (startPage > 0) {
            paginationHTML += `<button class="pagination-btn" data-page="0">1</button>`;
            if (startPage > 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i + 1}
                </button>
            `;
        }
        
        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" data-page="${totalPages - 1}">${totalPages}</button>`;
        }
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}" 
                    data-page="${currentPage + 1}" 
                    ${currentPage === totalPages - 1 ? 'disabled' : ''}>
                Next <span>›</span>
            </button>
        `;
        
        paginationHTML += `
                </div>
            </div>
        `;
        
        return paginationHTML;
    }
    
    // Add event listeners to pagination buttons
    function addPaginationEventListeners() {
        const paginationBtns = document.querySelectorAll('.pagination-btn:not(.disabled)');
        paginationBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const page = parseInt(this.getAttribute('data-page'));
                if (page !== currentPage && page >= 0 && page < totalPages) {
                    currentPage = page;
                    showLoading();
                    loadProjectsWithFilters();
                }
            });
        });
    }
    
    // Create HTML for a single project card
    function createProjectCard(project) {
        const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
        const title = project.projectName || project.projectTitle || 'Untitled Project';
        const description = project.projectShortDescription || project.projectDescription || 'No description available';
        const category = getCategoryName(project.categoryId) || 'Uncategorized';
        const mainImage = project.projectMainImage || 'https://via.placeholder.com/400x240/f1f5f9/64748b?text=No+Image';
        const projectId = project.projectId || project.id || 0;
        const impactPeople = project.impactpeople || 0;
        const raisedAmount = project.raisedAmount || 0;
        const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
        
        const statusDisplay = project.projectStatus || 'Unknown';
        const statusClass = getStatusClass(project.projectStatus);
        
        return `
            <div class="card" data-project-id="${projectId}">
                <div class="status ${statusClass}">
                    ${statusDisplay}
                </div>
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
    
    // Get appropriate CSS class for status
    function getStatusClass(status) {
        switch(status) {
            case 'Proposed': return 'proposed-status';
            case 'Ongoing': return 'ongoing-status'; 
            case 'Completed': return 'completed-status';
            case 'On Hold': return 'onhold-status';
            default: return 'unknown-status';
        }
    }
    
    // Display message when no projects are found
    function displayNoProjects() {
        projectList.innerHTML = `
            <div class="no-results">
                <p>No active projects (Proposed or Ongoing) match your current filter criteria.</p>
                <button onclick="resetFilters()">Reset Filters</button>
            </div>
        `;
        
        // Remove pagination when no results
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
    }
    
    // Show loading state
    function showLoading() {
        projectList.innerHTML = `
            <div class="no-results">
                <div style="border: 4px solid #f1f5f9; border-top: 4px solid #0A1E46; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 0 auto 25px;"></div>
                <p>Loading projects...</p>
            </div>
        `;
        
        // Remove pagination during loading
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
    }
    
    // Get category name by ID
    function getCategoryName(categoryId) {
        const categories = {
            1: 'Health',
            2: 'Environment', 
            3: 'Education',
            4: 'Infrastructure',
            5: 'Social'
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
        categoryFilter.value = '0';
        scaleFilter.value = 'all';
        currentFilters = { category: '0', budget: 'all' };
        currentPage = 0;
        totalPages = 0;
        totalElements = 0;
        loadProjects();
    };
    
    // Expose pagination controls for external use
    window.goToPage = function(page) {
        if (page >= 0 && page < totalPages) {
            currentPage = page;
            showLoading();
            loadProjectsWithFilters();
        }
    };
});

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Add CSS for spinning loader animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);


























// // Project filtering and display functionality with pagination
// document.addEventListener('DOMContentLoaded', function() {
//     const categoryFilter = document.getElementById('categoryFilter');
//     const scaleFilter = document.getElementById('scaleFilter');
//     const projectList = document.getElementById('projectList');
    
//     // Pagination state
//     let currentPage = 0;
//     let pageSize = 10; // Number of projects per page
//     let totalPages = 0;
//     let totalElements = 0;
//     let currentFilters = {
//         category: '0',
//         budget: 'all'
//     };
    
//     // Initialize the page
//     loadProjects();
    
//     // Event listeners for filters
//     categoryFilter.addEventListener('change', handleFilterChange);
//     scaleFilter.addEventListener('change', handleFilterChange);
    
//     // Main function to handle filter changes
//     function handleFilterChange() {
//         const selectedCategory = categoryFilter.value;
//         const selectedBudget = scaleFilter.value;
        
//         // Update current filters
//         currentFilters.category = selectedCategory;
//         currentFilters.budget = selectedBudget;
        
//         // Reset to first page when filters change
//         currentPage = 0;
        
//         // Reset pagination state
//         totalPages = 0;
//         totalElements = 0;
        
//         // Show loading state
//         showLoading();
        
//         // Load projects with new filters
//         loadProjectsWithFilters();
//     }
    
//     // Load projects based on current filters and pagination
//     function loadProjectsWithFilters() {
//         const { category, budget } = currentFilters;
        
//         if (category === '0' && budget === 'all') {
//             // No filters selected - load all projects with server pagination
//             loadProjects();
//         } else if (category !== '0' && budget === 'all') {
//             // Only category selected - use server pagination with direct API call
//             loadProjectsByCategory(category);
//         } else if (category === '0' && budget !== 'all') {
//             // Only budget selected - use client-side pagination for now
//             loadProjectsByBudget(budget);
//         } else {
//             // Both category and budget selected - use client-side pagination
//             loadProjectsByCategoryAndBudget(category, budget);
//         }
//     }
    
//     // Load all projects with pagination
//     function loadProjects() {
//         console.log(`Loading all projects - Page: ${currentPage}, Size: ${pageSize}`);
//         ProjectService.listAll(currentPage, pageSize)
//             .then(function(response) {
//                 console.log('List All API Response:', response);
//                 handleProjectResponseWithServerPagination(response);
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Load projects by category with pagination support using enhanced service call
//     function loadProjectsByCategory(categoryId) {
//         console.log(`Loading projects by category ${categoryId} - Page: ${currentPage}, Size: ${pageSize}`);
        
//         // Create a custom API call with pagination parameters since ProjectService doesn't support them
//         const customCategoryCall = {
//             path: `/projectshowbycategoryid/${categoryId}?page=${currentPage}&size=${pageSize}`,
//             method: "GET"
//         };
        
//         api.request(customCategoryCall)
//             .then(function(response) {
//                 console.log('Category API Response:', response);
//                 handleProjectResponseWithServerPagination(response);
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects by category:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Load projects by budget with client-side pagination
//     function loadProjectsByBudget(budget) {
//         console.log(`Loading projects by budget ${budget} - Page: ${currentPage}, Size: ${pageSize}`);
        
//         // Use existing service call and handle client-side pagination
//         ProjectService.projectbybudget(budget)
//             .then(function(response) {
//                 console.log('Budget API Response:', response);
                
//                 let projectsArray = [];
//                 if (response && response.status === 200 && response.data) {
//                     if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
//                 }
                
//                 // Use client-side pagination for budget filtered results
//                 handleClientSidePagination(projectsArray);
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects by budget:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Load projects by both category and budget using enhanced API call
//     function loadProjectsByCategoryAndBudget(categoryId, budget) {
//         console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
        
//         // Use custom API call to get all category data, then filter by budget
//         const customCategoryCall = {
//             path: `/projectshowbycategoryid/${categoryId}?page=0&size=1000`, // Get more data to ensure we have all results
//             method: "GET"
//         };
        
//         api.request(customCategoryCall)
//             .then(function(response) {
//                 console.log('Category API Response for combined filter:', response);
                
//                 let projectsArray = [];
//                 if (response && response.status === 200 && response.data) {
//                     if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
//                 }
                
//                 if (projectsArray.length > 0) {
//                     // Filter by budget and active status
//                     const filteredProjects = projectsArray.filter(function(project) {
//                         const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
//                         const matchesBudget = project.projectBudget == budget;
//                         return isActive && matchesBudget;
//                     });
                    
//                     // Use client-side pagination for combined filtered results
//                     handleClientSidePagination(filteredProjects);
//                 } else {
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects with combined filters:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Handle server-side paginated responses
//     function handleProjectResponseWithServerPagination(response) {
//         if (response && response.status === 200) {
//             let projectsArray = [];
            
//             // Handle different response structures
//             if (Array.isArray(response.data)) {
//                 // Direct array response (like category API)
//                 projectsArray = response.data;
//             } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
//                 // Paginated response with content array (like listAll API)
//                 projectsArray = response.data.content;
//             }
            
//             // Extract pagination info from API response
//             if (response.totalPages !== undefined) {
//                 // Category API format: response.totalPages, response.currentPage, response.totalItems
//                 totalPages = response.totalPages;
//                 totalElements = response.totalItems || response.totalElements || projectsArray.length;
//                 currentPage = response.currentPage || 0;
//             } else if (response.data && response.data.totalPages !== undefined) {
//                 // listAll API format: response.data.totalPages, response.data.number, response.data.totalElements
//                 totalPages = response.data.totalPages || 1;
//                 totalElements = response.data.totalElements || projectsArray.length;
//                 currentPage = response.data.number || 0;
//             } else {
//                 // Fallback to client-side pagination if no server pagination info
//                 handleClientSidePagination(projectsArray);
//                 return;
//             }
            
//             // Filter active projects and display
//             const activeProjects = filterActiveProjects(projectsArray);
//             displayProjects(activeProjects);
//             updatePaginationControls();
//         } else {
//             displayNoProjects();
//         }
//     }
    
//     // Handle client-side pagination when API doesn't support it
//     function handleClientSidePagination(allProjects) {
//         const activeProjects = filterActiveProjects(allProjects);
        
//         // Calculate pagination info
//         totalElements = activeProjects.length;
//         totalPages = Math.ceil(totalElements / pageSize);
        
//         // Ensure currentPage is within bounds
//         if (currentPage >= totalPages) {
//             currentPage = Math.max(0, totalPages - 1);
//         }
        
//         // Get projects for current page
//         const startIndex = currentPage * pageSize;
//         const endIndex = startIndex + pageSize;
//         const pageProjects = activeProjects.slice(startIndex, endIndex);
        
//         displayProjects(pageProjects);
//         updatePaginationControls();
//     }
    
//     // Filter projects to show only active ones (Proposed + Ongoing)
//     function filterActiveProjects(projects) {
//         if (!Array.isArray(projects)) {
//             return [];
//         }
        
//         return projects.filter(function(project) {
//             return project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
//         });
//     }
    
//     // Display projects in the UI
//     function displayProjects(projects) {
//         if (!projects || projects.length === 0) {
//             displayNoProjects();
//             return;
//         }
        
//         let html = '';
//         projects.forEach(function(project) {
//             html += createProjectCard(project);
//         });
        
//         projectList.innerHTML = html;
//     }
    
//     // Create pagination controls
//     function updatePaginationControls() {
//         // Remove existing pagination if any
//         const existingPagination = document.querySelector('.pagination-container');
//         if (existingPagination) {
//             existingPagination.remove();
//         }
        
//         // Don't show pagination if there's only one page or no results
//         if (totalPages <= 1) {
//             return;
//         }
        
//         const paginationHtml = createPaginationHTML();
        
//         // Insert pagination after the project list
//         const projectSection = projectList.parentElement;
//         const paginationContainer = document.createElement('div');
//         paginationContainer.className = 'pagination-container';
//         paginationContainer.innerHTML = paginationHtml;
//         projectSection.appendChild(paginationContainer);
        
//         // Add event listeners to pagination buttons
//         addPaginationEventListeners();
//     }
    
//     // Create pagination HTML
//     function createPaginationHTML() {
//         const maxVisiblePages = 5;
//         let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
//         let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        
//         // Adjust start page if we're near the end
//         if (endPage - startPage < maxVisiblePages - 1) {
//             startPage = Math.max(0, endPage - maxVisiblePages + 1);
//         }
        
//         const startItem = Math.min(currentPage * pageSize + 1, totalElements);
//         const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
        
//         let paginationHTML = `
//             <div class="projectpagination">
//                 <div class="pagination-info">
//                     Showing ${startItem} to ${endItem} of ${totalElements} projects
//                 </div>
//                 <div class="pagination-controls">
//         `;
        
//         // Previous button
//         paginationHTML += `
//             <button class="pagination-btn ${currentPage === 0 ? 'disabled' : ''}" 
//                     data-page="${currentPage - 1}" 
//                     ${currentPage === 0 ? 'disabled' : ''}>
//                 <span>‹</span> Previous
//             </button>
//         `;
        
//         // Page numbers
//         if (startPage > 0) {
//             paginationHTML += `<button class="pagination-btn" data-page="0">1</button>`;
//             if (startPage > 1) {
//                 paginationHTML += `<span class="pagination-ellipsis">...</span>`;
//             }
//         }
        
//         for (let i = startPage; i <= endPage; i++) {
//             paginationHTML += `
//                 <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
//                         data-page="${i}">
//                     ${i + 1}
//                 </button>
//             `;
//         }
        
//         if (endPage < totalPages - 1) {
//             if (endPage < totalPages - 2) {
//                 paginationHTML += `<span class="pagination-ellipsis">...</span>`;
//             }
//             paginationHTML += `<button class="pagination-btn" data-page="${totalPages - 1}">${totalPages}</button>`;
//         }
        
//         // Next button
//         paginationHTML += `
//             <button class="pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}" 
//                     data-page="${currentPage + 1}" 
//                     ${currentPage === totalPages - 1 ? 'disabled' : ''}>
//                 Next <span>›</span>
//             </button>
//         `;
        
//         paginationHTML += `
//                 </div>
//             </div>
//         `;
        
//         return paginationHTML;
//     }
    
//     // Add event listeners to pagination buttons
//     function addPaginationEventListeners() {
//         const paginationBtns = document.querySelectorAll('.pagination-btn:not(.disabled)');
//         paginationBtns.forEach(btn => {
//             btn.addEventListener('click', function() {
//                 const page = parseInt(this.getAttribute('data-page'));
//                 if (page !== currentPage && page >= 0 && page < totalPages) {
//                     currentPage = page;
//                     showLoading();
//                     loadProjectsWithFilters();
//                 }
//             });
//         });
//     }
    
//     // Create HTML for a single project card
//     function createProjectCard(project) {
//         const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
//         const title = project.projectName || project.projectTitle || 'Untitled Project';
//         const description = project.projectShortDescription || project.projectDescription || 'No description available';
//         const category = getCategoryName(project.categoryId) || 'Uncategorized';
//         const mainImage = project.projectMainImage || 'https://via.placeholder.com/400x240/f1f5f9/64748b?text=No+Image';
//         const projectId = project.projectId || project.id || 0;
//         const impactPeople = project.impactpeople || 0;
//         const raisedAmount = project.raisedAmount || 0;
//         const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
        
//         const statusDisplay = project.projectStatus || 'Unknown';
//         const statusClass = getStatusClass(project.projectStatus);
        
//         return `
//             <div class="card" data-project-id="${projectId}">
//                 <div class="status ${statusClass}">
//                     ${statusDisplay}
//                 </div>
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
    
//     // Get appropriate CSS class for status
//     function getStatusClass(status) {
//         switch(status) {
//             case 'Proposed': return 'proposed-status';
//             case 'Ongoing': return 'ongoing-status'; 
//             case 'Completed': return 'completed-status';
//             case 'On Hold': return 'onhold-status';
//             default: return 'unknown-status';
//         }
//     }
    
//     // Display message when no projects are found
//     function displayNoProjects() {
//         projectList.innerHTML = `
//             <div class="no-results">
//                 <p>No active projects (Proposed or Ongoing) match your current filter criteria.</p>
//                 <button onclick="resetFilters()">Reset Filters</button>
//             </div>
//         `;
        
//         // Remove pagination when no results
//         const existingPagination = document.querySelector('.pagination-container');
//         if (existingPagination) {
//             existingPagination.remove();
//         }
//     }
    
//     // Show loading state
//     function showLoading() {
//         projectList.innerHTML = `
//             <div class="no-results">
//                 <div style="border: 4px solid #f1f5f9; border-top: 4px solid #0A1E46; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 0 auto 25px;"></div>
//                 <p>Loading projects...</p>
//             </div>
//         `;
        
//         // Remove pagination during loading
//         const existingPagination = document.querySelector('.pagination-container');
//         if (existingPagination) {
//             existingPagination.remove();
//         }
//     }
    
//     // Get category name by ID
//     function getCategoryName(categoryId) {
//         const categories = {
//             1: 'Health',
//             2: 'Environment', 
//             3: 'Education',
//             4: 'Infrastructure',
//             5: 'Social'
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
//         categoryFilter.value = '0';
//         scaleFilter.value = 'all';
//         currentFilters = { category: '0', budget: 'all' };
//         currentPage = 0;
//         totalPages = 0;
//         totalElements = 0;
//         loadProjects();
//     };
    
//     // Expose pagination controls for external use
//     window.goToPage = function(page) {
//         if (page >= 0 && page < totalPages) {
//             currentPage = page;
//             showLoading();
//             loadProjectsWithFilters();
//         }
//     };
// });

// // Prevent form submission on Enter key
// document.addEventListener('keydown', function(e) {
//     if (e.key === 'Enter') {
//         e.preventDefault();
//     }
// });

// // Add CSS for spinning loader animation
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes spin {
//         0% { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//     }
// `;
// document.head.appendChild(style);


