// Project filtering and display functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const scaleFilter = document.getElementById('scaleFilter');
    const projectList = document.getElementById('projectList');
    
    // Initialize the page
    loadProjects();
    
    // Event listeners for filters
    categoryFilter.addEventListener('change', handleFilterChange);
    scaleFilter.addEventListener('change', handleFilterChange);
    
    // Main function to handle filter changes
    function handleFilterChange() {
        const selectedCategory = categoryFilter.value;
        const selectedBudget = scaleFilter.value;
        
        // Show loading state
        showLoading();
        
        // Determine which API to call based on selections
        if (selectedCategory === '0' && selectedBudget === 'all') {
            // No filters selected - load all Completed projects
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
    
    // Load all projects (default)
    function loadProjects() {
        console.log('Loading all projects...');
        ProjectService.listAll(0, 1000)
            .then(function(response) {
                console.log('List All API Response:', response);
                
                // Handle the specific response structure from your API
                if (response && response.status === 200 && response.data && response.data.content && Array.isArray(response.data.content)) {
                    console.log('Total projects received:', response.data.content.length);
                    const CompletedProjects = filterCompletedProjects(response.data.content);
                    console.log('Completed projects after filter:', CompletedProjects.length);
                    displayProjects(CompletedProjects);
                } else {
                    console.log('No valid data found in response');
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
                console.log('Category API Response:', response);
                
                if (response && response.status === 200 && response.data) {
                    let projectsArray = [];
                    if (response.data.content && Array.isArray(response.data.content)) {
                        projectsArray = response.data.content;
                    } else if (Array.isArray(response.data)) {
                        projectsArray = response.data;
                    }
                    
                    if (projectsArray.length > 0) {
                        const CompletedProjects = filterCompletedProjects(projectsArray);
                        displayProjects(CompletedProjects);
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
    // function loadProjectsByBudget(budget) {
    //     ProjectService.projectbybudget(budget)
    //         .then(function(response) {
    //             console.log('Budget API Response:', response);
                
    //             if (response && response.status === 200 && response.data) {
    //                 let projectsArray = [];
    //                 if (response.data.content && Array.isArray(response.data.content)) {
    //                     projectsArray = response.data.content;
    //                 } else if (Array.isArray(response.data)) {
    //                     projectsArray = response.data;
    //                 }
                    
    //                 if (projectsArray.length > 0) {
    //                     const CompletedProjects = filterCompletedProjects(projectsArray);
    //                     displayProjects(CompletedProjects);
    //                 } else {
    //                     displayNoProjects();
    //                 }
    //             } else {
    //                 displayNoProjects();
    //             }
    //         })
    //         .catch(function(error) {
    //             console.error('Error loading projects by budget:', error);
    //             displayNoProjects();
    //         });
    // }
    
    // // Load projects by both category and budget
    // function loadProjectsByCategoryAndBudget(categoryId, budget) {
    //     console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
        
    //     // Strategy: First filter by category (usually fewer results), then filter by budget locally
    //     ProjectService.projectbycategry(categoryId)
    //         .then(function(response) {
    //             console.log('Category API Response for combined filter:', response);
                
    //             let projectsArray = [];
    //             if (response && response.status === 200 && response.data) {
    //                 if (response.data.content && Array.isArray(response.data.content)) {
    //                     projectsArray = response.data.content;
    //                 } else if (Array.isArray(response.data)) {
    //                     projectsArray = response.data;
    //                 }
    //             }
                
    //             console.log('Projects from category API:', projectsArray.length);
                
    //             if (projectsArray.length > 0) {
    //                 // Filter by budget and Completed status
    //                 const filteredProjects = projectsArray.filter(function(project) {
    //                     const isCompleted = project.projectStatus === 'Completed';
    //                     const matchesBudget = project.projectBudget == budget;
                        
    //                     console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Matches: ${isCompleted && matchesBudget}`);
                        
    //                     return isCompleted && matchesBudget;
    //                 });
                    
    //                 console.log('Final filtered projects (Completed + budget match):', filteredProjects.length);
    //                 displayProjects(filteredProjects);
    //             } else {
    //                 console.log('No projects found for category, showing no projects');
    //                 displayNoProjects();
    //             }
    //         })
    //         .catch(function(error) {
    //             console.error('Error loading projects with combined filters:', error);
    //             displayNoProjects();
    //         });
    // }
    // Updated loadProjectsByBudget function for completed projects
function loadProjectsByBudget(budget) {
    // Get all projects and filter by budget on client side
    ProjectService.listAll(0, 1000) // Get more data to ensure we have all results
        .then(function(response) {
            console.log('Budget API Response:', response);
            
            if (response && response.status === 200) {
                let projectsArray = [];
                if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    projectsArray = response.data.content;
                } else if (Array.isArray(response.data)) {
                    projectsArray = response.data;
                }
                
                if (projectsArray.length > 0) {
                    // Filter by budget (less than or equal to selected budget) and completed status
                    const filteredProjects = projectsArray.filter(function(project) {
                        const isCompleted = project.projectStatus === 'Completed';
                        const matchesBudget = project.projectBudget <= parseInt(budget);
                        return isCompleted && matchesBudget;
                    });
                    
                    displayProjects(filteredProjects);
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

// Updated loadProjectsByCategoryAndBudget function for completed projects
function loadProjectsByCategoryAndBudget(categoryId, budget) {
    console.log('Loading projects with both filters - Category:', categoryId, 'Budget:', budget);
    
    // Strategy: First filter by category (usually fewer results), then filter by budget locally
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
            
            console.log('Projects from category API:', projectsArray.length);
            
            if (projectsArray.length > 0) {
                // Filter by budget (less than or equal to selected budget) and Completed status
                const filteredProjects = projectsArray.filter(function(project) {
                    const isCompleted = project.projectStatus === 'Completed';
                    const matchesBudget = project.projectBudget <= parseInt(budget);
                    
                    console.log(`${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Matches: ${isCompleted && matchesBudget}`);
                    
                    return isCompleted && matchesBudget;
                });
                
                console.log('Final filtered projects (Completed + budget match):', filteredProjects.length);
                displayProjects(filteredProjects);
            } else {
                console.log('No projects found for category, showing no projects');
                displayNoProjects();
            }
        })
        .catch(function(error) {
            console.error('Error loading projects with combined filters:', error);
            displayNoProjects();
        });
}
    // Filter projects to show only Completed ones
    function filterCompletedProjects(projects) {
        console.log('Input to filterCompletedProjects:', projects);
        console.log('Is input an array?', Array.isArray(projects));
        
        if (!Array.isArray(projects)) {
            console.log('Projects is not an array, returning empty array');
            return [];
        }
        
        // Log each project's status
        projects.forEach(function(project, index) {
            console.log(`Project ${index}:`, {
                name: project.projectName,
                status: project.projectStatus,
                id: project.projectId
            });
        });
        
        const CompletedProjects = projects.filter(function(project) {
            const isCompleted = project.projectStatus === 'Completed';
            console.log(`${project.projectName} - Status: "${project.projectStatus}" - Is Completed: ${isCompleted}`);
            return isCompleted;
        });
        
        console.log('Filtered Completed projects:', CompletedProjects.length, 'out of', projects.length);
        console.log('Completed projects:', CompletedProjects);
        return CompletedProjects;
    }
    
    // Display projects in the UI
    function displayProjects(projects) {
        console.log('displayProjects called with:', projects);
        console.log('Number of projects to display:', projects ? projects.length : 0);
        
        if (!projects || projects.length === 0) {
            console.log('No projects to display, showing no projects message');
            displayNoProjects();
            return;
        }
        
        console.log('Generating HTML for', projects.length, 'projects');
        let html = '';
        projects.forEach(function(project, index) {
            console.log(`Generating card for project ${index}:`, project.projectName);
            const cardHtml = createProjectCard(project);
            console.log(`Card HTML generated for ${project.projectName}`);
            html += cardHtml;
        });
        
        console.log('Setting projectList innerHTML...');
        projectList.innerHTML = html;
        console.log('Projects displayed successfully');
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
        
        console.log(`Creating card for ${title} with status: "${project.projectStatus}"`);
        
        return `
            <div class="card" data-project-id="${projectId}" style="position: relative;">
                <div class="status ${project.projectStatus === 'Completed' ? 'Completed' : 'scrutiny'}" style="position: absolute; top: 0; right: 0; background: #ccc; color: white; padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 0 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 10;">
                    ${project.projectStatus || 'Unknown'}
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
    
    // Display message when no projects are found
    function displayNoProjects() {
        projectList.innerHTML = `
            <div class="no-results">
                             <p>No Completed projects match your current filter criteria.</p>
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
        categoryFilter.value = '0';
        scaleFilter.value = 'all';
        loadProjects();
    };
});

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});