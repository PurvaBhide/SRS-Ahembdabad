// Project filtering and display functionality with pagination and budget ranges
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
    
    // Helper function to reset pagination state completely
    function resetPaginationState() {
        currentPage = 0;
        totalPages = 0;
        totalElements = 0;
        
        // Remove existing pagination and filter summary
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        const existingSummary = document.querySelector('.filter-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
    }
    
    // Helper function to parse budget range
    function parseBudgetRange(rangeString) {
        if (!rangeString || rangeString === 'all') {
            return { min: 0, max: Number.MAX_VALUE };
        }

        const parts = rangeString.split('-');
        if (parts.length !== 2) {
            return { min: 0, max: Number.MAX_VALUE };
        }

        const min = parseInt(parts[0]) || 0;
        const max = parseInt(parts[1]) || Number.MAX_VALUE;

        return { min, max };
    }

    // Helper function to check if project budget falls within range
    function isProjectInBudgetRange(projectBudget, budgetRange) {
        const budget = parseInt(projectBudget) || 0;
        const range = parseBudgetRange(budgetRange);
        return budget >= range.min && budget <= range.max;
    }

    // Helper function to format budget range for display
    function formatBudgetRange(rangeString) {
        if (!rangeString || rangeString === 'all') {
            return 'All Budgets';
        }
        
        const parts = rangeString.split('-');
        if (parts.length !== 2) {
            return rangeString;
        }
        
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);
        
        const formatAmount = (amount) => {
            if (amount >= 10000000) {
                return '₹' + (amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1) + ' Crore';
            } else if (amount >= 100000) {
                return '₹' + (amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1) + ' Lakh';
            } else if (amount >= 1000) {
                return '₹' + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'K';
            } else {
                return '₹' + amount.toLocaleString('en-IN');
            }
        };
        
        return `${formatAmount(min)} - ${formatAmount(max)}`;
    }
    
    // Main function to handle filter changes
    function handleFilterChange() {
        const selectedCategory = categoryFilter.value;
        const selectedBudget = scaleFilter.value;
        
        console.log('Filter changed:', {
            category: selectedCategory,
            budget: selectedBudget,
            previousFilters: currentFilters
        });
        
        // Update current filters
        currentFilters.category = selectedCategory;
        currentFilters.budget = selectedBudget;
        
        // Reset pagination state completely
        resetPaginationState();
        
        // Show loading state
        showLoading();
        
        // Load projects with new filters
        loadProjectsWithFilters();
    }
    
    // Load projects based on current filters and pagination
    function loadProjectsWithFilters() {
        const { category, budget } = currentFilters;
        
        console.log('Loading projects with filters:', { category, budget, currentPage, pageSize });
        
        if (category === '0' && budget === 'all') {
            // No filters selected - load all projects with server pagination
            console.log('Loading all projects (no filters applied)');
            loadProjects();
        } else if (category !== '0' && budget === 'all') {
            // Only category selected - use server pagination with direct API call
            console.log('Loading projects by category only:', category);
            loadProjectsByCategory(category);
        } else if (category === '0' && budget !== 'all') {
            // Only budget range selected - use client-side pagination
            console.log('Loading projects by budget range only:', budget);
            loadProjectsByBudgetRange(budget);
        } else {
            // Both category and budget range selected - use client-side pagination
            console.log('Loading projects by both category and budget range:', category, budget);
            loadProjectsByCategoryAndBudgetRange(category, budget);
        }
    }
    
    // Load all projects with pagination
    function loadProjects() {
        console.log(`Loading all projects - Page: ${currentPage}, Size: ${pageSize}`);
        
        ProjectService.listAll(currentPage, pageSize)
            .then(function(response) {
                console.log('List All API Response:', response);
                console.log('API Response structure:', {
                    status: response ? response.status : 'no response',
                    dataType: response && response.data ? (Array.isArray(response.data) ? 'array' : typeof response.data) : 'no data',
                    hasContent: response && response.data && response.data.content ? 'yes' : 'no',
                    totalElements: response && response.data ? response.data.totalElements : 'none'
                });
                
                if (response && response.status === 200) {
                    handleProjectResponseWithServerPagination(response);
                } else {
                    console.error('Invalid response structure:', response);
                    displayNoProjects();
                }
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
    
    // Load projects by budget range with client-side pagination
    function loadProjectsByBudgetRange(budgetRange) {
        console.log(`Loading projects by budget range ${budgetRange} - Page: ${currentPage}, Size: ${pageSize}`);
        
        // Get all projects and filter by budget range on client side
        ProjectService.listAll(0, 1000) // Get more data to ensure we have all results
            .then(function(response) {
                console.log('Budget Range API Response:', response);
                
                let projectsArray = [];
                if (response && response.status === 200) {
                    if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                    }
                }
                
                if (projectsArray.length > 0) {
                    // Filter by budget range and active status
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isActive = isProjectActive(project);
                        const matchesBudgetRange = isProjectInBudgetRange(project.projectBudget, budgetRange);
                        
                        console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Active: ${isActive}, Budget Range Match: ${matchesBudgetRange}`);
                        
                        return isActive && matchesBudgetRange;
                    });
                    
                    console.log(`Filtered ${filteredProjects.length} projects for budget range ${budgetRange}`);
                    
                    // Use client-side pagination for budget filtered results
                    handleClientSidePagination(filteredProjects);
                } else {
                    displayNoProjects();
                }
            })
            .catch(function(error) {
                console.error('Error loading projects by budget range:', error);
                displayNoProjects();
            });
    }
    
    // Load projects by both category and budget range using enhanced API call
    function loadProjectsByCategoryAndBudgetRange(categoryId, budgetRange) {
        console.log('Loading projects with both filters - Category:', categoryId, 'Budget Range:', budgetRange);
        
        // Use custom API call to get all category data, then filter by budget range
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
                    // Filter by budget range and active status
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isActive = isProjectActive(project);
                        const matchesBudgetRange = isProjectInBudgetRange(project.projectBudget, budgetRange);
                        
                        console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Active: ${isActive}, Budget Range Match: ${matchesBudgetRange}`);
                        
                        return isActive && matchesBudgetRange;
                    });
                    
                    console.log(`Filtered ${filteredProjects.length} projects for category ${categoryId} and budget range ${budgetRange}`);
                    
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
        console.log('Handling server pagination response:', response);
        
        if (response && response.status === 200) {
            let projectsArray = [];
            
            // Handle different response structures
            if (Array.isArray(response.data)) {
                // Direct array response (like category API)
                projectsArray = response.data;
                console.log('Response is direct array, length:', projectsArray.length);
            } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                // Paginated response with content array (like listAll API)
                projectsArray = response.data.content;
                console.log('Response has content array, length:', projectsArray.length);
            } else {
                console.error('Unexpected response structure:', response);
            }
            
            // DEBUG: Analyze project statuses
            analyzeProjectStatuses(projectsArray);
            
            // Extract pagination info from API response
            if (response.totalPages !== undefined) {
                // Category API format: response.totalPages, response.currentPage, response.totalItems
                totalPages = response.totalPages;
                totalElements = response.totalItems || response.totalElements || projectsArray.length;
                currentPage = response.currentPage || 0;
                console.log('Using category API pagination format');
            } else if (response.data && response.data.totalPages !== undefined) {
                // listAll API format: response.data.totalPages, response.data.number, response.data.totalElements
                totalPages = response.data.totalPages || 1;
                totalElements = response.data.totalElements || projectsArray.length;
                currentPage = response.data.number || 0;
                console.log('Using listAll API pagination format');
            } else {
                // Fallback to client-side pagination if no server pagination info
                console.log('No server pagination info, using client-side pagination');
                handleClientSidePagination(projectsArray);
                return;
            }
            
            console.log('Pagination info:', { totalPages, totalElements, currentPage });
            
            // Filter active projects and display
            const activeProjects = filterActiveProjects(projectsArray);
            console.log('Active projects count:', activeProjects.length);
            
            displayProjects(activeProjects);
            updatePaginationControls();
        } else {
            console.error('Invalid response or status:', response);
            displayNoProjects();
        }
    }
    
    // Handle client-side pagination when API doesn't support it
    function handleClientSidePagination(allProjects) {
        console.log('Handling client-side pagination for', allProjects.length, 'projects');
        
        const activeProjects = filterActiveProjects(allProjects);
        
        // Calculate pagination info
        totalElements = activeProjects.length;
        totalPages = Math.ceil(totalElements / pageSize);
        
        // Ensure currentPage is within bounds
        if (currentPage >= totalPages) {
            currentPage = Math.max(0, totalPages - 1);
        }
        
        console.log('Client pagination info:', { totalPages, totalElements, currentPage });
        
        // Get projects for current page
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const pageProjects = activeProjects.slice(startIndex, endIndex);
        
        console.log('Displaying projects from index', startIndex, 'to', endIndex);
        
        displayProjects(pageProjects);
        updatePaginationControls();
    }
    
    // Enhanced function to check if project is active with debugging
    function isProjectActive(project) {
        const status = project.projectStatus;
        
        // Multiple possible active statuses with case insensitive matching
        const activeStatuses = [
            'Proposed', 'proposed', 'PROPOSED',
            'Ongoing', 'ongoing', 'ONGOING',
            'Active', 'active', 'ACTIVE',
            'Open', 'open', 'OPEN',
            'Available', 'available', 'AVAILABLE',
            'In Progress', 'in progress', 'IN PROGRESS',
            'Pending', 'pending', 'PENDING',
            'Approved', 'approved', 'APPROVED',
            'Live', 'live', 'LIVE',
            'Running', 'running', 'RUNNING'
        ];
        
        const isActive = activeStatuses.includes(status);
        
        // If no explicit status filtering needed, show all projects
        // Uncomment the next line to show ALL projects regardless of status:
        // return true;
        
        return isActive;
    }
    
    // Filter projects to show only active ones with enhanced debugging
    function filterActiveProjects(projects) {
        if (!Array.isArray(projects)) {
            console.error('Projects is not an array:', projects);
            return [];
        }
        
        // DEBUG: Log all project statuses to see what we're working with
        console.log('=== PROJECT STATUS DEBUGGING ===');
        projects.forEach((project, index) => {
            console.log(`Project ${index + 1}:`, {
                name: project.projectName || 'Unnamed',
                status: project.projectStatus,
                statusType: typeof project.projectStatus,
                statusLength: project.projectStatus ? project.projectStatus.length : 'null/undefined',
                isActive: isProjectActive(project)
            });
        });
        
        // Get unique statuses
        const uniqueStatuses = [...new Set(projects.map(p => p.projectStatus))];
        console.log('Unique statuses found:', uniqueStatuses);
        
        const activeProjects = projects.filter(function(project) {
            return isProjectActive(project);
        });
        
        console.log('Filtered active projects:', activeProjects.length, 'out of', projects.length);
        console.log('=== END PROJECT STATUS DEBUGGING ===');
        
        // EMERGENCY FIX: If no projects pass the filter, show all projects
        if (activeProjects.length === 0 && projects.length > 0) {
            console.warn('No projects found with expected status - showing all projects');
            return projects; // Show all projects if none match expected statuses
        }
        
        return activeProjects;
    }
    
    // Function to analyze project statuses and suggest active ones
    function analyzeProjectStatuses(projects) {
        if (!Array.isArray(projects) || projects.length === 0) return;
        
        const statusCounts = {};
        projects.forEach(project => {
            const status = project.projectStatus || 'No Status';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('📊 Project Status Analysis:', statusCounts);
        
        // Suggest which statuses should be considered "active"
        const inactiveKeywords = ['completed', 'cancelled', 'rejected', 'closed', 'finished', 'done', 'ended'];
        const possibleActiveStatuses = Object.keys(statusCounts).filter(status => {
            const lowerStatus = status.toLowerCase();
            return !inactiveKeywords.some(keyword => lowerStatus.includes(keyword));
        });
        
        console.log('💡 Suggested active statuses:', possibleActiveStatuses);
        
        if (possibleActiveStatuses.length === 0) {
            console.warn('⚠️ No obvious active statuses found. Consider showing all projects or updating status values.');
        }
        
        return possibleActiveStatuses;
    }
    
    // Display projects in the UI
    function displayProjects(projects) {
        console.log('Displaying', projects ? projects.length : 0, 'projects');
        
        if (!projects || projects.length === 0) {
            displayNoProjects();
            return;
        }
        
        let html = '';
        projects.forEach(function(project) {
            html += createProjectCard(project);
        });
        
        projectList.innerHTML = html;
        
        // Update filter summary
        updateFilterSummary();
    }
    
    // Update filter summary display
    function updateFilterSummary() {
        // Remove existing summary
        const existingSummary = document.querySelector('.filter-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        const { category, budget } = currentFilters;
        
        // Only show summary if filters are applied
        if (category !== '0' || budget !== 'all') {
            const categoryName = getCategoryName(parseInt(category)) || 'All Categories';
            const budgetDisplay = formatBudgetRange(budget);
            
            const summaryHTML = `
                <div class="filter-summary">
                    <div class="filter-info">
                        <span class="filter-label">Applied Filters:</span>
                        ${category !== '0' ? `<span class="filter-tag"><i class="fas fa-tag"></i> ${categoryName}</span>` : ''}
                        ${budget !== 'all' ? `<span class="filter-tag"><i class="fas fa-rupee-sign"></i> ${budgetDisplay}</span>` : ''}
                        <button class="clear-filters-btn" onclick="resetFilters()">
                            <i class="fas fa-times"></i> Clear All
                        </button>
                    </div>
                </div>
            `;
            
            // Insert before project list
            const projectSection = projectList.parentElement;
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = summaryHTML;
            projectSection.insertBefore(summaryDiv.firstElementChild, projectList);
        }
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
            console.log('Not showing pagination: totalPages =', totalPages);
            return;
        }
        
        console.log('Creating pagination controls');
        
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
                    console.log('Changing page to:', page);
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
                    <p class="description">${escapeHtml(description.substring(0, 120))}${description.length > 120 ? '...' : ''}</p>
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
                    <a  href="./donatenow.html?id=${projectId}"> <button class="button-read-more">View Details</button></a>
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
            case 'Active': return 'active-status';
            case 'Open': return 'open-status';
            case 'Available': return 'available-status';
            default: return 'unknown-status';
        }
    }
    
    // Display message when no projects are found
    function displayNoProjects() {
        const { category, budget } = currentFilters;
        const hasFilters = category !== '0' || budget !== 'all';
        
        let message = 'No active projects found';
        if (hasFilters) {
            const categoryName = category !== '0' ? getCategoryName(parseInt(category)) : '';
            const budgetDisplay = budget !== 'all' ? formatBudgetRange(budget) : '';
            
            if (categoryName && budgetDisplay) {
                message += ` for ${categoryName} category in budget range ${budgetDisplay}`;
            } else if (categoryName) {
                message += ` in ${categoryName} category`;
            } else if (budgetDisplay) {
                message += ` in budget range ${budgetDisplay}`;
            }
        }
        message += '.';
        
        console.log('Displaying no projects message:', message);
        
        projectList.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No Projects Found</h3>
                <p>${message}</p>
                ${hasFilters ? '<button onclick="resetFilters()" class="reset-btn">Reset All Filters</button>' : ''}
                <div class="debug-info">
                    <p><small>If you expect to see projects here, check the browser console for debugging information about project statuses.</small></p>
                </div>
            </div>
        `;
        
        // Remove pagination when no results
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        // Remove filter summary when no results
        const existingSummary = document.querySelector('.filter-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
    }
    
    // Show loading state
    function showLoading() {
        console.log('Showing loading state');
        
        projectList.innerHTML = `
            <div class="no-results">
                <div class="loading-spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;
        
        // Remove pagination during loading
        const existingPagination = document.querySelector('.pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        // Remove filter summary during loading
        const existingSummary = document.querySelector('.filter-summary');
        if (existingSummary) {
            existingSummary.remove();
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
        console.log('Resetting all filters');
        
        // Reset form elements
        categoryFilter.value = '0';
        scaleFilter.value = 'all';
        
        // Reset filter state
        currentFilters = { category: '0', budget: 'all' };
        
        // Reset pagination state
        resetPaginationState();
        
        // Show loading and reload
        showLoading();
        loadProjects();
    };
    
    // Expose pagination controls for external use
    window.goToPage = function(page) {
        if (page >= 0 && page < totalPages) {
            console.log('Going to page:', page);
            currentPage = page;
            showLoading();
            loadProjectsWithFilters();
        }
    };
    
    // Emergency function to show all projects (for debugging)
    window.showAllProjects = function() {
        console.log('Emergency: Showing all projects regardless of status');
        
        // Temporarily override the filter function
        const originalFilter = window.filterActiveProjects;
        window.filterActiveProjects = function(projects) {
            console.log('Emergency mode: returning all projects');
            return projects || [];
        };
        
        // Reset and reload
        resetFilters();
        
        // Restore original filter after 5 seconds
        setTimeout(() => {
            window.filterActiveProjects = originalFilter;
            console.log('Restored original filter function');
        }, 5000);
    };
});

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});
// Add CSS for enhanced styling
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-spinner {
        border: 4px solid #f1f5f9;
        border-top: 4px solid #0A1E46;
        border-radius: 50%;
        width: 60px;
        height: 60px;
        animation: spin 1s linear infinite;
        margin: 0 auto 25px;
    }
    
    .filter-summary {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 25px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .filter-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    
    .filter-label {
        font-weight: 600;
        color: #475569;
        font-size: 14px;
    }
    
    .filter-tag {
        background: #0A1E46;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    
    .filter-tag i {
        font-size: 11px;
    }
    
    .clear-filters-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
        margin-left: auto;
    }
    
    .clear-filters-btn:hover {
        background: #dc2626;
        transform: translateY(-1px);
    }
    
    .no-results {
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
    }
    
    .no-results-icon {
        font-size: 48px;
        color: #cbd5e1;
        margin-bottom: 20px;
    }
    
    .no-results h3 {
        color: #334155;
        margin-bottom: 12px;
        font-size: 24px;
        font-weight: 600;
    }
    
    .no-results p {
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 25px;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .reset-btn {
        background: #0A1E46;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 15px;
        transition: all 0.3s ease;
    }
    
    .reset-btn:hover {
        background: #1e40af;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(10, 30, 70, 0.3);
    }
    
    .card .description {
        color: #64748b;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 15px;
        height: 40px; /* Limit height for description */
    }
    
    @media (max-width: 768px) {
        .filter-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .clear-filters-btn {
            margin-left: 0;
            align-self: flex-end;
        }
        
        .filter-summary {
            padding: 12px 16px;
        }
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
        
//         // Get all projects and filter by budget on client side
//         ProjectService.listAll(0, 1000) // Get more data to ensure we have all results
//             .then(function(response) {
//                 console.log('Budget API Response:', response);
                
//                 let projectsArray = [];
//                 if (response && response.status === 200) {
//                     if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     }
//                 }
                
//                 if (projectsArray.length > 0) {
//                     // Filter by budget (less than or equal to selected budget) and active status
//                     const filteredProjects = projectsArray.filter(function(project) {
//                         const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
//                         const matchesBudget = project.projectBudget <= parseInt(budget);
//                         return isActive && matchesBudget;
//                     });
                    
//                     // Use client-side pagination for budget filtered results
//                     handleClientSidePagination(filteredProjects);
//                 } else {
//                     displayNoProjects();
//                 }
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
//                     // Filter by budget (less than or equal to selected budget) and active status
//                     const filteredProjects = projectsArray.filter(function(project) {
//                         const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
//                         const matchesBudget = project.projectBudget <= parseInt(budget);
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


























// // // Project filtering and display functionality with pagination
// // document.addEventListener('DOMContentLoaded', function() {
// //     const categoryFilter = document.getElementById('categoryFilter');
// //     const scaleFilter = document.getElementById('scaleFilter');
// //     const projectList = document.getElementById('projectList');
    
// //     // Pagination state
// //     let currentPage = 0;
// //     let pageSize = 10; // Number of projects per page
// //     let totalPages = 0;
// //     let totalElements = 0;
// //     let currentFilters = {
// //         category: '0',
// //         budget: 'all'
// //     };
    
// //     // Initialize the page
// //     loadProjects();
    
// //     // Event listeners for filters
// //     categoryFilter.addEventListener('change', handleFilterChange);
// //     scaleFilter.addEventListener('change', handleFilterChange);
    
// //     // Main function to handle filter changes
// //     function handleFilterChange() {
// //         const selectedCategory = categoryFilter.value;
// //         const selectedBudget = scaleFilter.value;
        
// //         // Update current filters
// //         currentFilters.category = selectedCategory;
// //         currentFilters.budget = selectedBudget;
        
// //         // Reset to first page when filters change
// //         currentPage = 0;
        
// //         // Reset pagination state
// //         totalPages = 0;
// //         totalElements = 0;
        
// //         // Show loading state
// //         showLoading();
        
// //         // Load projects with new filters
// //         loadProjectsWithFilters();
// //     }
    
// //     // Load projects based on current filters and pagination
// //     function loadProjectsWithFilters() {
// //         const { category, budget } = currentFilters;
        
// //         if (category === '0' && budget === 'all') {
// //             // No filters selected - load all projects with server pagination
// //             loadProjects();
// //         } else if (category !== '0' && budget === 'all') {
// //             // Only category selected - use server pagination with direct API call
// //             loadProjectsByCategory(category);
// //         } else if (category === '0' && budget !== 'all') {
// //             // Only budget selected - use client-side pagination for now
// //             loadProjectsByBudget(budget);
// //         } else {
// //             // Both category and budget selected - use client-side pagination
// //             loadProjectsByCategoryAndBudget(category, budget);
// //         }
// //     }
    
// //     // Load all projects with pagination
// //     function loadProjects() {
// //         console.log(`Loading all projects - Page: ${currentPage}, Size: ${pageSize}`);
// //         ProjectService.listAll(currentPage, pageSize)
// //             .then(function(response) {
// //                 console.log('List All API Response:', response);
// //                 handleProjectResponseWithServerPagination(response);
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Load projects by category with pagination support using enhanced service call
// //     function loadProjectsByCategory(categoryId) {
// //         console.log(`Loading projects by category ${categoryId} - Page: ${currentPage}, Size: ${pageSize}`);
        
// //         // Create a custom API call with pagination parameters since ProjectService doesn't support them
// //         const customCategoryCall = {
// //             path: `/projectshowbycategoryid/${categoryId}?page=${currentPage}&size=${pageSize}`,
// //             method: "GET"
// //         };
        
// //         api.request(customCategoryCall)
// //             .then(function(response) {
// //                 console.log('Category API Response:', response);
// //                 handleProjectResponseWithServerPagination(response);
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects by category:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Load projects by budget with client-side pagination
// //     function loadProjectsByBudget(budget) {
// //         console.log(`Loading projects by budget ${budget} - Page: ${currentPage}, Size: ${pageSize}`);
        
// //         // Use existing service call and handle client-side pagination
// //         ProjectService.projectbybudget(budget)
// //             .then(function(response) {
// //                 console.log('Budget API Response:', response);
                
// //                 let projectsArray = [];
// //                 if (response && response.status === 200 && response.data) {
// //                     if (Array.isArray(response.data)) {
// //                         projectsArray = response.data;
// //                     }
// //                 }
                
// //                 // Use client-side pagination for budget filtered results
// //                 handleClientSidePagination(projectsArray);
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects by budget:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Load projects by both category and budget using enhanced API call
// //     function loadProjectsByCategoryAndBudget(categoryId, budget) {
// //         console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
        
// //         // Use custom API call to get all category data, then filter by budget
// //         const customCategoryCall = {
// //             path: `/projectshowbycategoryid/${categoryId}?page=0&size=1000`, // Get more data to ensure we have all results
// //             method: "GET"
// //         };
        
// //         api.request(customCategoryCall)
// //             .then(function(response) {
// //                 console.log('Category API Response for combined filter:', response);
                
// //                 let projectsArray = [];
// //                 if (response && response.status === 200 && response.data) {
// //                     if (Array.isArray(response.data)) {
// //                         projectsArray = response.data;
// //                     }
// //                 }
                
// //                 if (projectsArray.length > 0) {
// //                     // Filter by budget and active status
// //                     const filteredProjects = projectsArray.filter(function(project) {
// //                         const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
// //                         const matchesBudget = project.projectBudget == budget;
// //                         return isActive && matchesBudget;
// //                     });
                    
// //                     // Use client-side pagination for combined filtered results
// //                     handleClientSidePagination(filteredProjects);
// //                 } else {
// //                     displayNoProjects();
// //                 }
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects with combined filters:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Handle server-side paginated responses
// //     function handleProjectResponseWithServerPagination(response) {
// //         if (response && response.status === 200) {
// //             let projectsArray = [];
            
// //             // Handle different response structures
// //             if (Array.isArray(response.data)) {
// //                 // Direct array response (like category API)
// //                 projectsArray = response.data;
// //             } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
// //                 // Paginated response with content array (like listAll API)
// //                 projectsArray = response.data.content;
// //             }
            
// //             // Extract pagination info from API response
// //             if (response.totalPages !== undefined) {
// //                 // Category API format: response.totalPages, response.currentPage, response.totalItems
// //                 totalPages = response.totalPages;
// //                 totalElements = response.totalItems || response.totalElements || projectsArray.length;
// //                 currentPage = response.currentPage || 0;
// //             } else if (response.data && response.data.totalPages !== undefined) {
// //                 // listAll API format: response.data.totalPages, response.data.number, response.data.totalElements
// //                 totalPages = response.data.totalPages || 1;
// //                 totalElements = response.data.totalElements || projectsArray.length;
// //                 currentPage = response.data.number || 0;
// //             } else {
// //                 // Fallback to client-side pagination if no server pagination info
// //                 handleClientSidePagination(projectsArray);
// //                 return;
// //             }
            
// //             // Filter active projects and display
// //             const activeProjects = filterActiveProjects(projectsArray);
// //             displayProjects(activeProjects);
// //             updatePaginationControls();
// //         } else {
// //             displayNoProjects();
// //         }
// //     }
    
// //     // Handle client-side pagination when API doesn't support it
// //     function handleClientSidePagination(allProjects) {
// //         const activeProjects = filterActiveProjects(allProjects);
        
// //         // Calculate pagination info
// //         totalElements = activeProjects.length;
// //         totalPages = Math.ceil(totalElements / pageSize);
        
// //         // Ensure currentPage is within bounds
// //         if (currentPage >= totalPages) {
// //             currentPage = Math.max(0, totalPages - 1);
// //         }
        
// //         // Get projects for current page
// //         const startIndex = currentPage * pageSize;
// //         const endIndex = startIndex + pageSize;
// //         const pageProjects = activeProjects.slice(startIndex, endIndex);
        
// //         displayProjects(pageProjects);
// //         updatePaginationControls();
// //     }
    
// //     // Filter projects to show only active ones (Proposed + Ongoing)
// //     function filterActiveProjects(projects) {
// //         if (!Array.isArray(projects)) {
// //             return [];
// //         }
        
// //         return projects.filter(function(project) {
// //             return project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
// //         });
// //     }
    
// //     // Display projects in the UI
// //     function displayProjects(projects) {
// //         if (!projects || projects.length === 0) {
// //             displayNoProjects();
// //             return;
// //         }
        
// //         let html = '';
// //         projects.forEach(function(project) {
// //             html += createProjectCard(project);
// //         });
        
// //         projectList.innerHTML = html;
// //     }
    
// //     // Create pagination controls
// //     function updatePaginationControls() {
// //         // Remove existing pagination if any
// //         const existingPagination = document.querySelector('.pagination-container');
// //         if (existingPagination) {
// //             existingPagination.remove();
// //         }
        
// //         // Don't show pagination if there's only one page or no results
// //         if (totalPages <= 1) {
// //             return;
// //         }
        
// //         const paginationHtml = createPaginationHTML();
        
// //         // Insert pagination after the project list
// //         const projectSection = projectList.parentElement;
// //         const paginationContainer = document.createElement('div');
// //         paginationContainer.className = 'pagination-container';
// //         paginationContainer.innerHTML = paginationHtml;
// //         projectSection.appendChild(paginationContainer);
        
// //         // Add event listeners to pagination buttons
// //         addPaginationEventListeners();
// //     }
    
// //     // Create pagination HTML
// //     function createPaginationHTML() {
// //         const maxVisiblePages = 5;
// //         let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
// //         let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        
// //         // Adjust start page if we're near the end
// //         if (endPage - startPage < maxVisiblePages - 1) {
// //             startPage = Math.max(0, endPage - maxVisiblePages + 1);
// //         }
        
// //         const startItem = Math.min(currentPage * pageSize + 1, totalElements);
// //         const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
        
// //         let paginationHTML = `
// //             <div class="projectpagination">
// //                 <div class="pagination-info">
// //                     Showing ${startItem} to ${endItem} of ${totalElements} projects
// //                 </div>
// //                 <div class="pagination-controls">
// //         `;
        
// //         // Previous button
// //         paginationHTML += `
// //             <button class="pagination-btn ${currentPage === 0 ? 'disabled' : ''}" 
// //                     data-page="${currentPage - 1}" 
// //                     ${currentPage === 0 ? 'disabled' : ''}>
// //                 <span>‹</span> Previous
// //             </button>
// //         `;
        
// //         // Page numbers
// //         if (startPage > 0) {
// //             paginationHTML += `<button class="pagination-btn" data-page="0">1</button>`;
// //             if (startPage > 1) {
// //                 paginationHTML += `<span class="pagination-ellipsis">...</span>`;
// //             }
// //         }
        
// //         for (let i = startPage; i <= endPage; i++) {
// //             paginationHTML += `
// //                 <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
// //                         data-page="${i}">
// //                     ${i + 1}
// //                 </button>
// //             `;
// //         }
        
// //         if (endPage < totalPages - 1) {
// //             if (endPage < totalPages - 2) {
// //                 paginationHTML += `<span class="pagination-ellipsis">...</span>`;
// //             }
// //             paginationHTML += `<button class="pagination-btn" data-page="${totalPages - 1}">${totalPages}</button>`;
// //         }
        
// //         // Next button
// //         paginationHTML += `
// //             <button class="pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}" 
// //                     data-page="${currentPage + 1}" 
// //                     ${currentPage === totalPages - 1 ? 'disabled' : ''}>
// //                 Next <span>›</span>
// //             </button>
// //         `;
        
// //         paginationHTML += `
// //                 </div>
// //             </div>
// //         `;
        
// //         return paginationHTML;
// //     }
    
// //     // Add event listeners to pagination buttons
// //     function addPaginationEventListeners() {
// //         const paginationBtns = document.querySelectorAll('.pagination-btn:not(.disabled)');
// //         paginationBtns.forEach(btn => {
// //             btn.addEventListener('click', function() {
// //                 const page = parseInt(this.getAttribute('data-page'));
// //                 if (page !== currentPage && page >= 0 && page < totalPages) {
// //                     currentPage = page;
// //                     showLoading();
// //                     loadProjectsWithFilters();
// //                 }
// //             });
// //         });
// //     }
    
// //     // Create HTML for a single project card
// //     function createProjectCard(project) {
// //         const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
// //         const title = project.projectName || project.projectTitle || 'Untitled Project';
// //         const description = project.projectShortDescription || project.projectDescription || 'No description available';
// //         const category = getCategoryName(project.categoryId) || 'Uncategorized';
// //         const mainImage = project.projectMainImage || 'https://via.placeholder.com/400x240/f1f5f9/64748b?text=No+Image';
// //         const projectId = project.projectId || project.id || 0;
// //         const impactPeople = project.impactpeople || 0;
// //         const raisedAmount = project.raisedAmount || 0;
// //         const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
        
// //         const statusDisplay = project.projectStatus || 'Unknown';
// //         const statusClass = getStatusClass(project.projectStatus);
        
// //         return `
// //             <div class="card" data-project-id="${projectId}">
// //                 <div class="status ${statusClass}">
// //                     ${statusDisplay}
// //                 </div>
// //                 <div class="placeholder">
// //                     <img src="${mainImage}" alt="${escapeHtml(title)}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-text\\'>No Image Available</div>';">
// //                 </div>
// //                 <div class="card-content">
// //                     <div class="tag">${escapeHtml(category)}</div>
// //                     <div class="cost">
// //                         Funding Required: <span class="cost-amount">${budget}</span>
// //                     </div>
// //                     <h3 class="title">${escapeHtml(title)}</h3>
// //                     ${raisedAmount > 0 ? `
// //                         <div class="donate-progress">
// //                             <div class="progress-info">
// //                                 <span class="raised-amount">₹${Number(raisedAmount).toLocaleString('en-IN')} raised</span>
// //                                 <span class="target-amount">of ${budget}</span>
// //                             </div>
// //                             <div class="progress-bar">
// //                                 <div class="progress-fill" style="width: ${Math.min(progressPercentage, 100)}%"></div>
// //                             </div>
// //                         </div>
// //                     ` : ''}
// //                     <a class="view-link" href="./donatenow.html?id=${projectId}">View Details</a>
// //                 </div>
// //             </div>
// //         `;
// //     }
    
// //     // Get appropriate CSS class for status
// //     function getStatusClass(status) {
// //         switch(status) {
// //             case 'Proposed': return 'proposed-status';
// //             case 'Ongoing': return 'ongoing-status'; 
// //             case 'Completed': return 'completed-status';
// //             case 'On Hold': return 'onhold-status';
// //             default: return 'unknown-status';
// //         }
// //     }
    
// //     // Display message when no projects are found
// //     function displayNoProjects() {
// //         projectList.innerHTML = `
// //             <div class="no-results">
// //                 <p>No active projects (Proposed or Ongoing) match your current filter criteria.</p>
// //                 <button onclick="resetFilters()">Reset Filters</button>
// //             </div>
// //         `;
        
// //         // Remove pagination when no results
// //         const existingPagination = document.querySelector('.pagination-container');
// //         if (existingPagination) {
// //             existingPagination.remove();
// //         }
// //     }
    
// //     // Show loading state
// //     function showLoading() {
// //         projectList.innerHTML = `
// //             <div class="no-results">
// //                 <div style="border: 4px solid #f1f5f9; border-top: 4px solid #0A1E46; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 0 auto 25px;"></div>
// //                 <p>Loading projects...</p>
// //             </div>
// //         `;
        
// //         // Remove pagination during loading
// //         const existingPagination = document.querySelector('.pagination-container');
// //         if (existingPagination) {
// //             existingPagination.remove();
// //         }
// //     }
    
// //     // Get category name by ID
// //     function getCategoryName(categoryId) {
// //         const categories = {
// //             1: 'Health',
// //             2: 'Environment', 
// //             3: 'Education',
// //             4: 'Infrastructure',
// //             5: 'Social'
// //         };
// //         return categories[categoryId] || 'Uncategorized';
// //     }
    
// //     // Escape HTML to prevent XSS
// //     function escapeHtml(text) {
// //         if (typeof text !== 'string') return '';
// //         const div = document.createElement('div');
// //         div.textContent = text;
// //         return div.innerHTML;
// //     }
    
// //     // Global reset function
// //     window.resetFilters = function() {
// //         categoryFilter.value = '0';
// //         scaleFilter.value = 'all';
// //         currentFilters = { category: '0', budget: 'all' };
// //         currentPage = 0;
// //         totalPages = 0;
// //         totalElements = 0;
// //         loadProjects();
// //     };
    
// //     // Expose pagination controls for external use
// //     window.goToPage = function(page) {
// //         if (page >= 0 && page < totalPages) {
// //             currentPage = page;
// //             showLoading();
// //             loadProjectsWithFilters();
// //         }
// //     };
// // });

// // // Prevent form submission on Enter key
// // document.addEventListener('keydown', function(e) {
// //     if (e.key === 'Enter') {
// //         e.preventDefault();
// //     }
// // });

// // // Add CSS for spinning loader animation
// // const style = document.createElement('style');
// // style.textContent = `
// //     @keyframes spin {
// //         0% { transform: rotate(0deg); }
// //         100% { transform: rotate(360deg); }
// //     }
// // `;
// // document.head.appendChild(style);


