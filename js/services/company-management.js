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

// Load and render categories in sidebar
function loadCategories() {
  const sidebarCategories = document.querySelector('.company-categories');
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

// Render categories in sidebar
function renderCategories(categories) {
  const sidebarCategories = document.querySelector('.company-categories');
  sidebarCategories.innerHTML = '';

  // Add "All Companies" option
  const allItem = document.createElement('div');
  allItem.className = 'company-category active';
  allItem.textContent = 'All Companies';
  allItem.addEventListener('click', () => {
    document.querySelectorAll('.company-category').forEach(c => c.classList.remove('active'));
    allItem.classList.add('active');
    loadCompanies();
  });
  sidebarCategories.appendChild(allItem);

  // Add categories from API
  categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'company-category';
    categoryItem.textContent = category.categoryName;
    categoryItem.dataset.id = category.id;

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
    ? Api.company.getById(categoryId)  // Use specific endpoint for category
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
        <span class="company-type ${companyType}">${company.status || 'Private'}</span>
        <h3 class="company-name">${company.companyname}</h3>
        <p class="company-info">
          <i class="fas fa-globe me-2"></i> ${company.companyurl}
        </p>
        <p class="company-info">
          <i class="fas fa-project-diagram me-2"></i> Projects: ${projectsCount.toLocaleString()}
        </p>
        <div class="company-actions d-flex justify-content-between">
          <button class="btn btn-sm company-btn-outline" data-id="${company.companieId}">View Profile</button>
          <button class="btn btn-sm company-btn-primary" data-id="${company.companieId}">View Projects</button>
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
  console.log('View projects for company:', companyId);
  // Implement projects viewing logic
}