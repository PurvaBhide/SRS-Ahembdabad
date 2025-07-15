// Project filtering and display functionality with Budget Ranges and Pagination
document.addEventListener("DOMContentLoaded", function () {
  const categoryFilter = document.getElementById("categoryFilter");
  const scaleFilter = document.getElementById("scaleFilter");
  const projectList = document.getElementById("projectList");

  // Pagination state
  let currentPage = 0;
  let pageSize = 9; // Number of projects per page (3x3 grid)
  let totalPages = 0;
  let totalElements = 0;
  let currentFilters = {
    category: '0',
    budgetRange: 'all'
  };

  // Initialize the page
  loadProjects();

  // Event listeners for filters
  categoryFilter.addEventListener("change", handleFilterChange);
  scaleFilter.addEventListener("change", handleFilterChange);

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
    const selectedBudgetRange = scaleFilter.value;

    // Update current filters
    currentFilters.category = selectedCategory;
    currentFilters.budgetRange = selectedBudgetRange;

    // Reset to first page when filters change
    currentPage = 0;
    totalPages = 0;
    totalElements = 0;

    // Show loading state
    showLoading();

    // Load projects with new filters
    loadProjectsWithFilters();
  }

  // Load projects based on current filters and pagination
  function loadProjectsWithFilters() {
    const { category, budgetRange } = currentFilters;

    if (category === "0" && budgetRange === "all") {
      // No filters selected - load all completed projects
      loadProjects();
    } else if (category !== "0" && budgetRange === "all") {
      // Only category selected
      loadProjectsByCategory(category);
    } else if (category === "0" && budgetRange !== "all") {
      // Only budget range selected
      loadProjectsByBudgetRange(budgetRange);
    } else {
      // Both category and budget range selected
      loadProjectsByCategoryAndBudgetRange(category, budgetRange);
    }
  }

  // Load all projects (default)
  function loadProjects() {
    console.log("Loading all completed projects...");
    ProjectService.listAll(0, 1000)
      .then(function (response) {
        console.log("List All API Response:", response);

        if (
          response &&
          response.status === 200 &&
          response.data &&
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          console.log("Total projects received:", response.data.content.length);
          const completedProjects = filterCompletedProjects(response.data.content);
          console.log("Completed projects after filter:", completedProjects.length);
          
          // Handle client-side pagination
          handleClientSidePagination(completedProjects);
        } else {
          console.log("No valid data found in response");
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects:", error);
        displayNoProjects();
      });
  }

  // Load projects by category
  function loadProjectsByCategory(categoryId) {
    console.log("Loading completed projects by category:", categoryId);
    ProjectService.projectbycategry(categoryId)
      .then(function (response) {
        console.log("Category API Response:", response);

        if (response && response.status === 200 && response.data) {
          let projectsArray = [];
          if (response.data.content && Array.isArray(response.data.content)) {
            projectsArray = response.data.content;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }

          if (projectsArray.length > 0) {
            const completedProjects = filterCompletedProjects(projectsArray);
            handleClientSidePagination(completedProjects);
          } else {
            displayNoProjects();
          }
        } else {
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects by category:", error);
        displayNoProjects();
      });
  }

  // Load projects by budget range
  function loadProjectsByBudgetRange(budgetRange) {
    console.log("Loading completed projects by budget range:", budgetRange);
    
    ProjectService.listAll(0, 1000)
      .then(function (response) {
        console.log("Budget Range API Response:", response);

        if (response && response.status === 200) {
          let projectsArray = [];
          if (
            response.data &&
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            projectsArray = response.data.content;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }

          if (projectsArray.length > 0) {
            // Filter by budget range and completed status
            const filteredProjects = projectsArray.filter(function (project) {
              const isCompleted = project.projectStatus === "Completed";
              const matchesBudgetRange = isProjectInBudgetRange(project.projectBudget, budgetRange);
              
              console.log(
                `${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Completed: ${isCompleted}, Budget Range Match: ${matchesBudgetRange}`
              );
              
              return isCompleted && matchesBudgetRange;
            });

            console.log(`Filtered ${filteredProjects.length} completed projects for budget range ${budgetRange}`);
            handleClientSidePagination(filteredProjects);
          } else {
            displayNoProjects();
          }
        } else {
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects by budget range:", error);
        displayNoProjects();
      });
  }

  // Load projects by both category and budget range
  function loadProjectsByCategoryAndBudgetRange(categoryId, budgetRange) {
    console.log(
      "Loading completed projects with both filters - Category:",
      categoryId,
      "Budget Range:",
      budgetRange
    );

    ProjectService.projectbycategry(categoryId)
      .then(function (response) {
        console.log("Category API Response for combined filter:", response);

        let projectsArray = [];
        if (response && response.status === 200 && response.data) {
          if (response.data.content && Array.isArray(response.data.content)) {
            projectsArray = response.data.content;
          } else if (Array.isArray(response.data)) {
            projectsArray = response.data;
          }
        }

        console.log("Projects from category API:", projectsArray.length);

        if (projectsArray.length > 0) {
          // Filter by budget range and completed status
          const filteredProjects = projectsArray.filter(function (project) {
            const isCompleted = project.projectStatus === "Completed";
            const matchesBudgetRange = isProjectInBudgetRange(project.projectBudget, budgetRange);

            console.log(
              `${project.projectName} - Status: ${project.projectStatus}, Budget: ${project.projectBudget}, Completed: ${isCompleted}, Budget Range Match: ${matchesBudgetRange}`
            );

            return isCompleted && matchesBudgetRange;
          });

          console.log(
            "Final filtered projects (Completed + budget range match):",
            filteredProjects.length
          );
          handleClientSidePagination(filteredProjects);
        } else {
          console.log("No projects found for category, showing no projects");
          displayNoProjects();
        }
      })
      .catch(function (error) {
        console.error("Error loading projects with combined filters:", error);
        displayNoProjects();
      });
  }

  // Handle client-side pagination
  function handleClientSidePagination(allProjects) {
    // Calculate pagination info
    totalElements = allProjects.length;
    totalPages = Math.ceil(totalElements / pageSize);
    
    // Ensure currentPage is within bounds
    if (currentPage >= totalPages) {
      currentPage = Math.max(0, totalPages - 1);
    }
    
    // Get projects for current page
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const pageProjects = allProjects.slice(startIndex, endIndex);
    
    displayProjects(pageProjects);
    updatePaginationControls();
  }

  // Filter projects to show only completed ones
  function filterCompletedProjects(projects) {
    console.log("Input to filterCompletedProjects:", projects);
    console.log("Is input an array?", Array.isArray(projects));

    if (!Array.isArray(projects)) {
      console.log("Projects is not an array, returning empty array");
      return [];
    }

    const completedProjects = projects.filter(function (project) {
      const isCompleted = project.projectStatus === "Completed";
      console.log(
        `${project.projectName} - Status: "${project.projectStatus}" - Is Completed: ${isCompleted}`
      );
      return isCompleted;
    });

    console.log(
      "Filtered Completed projects:",
      completedProjects.length,
      "out of",
      projects.length
    );
    return completedProjects;
  }

  // Display projects in the UI
  function displayProjects(projects) {
    console.log("displayProjects called with:", projects);
    console.log("Number of projects to display:", projects ? projects.length : 0);

    if (!projects || projects.length === 0) {
      console.log("No projects to display, showing no projects message");
      displayNoProjects();
      return;
    }

    console.log("Generating HTML for", projects.length, "projects");
    let html = "";
    projects.forEach(function (project, index) {
      console.log(`Generating card for project ${index}:`, project.projectName);
      const cardHtml = createProjectCard(project);
      html += cardHtml;
    });

    projectList.innerHTML = html;
    console.log("Projects displayed successfully");
    
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

    const { category, budgetRange } = currentFilters;
    
    // Only show summary if filters are applied
    if (category !== '0' || budgetRange !== 'all') {
      const categoryName = getCategoryName(parseInt(category)) || 'All Categories';
      const budgetDisplay = formatBudgetRange(budgetRange);
      
      const summaryHTML = `
        <div class="filter-summary">
          <div class="filter-info">
            <span class="filter-label">Applied Filters (Completed Projects):</span>
            ${category !== '0' ? `<span class="filter-tag"><i class="fas fa-tag"></i> ${categoryName}</span>` : ''}
            ${budgetRange !== 'all' ? `<span class="filter-tag"><i class="fas fa-rupee-sign"></i> ${budgetDisplay}</span>` : ''}
            <button class="clear-filters-btn" onclick="resetFilters()">
              <i class="fas fa-times"></i> Clear All
            </button>
          </div>
          <div class="results-count">
            Showing ${((currentPage * pageSize) + 1)} to ${Math.min((currentPage + 1) * pageSize, totalElements)} of ${totalElements} completed projects
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
        <div class="pagination-controls">
    `;
    
    // Previous button
    paginationHTML += `
      <button class="pagination-btn ${currentPage === 0 ? 'disabled' : ''}" 
              data-page="${currentPage - 1}" 
              ${currentPage === 0 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Previous
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
        Next <i class="fas fa-chevron-right"></i>
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
    const budget = project.projectBudget
      ? "₹" + Number(project.projectBudget).toLocaleString("en-IN")
      : "Budget not specified";
    const title = project.projectName || project.projectTitle || "Untitled Project";
    const description = project.projectShortDescription || project.projectDescription || "No description available";
    const category = getCategoryName(project.categoryId) || "Uncategorized";
    const mainImage = project.projectMainImage || "https://via.placeholder.com/400x240/10b981/ffffff?text=Completed+Project";
    const projectId = project.projectId || project.id || 0;
    const impactPeople = project.impactpeople || 0;
    const raisedAmount = project.raisedAmount || project.projectBudget || 0;
    const progressPercentage = 100; // Completed projects are 100%

    return `
      <div class="card completed-project-card" data-project-id="${projectId}">
        <div class="status-badge status">
          <i class="fas fa-check-circle"></i> Completed
        </div>
        <div class="placeholder">
          <img src="${mainImage}" alt="${escapeHtml(title)}" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'placeholder-text\\'>No Image Available</div>';">
        </div>
        <div class="card-content">
          <div class="tag">${escapeHtml(category)}</div>
          <div class="cost">
            Total Project Budget: <span class="cost-amount">${budget}</span>
          </div>
          <h3 class="title">${escapeHtml(title)}</h3>
         
         

          <div class="completeprojectcard-footer">
            <a class="view-link" href="./donatenow.html?id=${projectId}">
              <i class="fas fa-eye"></i> View Project
            </a>
           
          </div>
        </div>
      </div>
    `;
  }

  // Enhanced display message when no projects are found
  function displayNoProjects() {
    const { category, budgetRange } = currentFilters;
    const hasFilters = category !== '0' || budgetRange !== 'all';
    
    let message = 'No completed projects found';
    if (hasFilters) {
      const categoryName = category !== '0' ? getCategoryName(parseInt(category)) : '';
      const budgetDisplay = budgetRange !== 'all' ? formatBudgetRange(budgetRange) : '';
      
      if (categoryName && budgetDisplay) {
        message += ` for ${categoryName} category in budget range ${budgetDisplay}`;
      } else if (categoryName) {
        message += ` in ${categoryName} category`;
      } else if (budgetDisplay) {
        message += ` in budget range ${budgetDisplay}`;
      }
    }
    message += '.';

    projectList.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">
          <i class="fas fa-search-minus"></i>
        </div>
        <h3>No Completed Projects Found</h3>
        <p>${message}</p>
        ${hasFilters ? `
          <div class="filter-actions">
            <button onclick="clearBudgetFilter()" class="filter-action-btn">
              <i class="fas fa-rupee-sign"></i> Clear Budget Filter
            </button>
            <button onclick="clearCategoryFilter()" class="filter-action-btn">
              <i class="fas fa-tag"></i> Clear Category Filter
            </button>
            <button onclick="resetFilters()" class="reset-btn">
              <i class="fas fa-refresh"></i> Reset All Filters
            </button>
          </div>
        ` : `
          <button onclick="resetFilters()" class="reset-btn">
            <i class="fas fa-list"></i> View All Completed Projects
          </button>
        `}
      </div>
    `;
    
    // Remove filter summary and pagination when no results
    const existingSummary = document.querySelector('.filter-summary');
    if (existingSummary) {
      existingSummary.remove();
    }
    
    const existingPagination = document.querySelector('.pagination-container');
    if (existingPagination) {
      existingPagination.remove();
    }
  }

  // Show loading state
  function showLoading() {
    projectList.innerHTML = `
      <div class="no-results">
        <div class="loading-spinner"></div>
        <p>Loading completed projects...</p>
      </div>
    `;
    
    // Remove filter summary and pagination during loading
    const existingSummary = document.querySelector('.filter-summary');
    if (existingSummary) {
      existingSummary.remove();
    }
    
    const existingPagination = document.querySelector('.pagination-container');
    if (existingPagination) {
      existingPagination.remove();
    }
  }

  // Get category name by ID
  function getCategoryName(categoryId) {
    const categories = {
      1: "Health",
      2: "Environment",
      3: "Education",
      4: "Social",
      5: "Infrastructure",
    };
    return categories[categoryId] || "Uncategorized";
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    if (typeof text !== "string") return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Helper functions for partial filter clearing
  window.clearBudgetFilter = function () {
    scaleFilter.value = 'all';
    currentFilters.budgetRange = 'all';
    currentPage = 0;
    handleFilterChange();
  };

  window.clearCategoryFilter = function () {
    categoryFilter.value = '0';
    currentFilters.category = '0';
    currentPage = 0;
    handleFilterChange();
  };

  // Global reset function
  window.resetFilters = function () {
    categoryFilter.value = "0";
    scaleFilter.value = "all";
    currentFilters = { category: '0', budgetRange: 'all' };
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
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

// Add enhanced CSS for completed projects with pagination
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8f9fa;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 30px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .page-header h1 {
    color: #333;
    font-size: 2rem;
    font-weight: 600;
    margin: 0;
  }

  .filters-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 30px;
  }
    .completeprojectcard-footer{
        padding: 0.75rem 1.25rem;
    
    border-top: 1px solid rgba(0, 0, 0, 0.125);}
.status{
    position: absolute;
    top: 0;
    right: 0;
    background: #ccc;
    color: white;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 0 0 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 10;}

  .filters-row {
    display: flex;
    gap: 20px;
    align-items: end;
  }

  .filter-group {
    flex: 1;
  }

  .filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  .filter-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    color: #333;
    cursor: pointer;
  }

  .filter-group select:focus {
    outline: none;
    border-color: #1e3a8a;
  }

  /* Project Grid - Exact match to image */
  #projectList {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .project-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #e9ecef;
  }

  .project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  .project-image {
    height: 180px;
    overflow: hidden;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .project-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .project-info {
    padding: 20px;
  }

  .project-status {
    background: #1e3a8a;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .project-budget {
    color: #666;
    font-size: 14px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .project-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 15px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 44px;
  }

  .view-details-btn {
    color: #1e3a8a;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    transition: color 0.2s ease;
  }

  .view-details-btn:hover {
    color: #1e40af;
    text-decoration: underline;
  }

  /* Pagination Styles - Clean and minimal */
  .pagination-container {
    margin-top: 40px;
  }

  .projectpagination {
    display: flex;
    justify-content: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .pagination-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .pagination-btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 44px;
    text-align: center;
    text-decoration: none;
  }

  .pagination-btn:hover:not(.disabled) {
    background: #f8f9fa;
    border-color: #1e3a8a;
    color: #1e3a8a;
  }

  .pagination-btn.active {
    background: #1e3a8a;
    color: white;
    border-color: #1e3a8a;
  }

  .pagination-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
    color: #999;
  }

  .pagination-ellipsis {
    padding: 8px 4px;
    color: #666;
    font-weight: 500;
  }

  /* No Results Styling */
  .no-results {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .no-results h3 {
    color: #333;
    margin-bottom: 10px;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .no-results p {
    color: #666;
    margin-bottom: 20px;
    font-size: 16px;
    line-height: 1.5;
  }

  .reset-btn {
    background: #1e3a8a;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s ease;
  }

  .reset-btn:hover {
    background: #1e40af;
  }

  /* Loading Animation */
  .loading-spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #1e3a8a;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Filter Summary */
  .filter-summary {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 25px;
    font-size: 14px;
  }

  .filter-info {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .filter-label {
    font-weight: 600;
    color: #1565c0;
  }

  .filter-tag {
    background: #1e3a8a;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .clear-filters-btn {
    background: #f44336;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: background 0.2s ease;
    margin-left: auto;
  }

  .clear-filters-btn:hover {
    background: #d32f2f;
  }

  .results-count {
    color: #666;
    font-size: 13px;
    margin-top: 8px;
    font-weight: 500;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
      padding: 15px;
    }

    .filters-row {
      flex-direction: column;
      gap: 15px;
    }

    .filter-group {
      width: 100%;
    }

    #projectList {
      grid-template-columns: 1fr;
      gap: 15px;
    }

    .project-info {
      padding: 15px;
    }

    .pagination-controls {
      gap: 5px;
    }

    .pagination-btn {
      padding: 6px 10px;
      font-size: 13px;
      min-width: 36px;
    }

    .filter-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .clear-filters-btn {
      margin-left: 0;
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .page-header {
      padding: 20px;
    }

    .page-header h1 {
      font-size: 1.5rem;
    }

    .filters-container {
      padding: 15px;
    }

    .project-info {
      padding: 12px;
    }

    .project-title {
      font-size: 15px;
      min-height: 40px;
    }

    .projectpagination {
      padding: 15px;
    }
  }
`;
document.head.appendChild(style);


// const style = document.createElement('style');
// style.textContent = `
//   .filter-summary {
//     background: linear-gradient(135deg, #f0fdf4, #dcfce7);
//     border: 2px solid #bbf7d0;
//     border-radius: 15px;
//     padding: 20px 25px;
//     margin-bottom: 30px;
//     box-shadow: 0 4px 15px rgba(16, 185, 129, 0.1);
//   }
  
//   .filter-info {
//     display: flex;
//     align-items: center;
//     gap: 15px;
//     flex-wrap: wrap;
//     margin-bottom: 12px;
//   }
  
//   .filter-label {
//     font-weight: 700;
//     color: #065f46;
//     font-size: 15px;
//   }
  
//   .filter-tag {
//     background: linear-gradient(135deg, #10b981, #059669);
//     color: white;
//     padding: 8px 16px;
//     border-radius: 25px;
//     font-size: 13px;
//     font-weight: 600;
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
//   }
  
//   .clear-filters-btn {
//     background: #ef4444;
//     color: white;
//     border: none;
//     padding: 8px 16px;
//     border-radius: 25px;
//     font-size: 13px;
//     font-weight: 600;
//     cursor: pointer;
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     transition: all 0.3s ease;
//     margin-left: auto;
//   }
  
//   .clear-filters-btn:hover {
//     background: #dc2626;
//     transform: translateY(-1px);
//     box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
//   }
  
//   .results-count {
//     color: #6b7280;
//     font-size: 14px;
//     font-weight: 500;
//   }
  
//   .completed-project-card {
//     transition: all 0.4s ease;
//     border: 2px solid transparent;
//   }
  
//   .completed-project-card:hover {
//     border-color: #10b981;
//     transform: translateY(-5px);
//     box-shadow: 0 15px 35px rgba(16, 185, 129, 0.2);
//   }
  
//   .status-badge {
//     position: absolute;
//     top: 0;
//     right: 0;
//     background: linear-gradient(135deg, #0044cc, #103070);
//     color: white;
//     padding: 8px 16px;
//     font-size: 12px;
//     font-weight: 700;
//     border-radius: 0 15px 0 15px;
//     text-transform: uppercase;
//     letter-spacing: 0.5px;
//     z-index: 10;
//     box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);
//   }
  
//   .completion-progress {
//     background: linear-gradient(135deg, #f0fdf4, #dcfce7);
//     padding: 15px;
//     border-radius: 12px;
//     margin-bottom: 20px;
//     border: 1px solid #bbf7d0;
//   }
  
//   .completion-text {
//     color: #065f46;
//     font-weight: 600;
//     font-size: 14px;
//     display: flex;
//     align-items: center;
//     gap: 8px;
//   }
  
//   .completion-badge {
//     background: linear-gradient(135deg, #10b981, #059669);
//     color: white;
//     padding: 4px 12px;
//     border-radius: 20px;
//     font-size: 12px;
//     font-weight: 700;
//     display: inline-flex;
//     align-items: center;
//   }
  
//   .progress-fill.completed {
//     background: linear-gradient(90deg, #10b981, #059669, #10b981);
//     animation: shimmer 2s ease-in-out infinite;
//   }
  
//   @keyframes shimmer {
//     0%, 100% { background-position: 0% 50%; }
//     50% { background-position: 100% 50%; }
//   }
  
//   .card-footer {
//     display: flex;
//     align-items: center;
//     gap: 12px;
//     justify-content: space-between;
//   }
  
//   .impact-info {
//     background: linear-gradient(135deg, #ecfdf5, #d1fae5);
//     color: #065f46;
//     padding: 8px 12px;
//     border-radius: 8px;
//     font-size: 12px;
//     font-weight: 600;
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     border: 1px solid #bbf7d0;
//     transition: all 0.3s ease;
//   }
  
//   .impact-info:hover {
//     background: linear-gradient(135deg, #10b981, #059669);
//     color: white;
//   }
  
//   /* Pagination Styles */
//   .pagination-container {
//     margin-top: 40px;
//   }
  
//   .projectpagination {
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     background: white;
//     padding: 25px;
//     border-radius: 15px;
//     box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
//     border: 2px solid #f0fdf4;
//   }
  
//   .pagination-controls {
//     display: flex;
//     gap: 8px;
//     align-items: center;
//     flex-wrap: wrap;
//     justify-content: center;
//   }
  
//   .pagination-btn {
//     padding: 12px 16px;
//     border: 2px solid #e5e7eb;
//     background: white;
//     color: #374151;
//     border-radius: 8px;
//     cursor: pointer;
//     font-weight: 600;
//     transition: all 0.3s ease;
//     font-size: 14px;
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//     min-width: 44px;
//     justify-content: center;
//   }
  
//   .pagination-btn:hover:not(.disabled) {
//     background: #f0fdf4;
//     border-color: #10b981;
//     color: #065f46;
//     transform: translateY(-1px);
//   }
  
//   .pagination-btn.active {
//     background: linear-gradient(135deg, #10b981, #059669);
//     color: white;
//     border-color: #10b981;
//     box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//   }
  
//   .pagination-btn.disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//     background: #f9fafb;
//     color: #9ca3af;
//   }
  
//   .pagination-ellipsis {
//     padding: 12px 8px;
//     color: #9ca3af;
//     font-weight: 600;
//   }
  
//   /* No Results Styling */
//   .no-results {
//     text-align: center;
//     padding: 80px 20px;
//     background: white;
//     border-radius: 20px;
//     box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
//     border: 2px solid #f0fdf4;
//   }
  
//   .no-results-icon i {
//     font-size: 64px;
//     color: #d1d5db;
//     margin-bottom: 25px;
//   }
  
//   .no-results h3 {
//     color: #374151;
//     margin-bottom: 15px;
//     font-size: 28px;
//     font-weight: 700;
//   }
  
//   .no-results p {
//     color: #6b7280;
//     font-size: 17px;
//     line-height: 1.6;
//     margin-bottom: 30px;
//     max-width: 600px;
//     margin-left: auto;
//     margin-right: auto;
//   }
  
//   .filter-actions {
//     display: flex;
//     gap: 12px;
//     justify-content: center;
//     flex-wrap: wrap;
//     margin-bottom: 20px;
//   }
  
//   .filter-action-btn {
//     background: #f3f4f6;
//     color: #374151;
//     border: 2px solid #e5e7eb;
//     padding: 10px 16px;
//     border-radius: 8px;
//     cursor: pointer;
//     font-size: 14px;
//     font-weight: 600;
//     transition: all 0.3s ease;
//     display: inline-flex;
//     align-items: center;
//     gap: 6px;
//   }
  
//   .filter-action-btn:hover {
//     background: #e5e7eb;
//     border-color: #d1d5db;
//     transform: translateY(-1px);
//   }
  
//   .reset-btn {
//     background: linear-gradient(135deg, #10b981, #059669);
//     color: white;
//     border: none;
//     padding: 12px 24px;
//     border-radius: 8px;
//     cursor: pointer;
//     font-size: 15px;
//     font-weight: 700;
//     transition: all 0.3s ease;
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
//   }
  
//   .reset-btn:hover {
//     background: linear-gradient(135deg, #059669, #047857);
//     transform: translateY(-2px);
//     box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
//   }
  
//   /* Loading Animation */
//   .loading-spinner {
//     border: 5px solid #f3f4f6;
//     border-top: 5px solid #10b981;
//     border-radius: 50%;
//     width: 60px;
//     height: 60px;
//     animation: spin 1s linear infinite;
//     margin: 0 auto 25px;
//   }
  
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
  
//   /* Project Grid Layout */
//   #projectList {
//     display: grid;
//     grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
//     gap: 25px;
//     margin-bottom: 40px;
//   }
  
//   .card {
//     background: white;
//     border-radius: 15px;
//     overflow: hidden;
//     box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
//     transition: all 0.4s ease;
//     position: relative;
//     height: fit-content;
//   }
  
//   .placeholder {
//     height: 200px;
//     overflow: hidden;
//     position: relative;
//   }
  
//   .placeholder img {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//     transition: transform 0.4s ease;
//   }
  
//   .card:hover .placeholder img {
//     transform: scale(1.08);
//   }
  
//   .placeholder-text {
//     height: 200px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     background: linear-gradient(135deg, #f0fdf4, #dcfce7);
//     color: #065f46;
//     font-weight: 600;
//     font-size: 16px;
//   }
  
//   .card-content {
//     padding: 25px;
//   }
  
//   .tag {
//     background: linear-gradient(135deg, #ecfdf5, #d1fae5);
//     color: #065f46;
//     padding: 8px 16px;
//     border-radius: 25px;
//     font-size: 13px;
//     font-weight: 700;
//     display: inline-block;
//     margin-bottom: 15px;
//     border: 1px solid #bbf7d0;
//   }
  
//   .cost {
//     color: #059669;
//     font-weight: 700;
//     margin-bottom: 12px;
//     font-size: 16px;
//   }
  
//   .cost-amount {
//     font-size: 18px;
//     color: #065f46;
//   }
  
//   .title {
//     font-size: 20px;
//     font-weight: 800;
//     color: #064e3b;
//     margin: 15px 0;
//     line-height: 1.3;
//     display: -webkit-box;
//     -webkit-line-clamp: 2;
//     -webkit-box-orient: vertical;
//     overflow: hidden;
//   }
  
//   .description {
//     color: #6b7280;
//     font-size: 15px;
//     line-height: 1.7;
//     margin-bottom: 20px;
//   }
  
//   .view-link {
//     background: linear-gradient(135deg, #10b981, #059669);
//     color: white;
//     padding: 12px 24px;
//     border-radius: 10px;
//     text-decoration: none;
//     font-weight: 700;
//     transition: all 0.3s ease;
//     font-size: 14px;
//     display: inline-flex;
//     align-items: center;
//     gap: 8px;
//     box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
//   }
  
//   .view-link:hover {
//     background: linear-gradient(135deg, #059669, #047857);
//     color: white;
//     transform: translateY(-2px);
//     box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
//   }
  
//   /* Responsive Design */
//   @media (max-width: 768px) {
//     .filter-info {
//       flex-direction: column;
//       align-items: flex-start;
//       gap: 10px;
//     }
    
//     .clear-filters-btn {
//       margin-left: 0;
//       align-self: flex-end;
//     }
    
//     .filter-summary {
//       padding: 15px 20px;
//     }
    
//     #projectList {
//       grid-template-columns: 1fr;
//       gap: 20px;
//     }
    
//     .pagination-controls {
//       gap: 5px;
//     }
    
//     .pagination-btn {
//       padding: 10px 12px;
//       font-size: 13px;
//       min-width: 40px;
//     }
    
//     .filter-actions {
//       flex-direction: column;
//       align-items: center;
//     }
    
//     .filter-action-btn, .reset-btn {
//       width: 100%;
//       max-width: 250px;
//       justify-content: center;
//     }
//   }
  
//   @media (max-width: 480px) {
//     .card-content {
//       padding: 20px;
//     }
    
//     .projectpagination {
//       padding: 20px 15px;
//     }
    
//     .pagination-btn {
//       padding: 8px 10px;
//       font-size: 12px;
//       min-width: 36px;
//     }
//   }
// `;
// document.head.appendChild(style);



































// // Project filtering and display functionality
// document.addEventListener("DOMContentLoaded", function () {
//   const categoryFilter = document.getElementById("categoryFilter");
//   const scaleFilter = document.getElementById("scaleFilter");
//   const projectList = document.getElementById("projectList");

//   // Initialize the page
//   loadProjects();

//   // Event listeners for filters
//   categoryFilter.addEventListener("change", handleFilterChange);
//   scaleFilter.addEventListener("change", handleFilterChange);

//   // Main function to handle filter changes
//   function handleFilterChange() {
//     const selectedCategory = categoryFilter.value;
//     const selectedBudget = scaleFilter.value;

//     // Show loading state
//     showLoading();

//     // Determine which API to call based on selections
//     if (selectedCategory === "0" && selectedBudget === "all") {
//       // No filters selected - load all Completed projects
//       loadProjects();
//     } else if (selectedCategory !== "0" && selectedBudget === "all") {
//       // Only category selected
//       loadProjectsByCategory(selectedCategory);
//     } else if (selectedCategory === "0" && selectedBudget !== "all") {
//       // Only budget selected
//       loadProjectsByBudget(selectedBudget);
//     } else {
//       // Both category and budget selected
//       loadProjectsByCategoryAndBudget(selectedCategory, selectedBudget);
//     }
//   }

//   // Load all projects (default)
//   function loadProjects() {
//     console.log("Loading all projects...");
//     ProjectService.listAll(0, 1000)
//       .then(function (response) {
//         console.log("List All API Response:", response);

//         // Handle the specific response structure from your API
//         if (
//           response &&
//           response.status === 200 &&
//           response.data &&
//           response.data.content &&
//           Array.isArray(response.data.content)
//         ) {
//           console.log("Total projects received:", response.data.content.length);
//           const CompletedProjects = filterCompletedProjects(
//             response.data.content
//           );
//           console.log(
//             "Completed projects after filter:",
//             CompletedProjects.length
//           );
//           displayProjects(CompletedProjects);
//         } else {
//           console.log("No valid data found in response");
//           displayNoProjects();
//         }
//       })
//       .catch(function (error) {
//         console.error("Error loading projects:", error);
//         displayNoProjects();
//       });
//   }

//   // Load projects by category
//   function loadProjectsByCategory(categoryId) {
//     ProjectService.projectbycategry(categoryId)
//       .then(function (response) {
//         console.log("Category API Response:", response);

//         if (response && response.status === 200 && response.data) {
//           let projectsArray = [];
//           if (response.data.content && Array.isArray(response.data.content)) {
//             projectsArray = response.data.content;
//           } else if (Array.isArray(response.data)) {
//             projectsArray = response.data;
//           }

//           if (projectsArray.length > 0) {
//             const CompletedProjects = filterCompletedProjects(projectsArray);
//             displayProjects(CompletedProjects);
//           } else {
//             displayNoProjects();
//           }
//         } else {
//           displayNoProjects();
//         }
//       })
//       .catch(function (error) {
//         console.error("Error loading projects by category:", error);
//         displayNoProjects();
//       });
//   }

//   // Updated loadProjectsByBudget function for completed projects
//   function loadProjectsByBudget(budget) {
//     // Get all projects and filter by budget on client side
//     ProjectService.listAll(0, 1000) // Get more data to ensure we have all results
//       .then(function (response) {
//         console.log("Budget API Response:", response);

//         if (response && response.status === 200) {
//           let projectsArray = [];
//           if (
//             response.data &&
//             response.data.content &&
//             Array.isArray(response.data.content)
//           ) {
//             projectsArray = response.data.content;
//           } else if (Array.isArray(response.data)) {
//             projectsArray = response.data;
//           }

//           if (projectsArray.length > 0) {
//             // Filter by budget (less than or equal to selected budget) and completed status
//             const filteredProjects = projectsArray.filter(function (project) {
//               const isCompleted = project.projectStatus === "Completed";
//               const matchesBudget = project.projectBudget <= parseInt(budget);
//               return isCompleted && matchesBudget;
//             });

//             displayProjects(filteredProjects);
//           } else {
//             displayNoProjects();
//           }
//         } else {
//           displayNoProjects();
//         }
//       })
//       .catch(function (error) {
//         console.error("Error loading projects by budget:", error);
//         displayNoProjects();
//       });
//   }

//   // Updated loadProjectsByCategoryAndBudget function for completed projects
//   function loadProjectsByCategoryAndBudget(categoryId, budget) {
//     console.log(
//       "Loading projects with both filters - Category:",
//       categoryId,
//       "Budget:",
//       budget
//     );

//     // Strategy: First filter by category (usually fewer results), then filter by budget locally
//     ProjectService.projectbycategry(categoryId)
//       .then(function (response) {
//         console.log("Category API Response for combined filter:", response);

//         let projectsArray = [];
//         if (response && response.status === 200 && response.data) {
//           if (response.data.content && Array.isArray(response.data.content)) {
//             projectsArray = response.data.content;
//           } else if (Array.isArray(response.data)) {
//             projectsArray = response.data;
//           }
//         }

//         console.log("Projects from category API:", projectsArray.length);

//         if (projectsArray.length > 0) {
//           // Filter by budget (less than or equal to selected budget) and Completed status
//           const filteredProjects = projectsArray.filter(function (project) {
//             const isCompleted = project.projectStatus === "Completed";
//             const matchesBudget = project.projectBudget <= parseInt(budget);

//             console.log(
//               `${project.projectName} - Status: ${
//                 project.projectStatus
//               }, Budget: ${project.projectBudget}, Matches: ${
//                 isCompleted && matchesBudget
//               }`
//             );

//             return isCompleted && matchesBudget;
//           });

//           console.log(
//             "Final filtered projects (Completed + budget match):",
//             filteredProjects.length
//           );
//           displayProjects(filteredProjects);
//         } else {
//           console.log("No projects found for category, showing no projects");
//           displayNoProjects();
//         }
//       })
//       .catch(function (error) {
//         console.error("Error loading projects with combined filters:", error);
//         displayNoProjects();
//       });
//   }
//   // Filter projects to show only Completed ones
//   function filterCompletedProjects(projects) {
//     console.log("Input to filterCompletedProjects:", projects);
//     console.log("Is input an array?", Array.isArray(projects));

//     if (!Array.isArray(projects)) {
//       console.log("Projects is not an array, returning empty array");
//       return [];
//     }

//     // Log each project's status
//     projects.forEach(function (project, index) {
//       console.log(`Project ${index}:`, {
//         name: project.projectName,
//         status: project.projectStatus,
//         id: project.projectId,
//       });
//     });

//     const CompletedProjects = projects.filter(function (project) {
//       const isCompleted = project.projectStatus === "Completed";
//       console.log(
//         `${project.projectName} - Status: "${project.projectStatus}" - Is Completed: ${isCompleted}`
//       );
//       return isCompleted;
//     });

//     console.log(
//       "Filtered Completed projects:",
//       CompletedProjects.length,
//       "out of",
//       projects.length
//     );
//     console.log("Completed projects:", CompletedProjects);
//     return CompletedProjects;
//   }

//   // Display projects in the UI
//   function displayProjects(projects) {
//     console.log("displayProjects called with:", projects);
//     console.log(
//       "Number of projects to display:",
//       projects ? projects.length : 0
//     );

//     if (!projects || projects.length === 0) {
//       console.log("No projects to display, showing no projects message");
//       displayNoProjects();
//       return;
//     }

//     console.log("Generating HTML for", projects.length, "projects");
//     let html = "";
//     projects.forEach(function (project, index) {
//       console.log(`Generating card for project ${index}:`, project.projectName);
//       const cardHtml = createProjectCard(project);
//       console.log(`Card HTML generated for ${project.projectName}`);
//       html += cardHtml;
//     });

//     console.log("Setting projectList innerHTML...");
//     projectList.innerHTML = html;
//     console.log("Projects displayed successfully");
//   }

//   // Create HTML for a single project card using your CSS classes
//   function createProjectCard(project) {
//     const budget = project.projectBudget
//       ? "₹" + Number(project.projectBudget).toLocaleString("en-IN")
//       : "Budget not specified";
//     const title =
//       project.projectName || project.projectTitle || "Untitled Project";
//     const description =
//       project.projectShortDescription ||
//       project.projectDescription ||
//       "No description available";
//     const category = getCategoryName(project.categoryId) || "Uncategorized";
//     const mainImage =
//       project.projectMainImage ||
//       "https://via.placeholder.com/300x180?text=No+Image";
//     const projectId = project.projectId || project.id || 0;
//     const impactPeople = project.impactpeople || 0;
//     const raisedAmount = project.raisedAmount || 0;
//     const progressPercentage = project.projectBudget
//       ? ((raisedAmount / project.projectBudget) * 100).toFixed(1)
//       : 0;

//     console.log(
//       `Creating card for ${title} with status: "${project.projectStatus}"`
//     );

//     return `
//             <div class="card" data-project-id="${projectId}" style="position: relative;">
//                 <div class="status ${
//                   project.projectStatus === "Completed"
//                     ? "Completed"
//                     : "scrutiny"
//                 }" style="position: absolute; top: 0; right: 0; background: #ccc; color: white; padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 0 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px; z-index: 10;">
//                     ${project.projectStatus || "Unknown"}
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
//                     ${
//                       raisedAmount > 0
//                         ? `
//                         <div class="donate-progress">
//                             <div class="progress-info">
//                                 <span class="raised-amount">₹${Number(
//                                   raisedAmount
//                                 ).toLocaleString("en-IN")} raised</span>
//                                 <span class="target-amount">of ${budget}</span>
//                             </div>
//                             <div class="progress-bar">
//                                 <div class="progress-fill" style="width: ${Math.min(
//                                   progressPercentage,
//                                   100
//                                 )}%"></div>
//                             </div>
//                         </div>
//                     `
//                         : ""
//                     }
//                     <a class="view-link" href="./donatenow.html?id=${projectId}">View Details</a>
//                 </div>
//             </div>
//         `;
//   }

//   // Display message when no projects are found
//   function displayNoProjects() {
//     projectList.innerHTML = `
//             <div class="no-results">
//                              <p>No Completed projects match your current filter criteria.</p>
//                 <button onclick="resetFilters()" style="background: #0A1E46; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: 600;">Reset Filters</button>
//             </div>
//         `;
//   }

//   // Show loading state
//   function showLoading() {
//     projectList.innerHTML = `
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
//   }

//   // Get category name by ID
//   function getCategoryName(categoryId) {
//     const categories = {
//       1: "Health",
//       2: "Environment",
//       3: "Education",
//       4: "Social",
//       5: "Infrastructure",
//     };
//     return categories[categoryId] || "Uncategorized";
//   }

//   // Escape HTML to prevent XSS
//   function escapeHtml(text) {
//     if (typeof text !== "string") return "";
//     const div = document.createElement("div");
//     div.textContent = text;
//     return div.innerHTML;
//   }

//   // Global reset function
//   window.resetFilters = function () {
//     categoryFilter.value = "0";
//     scaleFilter.value = "all";
//     loadProjects();
//   };
// });

// // Prevent form submission on Enter key
// document.addEventListener("keydown", function (e) {
//   if (e.key === "Enter") {
//     e.preventDefault();
//   }
// });
