// projectDetails.js
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the project details page (donatenow.html)
  if (window.location.pathname.includes('donatenow.html')) {
    loadProjectDetails();
  }
});

function loadProjectDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  
  if (!projectId) {
    console.error('No project ID found in URL');
    return;
  }

  // Show loading state
  const projectHero = document.querySelector('.project-hero');
  const projectTitle = document.querySelector('.project-title');
  const projectDescription = document.querySelector('.project-description');
  
  projectTitle.textContent = 'Loading project...';
  projectDescription.textContent = '';

  // Fetch project details
  ProjectService.getById(projectId)
    .then(response => {
      const project = response.data;
      
      // Update the page with project details
      updateProjectDetails(project);
    })
    .catch(error => {
      console.error('Error loading project details:', error);
      projectTitle.textContent = 'Error loading project';
      projectDescription.textContent = 'Could not load project details. Please try again later.';
    });
}

function updateProjectDetails(project) {
  // Update main project image
  const projectHero = document.querySelector('.project-hero');
  if (project.projectMainImage || (project.projectImages && project.projectImages.length > 0)) {
    const imgSrc = project.projectMainImage?.startsWith('http') 
      ? project.projectMainImage 
      : project.projectImages[0];
    projectHero.style.backgroundImage = `url('${imgSrc}')`;
  }

  // Update title
  document.querySelector('.project-title').textContent = project.projectName || 'Untitled Project';
  document.querySelector('#project-description').textContent = project.projectDescription?project.projectDescription :project.projectShortDescription  || 'No description available';
  document.querySelector('#projectDepartmentName').textContent = project.projectDEpartmentName || 'Not specified';

   if(project.projectStatus === 'Completed' || project.projectStatus === 'completed' || project.projectStatus === 'COMPLETED') {
    document.getElementById('paricipantform').style.display= 'none';
     document.querySelector('.project-details').style.width = '155%';
  } else {
    document.getElementById('paricipantform').style.display= 'block';
     document.querySelector('.project-details').style.width = '';
  }


  // Update description
  const descriptionHTML = `
    <p><strong>Project Name:</strong> ${project.projectName || 'Not specified'}</p>
    <p><strong>Estimated Cost:</strong> ${formatCurrency(parseInt(project.projectBudget || 0))}</p>
    <p><strong>Short Description:</strong> ${project.projectShortDescription || 'No description available'}</p>
    ${project.projectLongDescription ? `<p><strong>Detailed Description:</strong> ${project.projectLongDescription}</p>` : ''}
  `;
  document.querySelector('.project-description').innerHTML = descriptionHTML;

  // Update about tab content if available
  if (project.projectDetails) {
    document.querySelector('#about .tab-content').innerHTML = `
      <h3>Project Details</h3>
      <p>${project.projectDetails}</p>
      <p>${project.projectDescription}</p>
    `;
  }

//   gallery tab content
  const galleryTab = document.getElementById('gallery');
  if (project.projectImages && project.projectImages.length > 0) {
    console.log('Project images:', project.projectImages);
    
    galleryTab.innerHTML = `
      <h3>Photo Gallery</h3>
      <div class="gallery-grid" style="display: flex; justify-content:flex-inline; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
        ${project.projectImages.map(image => `
          <div class="gallery-item ">
            <img src="${image}" alt="Project image" loading="lazy" height="150" style="object-fit: cover; width: 100%; height: 100%;">
          </div>
        `).join('')}
      </div>
    `;
  } else {
    galleryTab.innerHTML = `
      <h3>Photo Gallery</h3>
      <p>No images available for this project yet.</p>
    `;
  }


  // Update funding target
  document.querySelector('.raised-amount').textContent = `${formatCurrency(parseInt(project.projectBudget || 0))}`;
  document.querySelector('#customAmount').value = parseInt(project.projectBudget || 0);
}


  function getCurrentProjectId() {
  return currentProjectId || new URLSearchParams(window.location.search).get('projectId');
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}



// Add this to participantScript.js or your main JS file
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(function(content) {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(function(button) {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }
    
    // Add active class to the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
}