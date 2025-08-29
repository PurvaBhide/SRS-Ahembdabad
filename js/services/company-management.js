// company-management.js

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // First load categories for sidebar
  loadCategories();
  
  // Then load all companies by default
  loadCompanies();
  
  // Setup search functionality
  setupSearch();
});

function loadCategories() {
  // This will find the sidebar in either view
  const sidebarCategories = document.querySelector('#projectsView .company-categories, .company-categories');
  if (!sidebarCategories) return;
  
  sidebarCategories.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm"></div></div>';

  Api.category.listAll()
    .then(response => {
      if (!response.data) throw new Error('Invalid categories data');
      renderCategories(response.data);
    })
    .catch(error => {
      console.error('Error loading categories:', error);
      sidebarCategories.innerHTML = '<div class="alert alert-danger">Failed to load categories</div>';
    });
}

// Icon mapping for each category
const categoryIcons = {
  "Health": "fas fa-heartbeat",
  "Environment": "fas fa-leaf",
  "Education": "fas fa-book",
  "Infrastructure": "fas fa-building",
  "Social": "fas fa-users"
};

// Render categories in sidebar with icons
function renderCategories(categories) {
  const sidebarCategories = document.querySelector('.company-categories');
  sidebarCategories.innerHTML = '';

  // Add "All Agencies" option
  const allItem = document.createElement('div');
  allItem.className = 'company-category active';
  allItem.innerHTML = `<i class="fas fa-globe me-2"></i> All Agencies`;
  allItem.addEventListener('click', () => {
    document.querySelectorAll('.company-category').forEach(c => c.classList.remove('active'));
    allItem.classList.add('active');
     loadCompanies();
  });
  sidebarCategories.appendChild(allItem);

  // Add categories from API
  categories.forEach(category => {
    const iconClass = categoryIcons[category.categoryName] || 'fas fa-tag';
    const categoryItem = document.createElement('div');
    categoryItem.className = 'company-category';
    categoryItem.dataset.id = category.id;
    categoryItem.innerHTML = `<i class="${iconClass} me-2"></i> ${category.categoryName}`;

    categoryItem.addEventListener('click', () => {
      document.querySelectorAll('.company-category').forEach(c => c.classList.remove('active'));
      categoryItem.classList.add('active');
       loadCompanies(category.id);
    });

    sidebarCategories.appendChild(categoryItem);
  });
}


// Load and render companies
function loadCompanies(categoryId = null) {
  const companiesContainer = document.querySelector('.row.g-4');
  companiesContainer.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';

  // Use different endpoints based on whether categoryId is provided
  const apiCall = categoryId 
    ? Api.company.getByCategogyId(categoryId)  // Use specific endpoint for category
    : Api.company.listAll();                 // Use general endpoint for all companies

  apiCall
    .then(response => {
      if (!response.data?.content) throw new Error('Invalid companies data');
      renderCompanies(response.data.content);
    })
    .catch(error => {
      console.error('Error loading companies:', error);
      
      // Check for 404 error with specific message about no companies
      if (error.response && error.response.status === 404 && 
          error.response.data?.message?.includes('No companies found for category ID')) {
        companiesContainer.innerHTML = `
          <div class="col-12 text-center py-4">
            <div class="alert alert-info">No companies found for this category</div>
          </div>
        `;
      } else {
        // Generic error message for other cases
        companiesContainer.innerHTML = `
          <div class="col-12 text-center py-4">
            <div class="alert alert-danger">No companies found</div>
          </div>
        `;
      }
    });
}
// Render company cards
function renderCompanies(companies) {
  const companiesContainer = document.querySelector('.row.g-4');
  companiesContainer.innerHTML = '';

  if (companies.length === 0) {
    companiesContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-info">No companies found</div>
      </div>
    `;
    return;
  }

  companies.forEach(company => {
    const companyType = company.status === 'PSU' ? 'psu' : 'private';
    const projectsCount = company.projectsCount || 0;
    
    const card = document.createElement('div');
    card.className = 'col-xl-4 col-lg-6 col-md-6';
    card.innerHTML = `
      <div class="company-card">
        <h3 class="company-name">${company.companyname}</h3>
        <p class="company-description" style="font-size:12px ;  width: 250px; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis;"><span style="font-weight:600;color:#0a1e46">Representative Name:</span> ${company.authcomprepresentativename }</p>
        <p class="company-description" style="font-size:12px ;  width: 250px; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis;"><span style="font-weight:600 ;color:#0a1e46">Email:</span> ${company.authcomprepresentativeemail}</p>
        <p class="company-info">
              <a href="${company.companyurl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none;">
        <i class="fas fa-globe me-2"></i> ${company.companyurl}
      </a>
        </p>

        
      
        <div class="company-actions d-flex justify-content-between">
          <button class="btn btn-sm company-btn-primary button-read-more" data-id="${company.companieId}">View Projects</button>
        </div>
      </div>
    `;
    
    companiesContainer.appendChild(card);
  });

  // Attach event listeners to buttons
  document.querySelectorAll('.company-btn-outline').forEach(btn => {
    btn.addEventListener('click', () => viewCompanyProfile(btn.dataset.id));
  });
  
  document.querySelectorAll('.company-btn-primary').forEach(btn => {
    btn.addEventListener('click', () => viewCompanyProjects(btn.dataset.id));
  });
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.querySelector('.company-search-bar input');
  searchInput.addEventListener('input', function() {
    const term = this.value.toLowerCase();
    document.querySelectorAll('.company-card').forEach(card => {
      const name = card.querySelector('.company-name').textContent.toLowerCase();
      card.closest('.col-xl-4').style.display = name.includes(term) ? 'block' : 'none';
    });
  });
}

// Placeholder functions for view actions
function viewCompanyProfile(companyId) {
  console.log('View profile for company:', companyId);
  // Implement profile viewing logic
}

function viewCompanyProjects(companyId) {
  // Show loading state
  const companiesContainer = document.querySelector('.row.g-4');
  companiesContainer.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';
  
  // Get company details first (to show name in header)
  Api.company.getById(companyId)
    .then(companyResponse => {
      if (!companyResponse.data) throw new Error('Invalid company data');
      
      const company = companyResponse.data;
      
      // Now get projects for this company
      return Api.company.getById(companyId)
        .then(projectsResponse => {
          if (!projectsResponse.data) throw new Error('Invalid projects data');
          
          // Hide companies view and show projects view
          document.querySelector('section.ftco-section').classList.add('d-none');
          document.getElementById('projectsView').classList.remove('d-none');
          
          // Set company name in header
          document.getElementById('projectsCompanyName').textContent = company.companyname;
          
          // Render projects
          renderProjects(projectsResponse.data, company);
          
          // JUST ADD THIS LINE TO RELOAD CATEGORIES IN SIDEBAR
          loadCategories();
        });
    })
    .catch(error => {
      console.error('Error loading company projects:', error);
      companiesContainer.innerHTML = `
        <div class="col-12 text-center py-4">
          <div class="alert alert-danger">Failed to load projects</div>
        </div>
      `;
    });
}


function renderProjects(apiResponse, company) {
  console.log(apiResponse, "API Response");
  
  // Access the projects array from the response
  const projects = Array.isArray(apiResponse) ? apiResponse : apiResponse.data || [];
  const tableBody = document.getElementById('projectsTableBody');
  

  // Clear existing rows
  tableBody.innerHTML = '';
  
  if (projects.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">No projects found for this company</td>
      </tr>
    `;
    return;
  }
  
  projects.forEach(project => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${project.projectName || project.projectShortDescription || 'Unnamed Project'}</td>
      <td>${project.projectDEpartmentName || 'N/A'}</td>
      <td>
        <span class="badge ${getStatusBadgeClass(project.projectStatus)}">
          ${project.projectStatus || 'UNKNOWN'}
        </span>
      </td>
      <td>${project.projectLocation || 'N/A'}</td>
      <td>${formatCurrency(project.projectBudget)}</td>
      <td>
        <button class="btn btn-sm button-read-more view-project-btn" 
                data-id="${project.projectId}"
                data-project='${JSON.stringify(project)}'>
          View Details
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  // Add event listeners to project view buttons
  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectData = JSON.parse(btn.dataset.project);
      viewProjectDetails(projectData.projectId, projectData);
    });
  });
  
  // Add back button functionality
  document.getElementById('backToCompanies').addEventListener('click', () => {
    // Hide projects view
    document.getElementById('projectsView').classList.add('d-none');
    
    // Show companies view
    document.querySelector('section.ftco-section').classList.remove('d-none');
    
    // Reload companies (optional - only if you need fresh data)
    loadCompanies();
  });
}

// Helper functions
function getStatusBadgeClass(status) {
  if (!status) return 'bg-secondary';
  
  status = status.toLowerCase();
  switch (status) {
    case 'active': return 'bg-success text-white';
    case 'completed': return 'bg-info text-white';
    case 'pending': return 'bg-warning text-white';
    case 'cancelled': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
}

function formatCurrency(amount) {
  if (!amount) return 'N/A';
  
  // Convert string to number if needed
  const numericValue = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]/g, '')) 
    : amount;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numericValue);
}

function viewProjectDetails(projectId, projectData) {
  // Redirect to donatenow.html with the project ID as a query parameter
  window.location.href = `donatenow.html?id=${projectId}`;
}