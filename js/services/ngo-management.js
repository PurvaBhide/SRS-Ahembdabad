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

// Render categories in sidebar
function renderCategories(categories) {
  const sidebarCategories = document.querySelector('.agency-categories');
  sidebarCategories.innerHTML = '';

  // Add "All Agencies" option
  const allItem = document.createElement('div');
  allItem.className = 'agency-category active';
  allItem.textContent = 'All Agencies';
  allItem.addEventListener('click', () => {
    document.querySelectorAll('.agency-category').forEach(c => c.classList.remove('active'));
    allItem.classList.add('active');
    loadNGOs();
  });
  sidebarCategories.appendChild(allItem);

  // Add categories from API
  categories.forEach(category => {
    const categoryItem = document.createElement('div');
    categoryItem.className = 'agency-category';
    categoryItem.textContent = category.categoryName;
    categoryItem.dataset.id = category.id;

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
          <button class="btn btn-sm agency-btn-outline" data-id="${ngo.id}">View Profile</button>
          <button class="btn btn-sm agency-btn-primary" data-id="${ngo.id}">View Projects</button>
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