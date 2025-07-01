
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
                
                // Show loading state
                showLoading();
                
                // Load projects with new filters
                loadProjectsWithFilters();
            }
            
            // Load projects based on current filters and pagination
            function loadProjectsWithFilters() {
                const { category, budget } = currentFilters;
                
                if (category === '0' && budget === 'all') {
                    // No filters selected - load all projects
                    loadProjects();
                } else if (category !== '0' && budget === 'all') {
                    // Only category selected
                    loadProjectsByCategory(category);
                } else if (category === '0' && budget !== 'all') {
                    // Only budget selected
                    loadProjectsByBudget(budget);
                } else {
                    // Both category and budget selected
                    loadProjectsByCategoryAndBudget(category, budget);
                }
            }
            
            // Load all projects with pagination
            function loadProjects() {
                console.log(`Loading all projects - Page: ${currentPage}, Size: ${pageSize}`);
                ProjectService.listAll(currentPage, pageSize)
                    .then(function(response) {
                        console.log('List All API Response:', response);
                        handleProjectResponse(response);
                    })
                    .catch(function(error) {
                        console.error('Error loading projects:', error);
                        displayNoProjects();
                    });
            }
            
            // Load projects by category with pagination
            function loadProjectsByCategory(categoryId) {
                console.log(`Loading projects by category ${categoryId} - Page: ${currentPage}, Size: ${pageSize}`);
                
                ProjectService.projectbycategry(categoryId)
                    .then(function(response) {
                        console.log('Category API Response:', response);
                        handleProjectResponse(response, true);
                    })
                    .catch(function(error) {
                        console.error('Error loading projects by category:', error);
                        displayNoProjects();
                    });
            }
            
            // Load projects by budget with pagination
            function loadProjectsByBudget(budget) {
                console.log(`Loading projects by budget ${budget} - Page: ${currentPage}, Size: ${pageSize}`);
                
                ProjectService.projectbybudget(budget)
                    .then(function(response) {
                        console.log('Budget API Response:', response);
                        handleProjectResponse(response, true);
                    })
                    .catch(function(error) {
                        console.error('Error loading projects by budget:', error);
                        displayNoProjects();
                    });
            }
            
            // Load projects by both category and budget
            function loadProjectsByCategoryAndBudget(categoryId, budget) {
                console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
                
                ProjectService.projectbycategry(categoryId)
                    .then(function(response) {
                        console.log('Category API Response for combined filter:', response);
                        
                        let projectsArray = [];
                        if (response && response.status === 200 && response.data) {
                            if (response.data.content && Array.isArray(response.data.content)) {
                                projectsArray = response.data.content;
                            } else if (Array.isArray(response.data)) {
                                projectsArray = response.data;
                            }
                        }
                        
                        if (projectsArray.length > 0) {
                            // Filter by budget and active status
                            const filteredProjects = projectsArray.filter(function(project) {
                                const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
                                const matchesBudget = project.projectBudget == budget;
                                return isActive && matchesBudget;
                            });
                            
                            // Handle client-side pagination for filtered results
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
            
            // Handle API response and update pagination info
            function handleProjectResponse(response, clientSidePagination = false) {
                if (response && response.status === 200 && response.data) {
                    let projectsArray = [];
                    
                    if (response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                        
                        if (!clientSidePagination) {
                            // Server-side pagination info is available
                            totalPages = response.data.totalPages || 1;
                            totalElements = response.data.totalElements || projectsArray.length;
                            currentPage = response.data.number || 0;
                        }
                    } else if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    }
                    
                    if (clientSidePagination) {
                        // Handle client-side pagination for filtered results
                        handleClientSidePagination(projectsArray);
                    } else {
                        // Filter active projects and display
                        const activeProjects = filterActiveProjects(projectsArray);
                        displayProjects(activeProjects);
                        updatePaginationControls();
                    }
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
                
                let paginationHTML = `
                    <div class="projectpagination">
                        <div class="pagination-info">
                            Showing ${currentPage * pageSize + 1} to ${Math.min((currentPage + 1) * pageSize, totalElements)} of ${totalElements} projects
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
   

















































// // // Project filtering and display functionality
// // document.addEventListener('DOMContentLoaded', function() {
// //     const categoryFilter = document.getElementById('categoryFilter');
// //     const scaleFilter = document.getElementById('scaleFilter');
// //     const projectList = document.getElementById('projectList');
    
// //     // Initialize the page
// //     loadProjects();
    
// //     // Event listeners for filters
// //     categoryFilter.addEventListener('change', handleFilterChange);
// //     scaleFilter.addEventListener('change', handleFilterChange);
    
// //     // Main function to handle filter changes
// //     function handleFilterChange() {
// //         const selectedCategory = categoryFilter.value;
// //         const selectedBudget = scaleFilter.value;
        
// //         // Show loading state
// //         showLoading();
        
// //         // Determine which API to call based on selections
// //         if (selectedCategory === '0' && selectedBudget === 'all') {
// //             // No filters selected - load all ongoing projects
// //             loadProjects();
// //         } else if (selectedCategory !== '0' && selectedBudget === 'all') {
// //             // Only category selected
// //             loadProjectsByCategory(selectedCategory);
// //         } else if (selectedCategory === '0' && selectedBudget !== 'all') {
// //             // Only budget selected
// //             loadProjectsByBudget(selectedBudget);
// //         } else {
// //             // Both category and budget selected
// //             loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
// //         }
// //     }
    
// //     // Load all projects (default)
// //     function loadProjects() {
// //         console.log('Loading all projects...');
// //         ProjectService.listAll(0, 100)
// //             .then(function(response) {
// //                 console.log('List All API Response:', response);
                
// //                 // Handle the specific response structure from your API
// //                 if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
// //                     console.log('Total projects received:', response.data.content.length);
// //                     const ongoingProjects = filterProposedProjects(response.data.content);
// //                     console.log('Proposed projects after filter:', ongoingProjects.length);
// //                     displayProjects(ongoingProjects);
// //                 } else {
// //                     console.log('No valid data found in response');
// //                     displayNoProjects();
// //                 }
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Load projects by category
// //     function loadProjectsByCategory(categoryId) {
// //         ProjectService.projectbycategry(categoryId)
// //             .then(function(response) {
// //                 console.log('Category API Response:', response);
                
// //                 if (response && response.status === 200 && response.data) {
// //                     let projectsArray = [];
// //                     if (response.data.content && Array.isArray(response.data.content)) {
// //                         projectsArray = response.data.content;
// //                     } else if (Array.isArray(response.data)) {
// //                         projectsArray = response.data;
// //                     }
                    
// //                     if (projectsArray.length > 0) {
// //                         const ongoingProjects = filterProposedProjects(projectsArray);
// //                         displayProjects(ongoingProjects);
// //                     } else {
// //                         displayNoProjects();
// //                     }
// //                 } else {
// //                     displayNoProjects();
// //                 }
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects by category:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Load projects by budget
// //     function loadProjectsByBudget(budget) {
// //         ProjectService.projectbybudget(budget)
// //             .then(function(response) {
// //                 console.log('Budget API Response:', response);
                
// //                 if (response && response.status === 200 && response.data) {
// //                     let projectsArray = [];
// //                     if (response.data.content && Array.isArray(response.data.content)) {
// //                         projectsArray = response.data.content;
// //                     } else if (Array.isArray(response.data)) {
// //                         projectsArray = response.data;
// //                     }
                    
// //                     if (projectsArray.length > 0) {
// //                         const ongoingProjects = filterProposedProjects(projectsArray);
// //                         displayProjects(ongoingProjects);
// //                     } else {
// //                         displayNoProjects();
// //                     }
// //                 } else {
// //                     displayNoProjects();
// //                 }
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects by budget:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Load projects by both category and budget
// //     function loadProjectsByCategoryAndBudget(categoryId, budget) {
// //         console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
        
// //         // Strategy: First filter by category (usually fewer results), then filter by budget locally
// //         ProjectService.projectbycategry(categoryId)
// //             .then(function(response) {
// //                 console.log('Category API Response for combined filter:', response);
                
// //                 let projectsArray = [];
// //                 if (response && response.status === 200 && response.data) {
// //                     if (response.data.content && Array.isArray(response.data.content)) {
// //                         projectsArray = response.data.content;
// //                     } else if (Array.isArray(response.data)) {
// //                         projectsArray = response.data;
// //                     }
// //                 }
                
// //                 console.log('Projects from category API:', projectsArray.length);
                
// //                 if (projectsArray.length > 0) {
// //                     // Filter by budget and ongoing status
// //                     const filteredProjects = projectsArray.filter(function(project) {
// //                         const isProposed = project.projectStatus === 'Proposed';
// //                         const matchesBudget = project.projectBudget == budget;
                        
// //                         console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Matches: ${isProposed && matchesBudget}`);
                        
// //                         return isProposed && matchesBudget;
// //                     });
                    
// //                     console.log('Final filtered projects (ongoing + budget match):', filteredProjects.length);
// //                     displayProjects(filteredProjects);
// //                 } else {
// //                     console.log('No projects found for category, showing no projects');
// //                     displayNoProjects();
// //                 }
// //             })
// //             .catch(function(error) {
// //                 console.error('Error loading projects with combined filters:', error);
// //                 displayNoProjects();
// //             });
// //     }
    
// //     // Filter projects to show only ongoing ones
// //     function filterProposedProjects(projects) {
// //         console.log('Input to filterProposedProjects:', projects);
// //         console.log('Is input an array?', Array.isArray(projects));
        
// //         if (!Array.isArray(projects)) {
// //             console.log('Projects is not an array, returning empty array');
// //             return [];
// //         }
        
// //         // Log each project's status
// //         projects.forEach(function(project, index) {
// //             console.log(`Project ${index}:`, {
// //                 name: project.projectName,
// //                 status: project.projectStatus,
// //                 id: project.projectId
// //             });
// //         });
        
// //         const ongoingProjects = projects.filter(function(project) {
// //             const isProposed = project.projectStatus === 'Proposed';
// //             console.log(`${project.projectName} - Status: "${project.projectStatus}" - Is Proposed: ${isProposed}`);
// //             return isProposed;
// //         });
        
// //         console.log('Filtered ongoing projects:', ongoingProjects.length, 'out of', projects.length);
// //         console.log('Proposed projects:', ongoingProjects);
// //         return ongoingProjects;
// //     }
    
// //     // Display projects in the UI
// //     function displayProjects(projects) {
// //         console.log('displayProjects called with:', projects);
// //         console.log('Number of projects to display:', projects ? projects.length : 0);
        
// //         if (!projects || projects.length === 0) {
// //             console.log('No projects to display, showing no projects message');
// //             displayNoProjects();
// //             return;
// //         }
        
// //         console.log('Generating HTML for', projects.length, 'projects');
// //         let html = '';
// //         projects.forEach(function(project, index) {
// //             console.log(`Generating card for project ${index}:`, project.projectName);
// //             const cardHtml = createProjectCard(project);
// //             console.log(`Card HTML generated for ${project.projectName}`);
// //             html += cardHtml;
// //         });
        
// //         console.log('Setting projectList innerHTML...');
// //         projectList.innerHTML = html;
// //         console.log('Projects displayed successfully');
// //     }
    
// //     // Create HTML for a single project card using your CSS classes
// //     function createProjectCard(project) {
// //         const budget = project.projectBudget ? '₹' + Number(project.projectBudget).toLocaleString('en-IN') : 'Budget not specified';
// //         const title = project.projectName || project.projectTitle || 'Untitled Project';
// //         const description = project.projectShortDescription || project.projectDescription || 'No description available';
// //         const category = getCategoryName(project.categoryId) || 'Uncategorized';
// //         const mainImage = project.projectMainImage || 'https://via.placeholder.com/300x180?text=No+Image';
// //         const projectId = project.projectId || project.id || 0;
// //         const impactPeople = project.impactpeople || 0;
// //         const raisedAmount = project.raisedAmount || 0;
// //         const progressPercentage = project.projectBudget ? (raisedAmount / project.projectBudget * 100).toFixed(1) : 0;
        
// //         console.log(`Creating card for ${title} with status: "${project.projectStatus}"`);
        
// //         return `
// //             <div class="card" data-project-id="${projectId}" style="position: relative;">
// //                 <div class="status ${project.projectStatus === 'Proposed' ? 'ongoing' : 'scrutiny'}" style="position: absolute; top: 0; right: 0; background: #e74c3c; color: white; padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 0 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 10;">
// //                     ${project.projectStatus || 'Unknown'}
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
    
// //     // Display message when no projects are found
// //     function displayNoProjects() {
// //         projectList.innerHTML = `
// //             <div class="no-results">
// //                              <p>No ongoing projects match your current filter criteria.</p>
// //                 <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: 600;">Reset Filters</button>
// //             </div>
// //         `;
// //     }
    
// //     // Show loading state
// //     function showLoading() {
// //         projectList.innerHTML = `
// //             <div class="no-results">
// //                 <div style="border: 4px solid #f3f4f6; border-top: 4px solid #0A1E46; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
// //                 <p>Loading projects...</p>
// //             </div>
// //             <style>
// //                 @keyframes spin {
// //                     0% { transform: rotate(0deg); }
// //                     100% { transform: rotate(360deg); }
// //                 }
// //             </style>
// //         `;
// //     }
    
// //     // Get category name by ID
// //     function getCategoryName(categoryId) {
// //         const categories = {
// //             1: 'Health',
// //             2: 'Environment',
// //             3: 'Education',
// //             4: 'Social',
// //             5: 'Infrastructure'
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
// //         loadProjects();
// //     };
// // });

// // // Prevent form submission on Enter key
// // document.addEventListener('keydown', function(e) {
// //     if (e.key === 'Enter') {
// //         e.preventDefault();
// //     }
// // });


























// // Project filtering and display functionality
// document.addEventListener('DOMContentLoaded', function() {
//     const categoryFilter = document.getElementById('categoryFilter');
//     const scaleFilter = document.getElementById('scaleFilter');
//     const projectList = document.getElementById('projectList');
    
//     // Initialize the page
//     loadProjects();
    
//     // Event listeners for filters
//     categoryFilter.addEventListener('change', handleFilterChange);
//     scaleFilter.addEventListener('change', handleFilterChange);
    
//     // Main function to handle filter changes
//     function handleFilterChange() {
//         const selectedCategory = categoryFilter.value;
//         const selectedBudget = scaleFilter.value;
        
//         // Show loading state
//         showLoading();
        
//         // Determine which API to call based on selections
//         if (selectedCategory === '0' && selectedBudget === 'all') {
//             // No filters selected - load all projects
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
    
//     // Load all projects (default)
//     function loadProjects() {
//         console.log('Loading all projects...');
//         ProjectService.listAll(0, 100)
//             .then(function(response) {
//                 console.log('List All API Response:', response);
                
//                 // Handle the specific response structure from your API
//                 if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
//                     console.log('Total projects received:', response.data.content.length);
//                     const activeProjects = filterActiveProjects(response.data.content);
//                     console.log('Active projects (Proposed + Ongoing) after filter:', activeProjects.length);
//                     displayProjects(activeProjects);
//                 } else {
//                     console.log('No valid data found in response');
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
//                 console.log('Category API Response:', response);
                
//                 if (response && response.status === 200 && response.data) {
//                     let projectsArray = [];
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
                    
//                     if (projectsArray.length > 0) {
//                         const activeProjects = filterActiveProjects(projectsArray);
//                         displayProjects(activeProjects);
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
//                 console.log('Budget API Response:', response);
                
//                 if (response && response.status === 200 && response.data) {
//                     let projectsArray = [];
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
                    
//                     if (projectsArray.length > 0) {
//                         const activeProjects = filterActiveProjects(projectsArray);
//                         displayProjects(activeProjects);
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
//         console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
        
//         // Strategy: First filter by category (usually fewer results), then filter by budget locally
//         ProjectService.projectbycategry(categoryId)
//             .then(function(response) {
//                 console.log('Category API Response for combined filter:', response);
                
//                 let projectsArray = [];
//                 if (response && response.status === 200 && response.data) {
//                     if (response.data.content && Array.isArray(response.data.content)) {
//                         projectsArray = response.data.content;
//                     } else if (Array.isArray(response.data)) {
//                         projectsArray = response.data;
//                     }
//                 }
                
//                 console.log('Projects from category API:', projectsArray.length);
                
//                 if (projectsArray.length > 0) {
//                     // Filter by budget and active status (Proposed + Ongoing)
//                     const filteredProjects = projectsArray.filter(function(project) {
//                         const isActive = project.projectStatus === 'Proposed' || project.projectStatus === 'Ongoing';
//                         const matchesBudget = project.projectBudget == budget;
                        
//                         console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Matches: ${isActive && matchesBudget}`);
                        
//                         return isActive && matchesBudget;
//                     });
                    
//                     console.log('Final filtered projects (active + budget match):', filteredProjects.length);
//                     displayProjects(filteredProjects);
//                 } else {
//                     console.log('No projects found for category, showing no projects');
//                     displayNoProjects();
//                 }
//             })
//             .catch(function(error) {
//                 console.error('Error loading projects with combined filters:', error);
//                 displayNoProjects();
//             });
//     }
    
//     // Filter projects to show only active ones (Proposed + Ongoing)
//     function filterActiveProjects(projects) {
//         console.log('Input to filterActiveProjects:', projects);
//         console.log('Is input an array?', Array.isArray(projects));
        
//         if (!Array.isArray(projects)) {
//             console.log('Projects is not an array, returning empty array');
//             return [];
//         }
        
//         // Log each project's status
//         projects.forEach(function(project, index) {
//             console.log(`Project ${index}:`, {
//                 name: project.projectName,
//                 status: project.projectStatus,
//                 id: project.projectId
//             });
//         });
        
//         const activeProjects = projects.filter(function(project) {
//             const isProposed = project.projectStatus === 'Proposed';
//             const isOngoing = project.projectStatus === 'Ongoing';
//             const isActive = isProposed || isOngoing;
            
//             console.log(`${project.projectName} - Status: "${project.projectStatus}" - Is Active (Proposed/Ongoing): ${isActive}`);
//             return isActive;
//         });
        
//         console.log('Filtered active projects:', activeProjects.length, 'out of', projects.length);
//         console.log('Active projects (Proposed + Ongoing):', activeProjects);
//         return activeProjects;
//     }
    
//     // Display projects in the UI
//     function displayProjects(projects) {
//         console.log('displayProjects called with:', projects);
//         console.log('Number of projects to display:', projects ? projects.length : 0);
        
//         if (!projects || projects.length === 0) {
//             console.log('No projects to display, showing no projects message');
//             displayNoProjects();
//             return;
//         }
        
//         console.log('Generating HTML for', projects.length, 'projects');
//         let html = '';
//         projects.forEach(function(project, index) {
//             console.log(`Generating card for project ${index}:`, project.projectName);
//             const cardHtml = createProjectCard(project);
//             console.log(`Card HTML generated for ${project.projectName}`);
//             html += cardHtml;
//         });
        
//         console.log('Setting projectList innerHTML...');
//         projectList.innerHTML = html;
//         console.log('Projects displayed successfully');
//     }
    
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
        
//         // Determine status display and styling
//         const statusDisplay = project.projectStatus || 'Unknown';
//         const statusClass = getStatusClass(project.projectStatus);
        
//         console.log(`Creating card for ${title} with status: "${project.projectStatus}"`);
        
//         return `
//             <div class="card" data-project-id="${projectId}" style="position: relative;">
//                 <div class="status ${statusClass}" style="position: absolute; top: 0; right: 0; color: white; padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 0 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 10;">
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
    
//     // Get appropriate CSS class and background color for status
//     function getStatusClass(status) {
//         switch(status) {
//             case 'Proposed':
//                 return 'proposed-status';
//             case 'Ongoing':
//                 return 'ongoing-status'; 
//             case 'Completed':
//                 return 'completed-status';
//             case 'On Hold':
//                 return 'onhold-status';
//             default:
//                 return 'unknown-status';
//         }
//     }
    
//     // Display message when no projects are found
//     function displayNoProjects() {
//         projectList.innerHTML = `
//             <div class="no-results">
//                 <p>No active projects (Proposed or Ongoing) match your current filter criteria.</p>
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
                
//                 /* Status-specific styling */
//                 .proposed-status {
//                     background: #e74c3c !important; /* Red for Proposed */
//                 }
                
//                 .ongoing-status {
//                     background: #27ae60 !important; /* Green for Ongoing */
//                 }
                
//                 .completed-status {
//                     background: #2980b9 !important; /* Blue for Completed */
//                 }
                
//                 .onhold-status {
//                     background: #f39c12 !important; /* Orange for On Hold */
//                 }
                
//                 .unknown-status {
//                     background: #95a5a6 !important; /* Gray for Unknown */
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
//         categoryFilter.value = '0';
//         scaleFilter.value = 'all';
//         loadProjects();
//     };
// });

// // Prevent form submission on Enter key
// document.addEventListener('keydown', function(e) {
//     if (e.key === 'Enter') {
//         e.preventDefault();
//     }
// });