// ngo-management.js

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // First load categories for sidebar
  loadCategories();
  
  // Then load all NGOs by default
  loadNGOs();
  
  // Setup search functionality
  setupSearch();
});

// Load and render categories in sidebar
function loadCategories() {
  const sidebarCategories = document.querySelector('.agency-categories');
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

// Define icon mapping for known categories
const categoryIcons = {
  "Health": "fas fa-heartbeat",
  "Environment": "fas fa-leaf",
  "Education": "fas fa-book",
  "Infrastructure": "fas fa-building",
  "Social": "fas fa-users"
};

function renderCategories(categories) {
  const sidebarCategories = document.querySelector('.agency-categories');
  sidebarCategories.innerHTML = '';

  // Add "All Agencies" option
  const allItem = document.createElement('div');
  allItem.className = 'agency-category active';
  allItem.innerHTML = `<i class="fas fa-globe me-2"></i> All Agencies`;
  allItem.addEventListener('click', () => {
    document.querySelectorAll('.agency-category').forEach(c => c.classList.remove('active'));
    allItem.classList.add('active');
    loadNGOs();
  });
  sidebarCategories.appendChild(allItem);

  // Add categories from API
  categories.forEach(category => {
    const iconClass = categoryIcons[category.categoryName] || 'fas fa-tag';
    const categoryItem = document.createElement('div');
    categoryItem.className = 'agency-category';
    categoryItem.dataset.id = category.id;
    categoryItem.innerHTML = `<i class="${iconClass} me-2"></i> ${category.categoryName}`;

    categoryItem.addEventListener('click', () => {
      document.querySelectorAll('.agency-category').forEach(c => c.classList.remove('active'));
      categoryItem.classList.add('active');
      loadNGOs(category.id);
    });

    sidebarCategories.appendChild(categoryItem);
  });
}


// Load and render NGOs
function loadNGOs(categoryId = null) {
  const ngosContainer = document.querySelector('.col-lg-9.col-md-8');
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'row g-4';
  ngosContainer.querySelector('.row.g-4')?.remove();
  ngosContainer.insertBefore(cardsContainer, ngosContainer.querySelector('nav'));
  
  cardsContainer.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';

  // Use different endpoints based on whether categoryId is provided
   const apiCall = categoryId 
    ? NgoService.getById(categoryId)  // Single NGO response
    : NgoService.listAll(0, 10);     // List of NGOs response

  apiCall
    .then(response => {
      console.log("API Response:", response);
      
      // Handle both single NGO and list responses
      const ngosData = categoryId 
        ? [response]  // Wrap single NGO in array for consistent processing
        : response.data?.content;  // Use content array for listAll
      
      if (!ngosData) throw new Error('Invalid NGOs data');
      renderNGOs(ngosData);
    })
    .catch(error => {
      console.error('Error loading NGOs:', error);
      
      // Check for 404 error with specific message about no NGOs
      if (error.response && error.response.status === 404 && 
          error.response.data?.message?.includes('No NGOs found for category ID')) {
        cardsContainer.innerHTML = `
          <div class="col-12 text-center py-4">
            <div class="alert alert-info">No NGOs found for this category</div>
          </div>
        `;
      } else {
        // Generic error message for other cases
        cardsContainer.innerHTML = `
          <div class="col-12 text-center py-4">
            <div class="alert alert-danger">No NGOs found</div>
          </div>
        `;
      }
    });
}

// Render NGO cards
function renderNGOs(ngos) {
  const ngosContainer = document.querySelector('.row.g-4');
  ngosContainer.innerHTML = '';

  if (ngos.length === 0) {
    ngosContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-info">No NGOs found</div>
      </div>
    `;
    return;
  }

  ngos.forEach(ngo => {
    console.log("NGO Data:", ngo); // For debugging
    
    const card = document.createElement('div');
    card.className = 'col-xl-4 col-lg-6 col-md-6';
    card.innerHTML = `
      <div class="agency-card">
        <span class="agency-type ${ngo.status.toLowerCase()}">${ngo.status || 'NGO'}</span>
        <h3 class="agency-name">${ngo.organizationName || 'No name provided'}</h3>
        
        <p class="agency-info">
          <i class="fas fa-envelope me-2"></i> ${ngo.emailId || 'No email provided'}
        </p>
        
        <p class="agency-info">
          <i class="fas fa-phone me-2"></i> ${ngo.contactNumber || 'No contact number'}
        </p>
        
        <p class="agency-info">
          <i class="fas fa-user me-2"></i> Contact: ${ngo.nameOfContactPerson || 'Not specified'}
        </p>
        
        <p class="agency-info">
          <i class="fas fa-calendar me-2"></i> Age: ${ngo.ageOfOrganization || '0'} years
        </p>
        
        <p class="agency-info">
          <i class="fas fa-tag me-2"></i> Category: ${ngo.category?.categoryName || 'Not categorized'}
        </p>
        
        <div class="agency-actions d-flex justify-content-between">
          <button class="btn btn-sm agency-btn-primary view-projects-btn" data-id="${ngo.id}">View Projects</button>
        </div>
      </div>
    `;
    
    ngosContainer.appendChild(card);
  });

  // Attach event listeners to buttons
  document.querySelectorAll('.agency-btn-outline').forEach(btn => {
    btn.addEventListener('click', () => viewNGOProfile(btn.dataset.id));
  });
  
  document.querySelectorAll('.agency-btn-primary').forEach(btn => {
    btn.addEventListener('click', () => viewNGOProjects(btn.dataset.id));
  });
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.querySelector('.agency-search-bar input');
  searchInput.addEventListener('input', function() {
    const term = this.value.toLowerCase();
    document.querySelectorAll('.agency-card').forEach(card => {
      const name = card.querySelector('.agency-name').textContent.toLowerCase();
      card.closest('.col-xl-4').style.display = name.includes(term) ? 'block' : 'none';
    });
  });
}


function viewNGOProjects(ngoId) {
  // Show loading state
  const ngosContainer = document.querySelector('.row.g-4');
  if (!ngosContainer) {
    console.error('NGOs container not found');
    return;
  }
  ngosContainer.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary"></div></div>';

  // First get NGO details
  Api.ngo.getById(ngoId)
    .then(ngoResponse => {
      const ngo = ngoResponse.data || ngoResponse;
      if (!ngo || !ngo.id) throw new Error('Invalid NGO data');
      console.log(ngo, "here is ngo resp");

      // Then get projects for this NGO
      return Api.project.getByNgo(ngo.id)
        .then(projectResponse => {
          const projectData = projectResponse.data || projectResponse;
          
          if (!projectData) {
            throw new Error('No project data received');
          }

          // Safely handle view switching
          const sectionView = document.querySelector('section.ftco-section');
          const projectsView = document.getElementById('projectsView');
          
          if (sectionView) sectionView.classList.add('d-none');
          if (projectsView) projectsView.classList.remove('d-none');
          
          // Set NGO header
          const companyNameEl = document.getElementById('projectsCompanyName');
          if (companyNameEl) {
            companyNameEl.innerHTML = `
              ${ngo.organizationName}
              <small class="text-muted d-block" style="font-size: 0.7em">
                ${ngo.category?.categoryName || 'No category'} | 
                Contact: ${ngo.nameOfContactPerson || 'N/A'} (${ngo.contactNumber || 'N/A'})
              </small>
            `;
          }

          // Render the projects
          const projectsToRender = Array.isArray(projectData) ? projectData : [projectData];
          renderProjects(projectsToRender, ngo);
        });
    })
    .catch(error => {
      console.error('Error loading NGO projects:', error);
      if (ngosContainer) {
        ngosContainer.innerHTML = `
          <div class="col-12 text-center py-4">
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-triangle me-2"></i>
              ${error.message || 'Failed to load NGO projects'}
            </div>
            <button class="btn btn-sm agency-btn-outline mt-2" onclick="loadNGOs()">
              <i class="fas fa-arrow-left me-2"></i>Back to Agencies
            </button>
          </div>
        `;
      }
    });
}

function renderProjects(apiResponse, ngo) {
  console.log("Projects Data:", apiResponse);
  
  // Only check for the table body element
  const tableBody = document.getElementById('projectsTableBody');

  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }

  // Optional: Check for statistics elements only if they exist
  const totalProjectsEl = document.getElementById('totalProjects');
  const activeProjectsEl = document.getElementById('activeProjects');
  const completedProjectsEl = document.getElementById('completedProjects');

  // Access the projects array
  const projects = Array.isArray(apiResponse) ? apiResponse : apiResponse.data || [];
  
  // Update stats only if elements exist
  if (totalProjectsEl) totalProjectsEl.textContent = projects.length;
  if (activeProjectsEl) activeProjectsEl.textContent = projects.filter(p => p.projectStatus === 'Active').length;
  if (completedProjectsEl) completedProjectsEl.textContent = projects.filter(p => p.projectStatus === 'Completed').length;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  if (projects.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="alert alert-info">
            No projects found for ${ngo.organizationName}
          </div>
          ${ngo.status === 'Pending' ? `
          <div class="alert alert-warning mt-2">
            <i class="fas fa-info-circle me-2"></i>
            This agency is currently under verification (Status: ${ngo.status})
          </div>
          ` : ''}
          <div class="mt-3">
            <p class="mb-1"><strong>Contact:</strong> ${ngo.nameOfContactPerson}</p>
            <p class="mb-1"><strong>Email:</strong> ${ngo.emailId}</p>
            <p class="mb-1"><strong>Phone:</strong> ${ngo.contactNumber}</p>
            <p class="mb-1"><strong>Category:</strong> ${ngo.category?.categoryName || 'Not specified'}</p>
            <p class="mb-1"><strong>Years Active:</strong> ${ngo.ageOfOrganization} years</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  projects.forEach(project => {
    const row = document.createElement('tr');
    row.className = 'align-middle'; // Vertical alignment for all cells
    row.innerHTML = `
      <td>
        <div class="d-flex flex-column">
          <strong class="text-primary">${project.projectName || 'Unnamed Project'}</strong>
          ${project.projectShortDescription ? `
            <small class="text-muted">${project.projectShortDescription}</small>
          ` : ''}
        </div>
      </td>
      <td>
        <span class="badge bg-light text-dark">
          <i class="fas fa-tag me-1"></i> ${ngo.category?.categoryName || 'Not categorized'}
        </span>
      </td>
      <td>
        <span class="badge ${getStatusBadgeClass(project.projectStatus)}">
          <i class="fas ${getStatusIcon(project.projectStatus)} me-1"></i>
          ${project.projectStatus || 'Unknown'}
        </span>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <i class="fas fa-map-marker-alt text-muted me-2"></i>
          <span>${project.projectLocation || 'N/A'}</span>
        </div>
      </td>
      <td class="fw-semibold">
        ${formatCurrency(project.projectBudget)}
      </td>
      <td>
        <div class="d-flex align-items-center">
          <i class="fas fa-users text-muted me-2"></i>
          <span>${project.impactpeople || '0'}</span>
        </div>
      </td>
       <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary view-project-btn" 
                  data-id="${project.projectId}"
                  data-project='${JSON.stringify(project)}'
                  data-ngo='${JSON.stringify(ngo)}'
                  title="View project details">
            <i class="fas fa-eye me-1"></i> View
          </button>
      
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners
  document.querySelectorAll('.view-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectData = JSON.parse(btn.dataset.project);
      const ngoData = JSON.parse(btn.dataset.ngo);
      viewProjectDetails(projectData.projectId, projectData, ngoData);
    });
  });

 document.getElementById('backToCompanies').addEventListener('click', () => {
    // Hide projects view
    document.getElementById('projectsView').classList.add('d-none');
    
    // Show companies view
    document.querySelector('section.ftco-section').classList.remove('d-none');
    
    // Reload companies (optional - only if you need fresh data)
    loadNGOs();
  });
}

// Helper function for status icons
function getStatusIcon(status) {
  if (!status) return 'fa-question-circle';
  status = status.toLowerCase();
  switch (status) {
    case 'active': return 'fa-play-circle';
    case 'completed': return 'fa-check-circle';
    case 'pending': return 'fa-hourglass-half';
    default: return 'fa-question-circle';
  }
}

function viewProjectDetails(projectId, projectData, ngo) {
  console.log('Redirecting to project details:', projectId);
  window.location.href = `donatenow.html?id=${projectId}`;
}
// Helper functions (reuse from company-management.js or define here)
function getStatusBadgeClass(status) {
  if (!status) return 'bg-secondary text-white';
  
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
