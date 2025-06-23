
(function () {
 
  function initialiseProjectListing () {
    const projectList   = document.getElementById('projectList');
    const categoryFilter = document.getElementById('categoryFilter');
    const budgetFilter   = document.getElementById('scaleFilter');
    const categoryBudgetFilter = categoryFilter && budgetFilter;

   
    const formatCurrency = amount => new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

   
    function renderProjectCard (project) {
     
      const imgSrc = project.projectMainImage?.startsWith('http')
        ? project.projectMainImage
        : (project.projectImages?.length ? project.projectImages[0] : '');

      const statusClass = project.projectStatus
        ? project.projectStatus.toLowerCase().replace(/\s+/g, '-')
        : '';

      return `
        <div class="card">
          <div class="placeholder">
            ${imgSrc
              ? `<img src="${imgSrc}" alt="${project.projectName || project.projectShortDescription || 'Project'}" loading="lazy">`
              : '<div class="placeholder-text">IMAGE PLACEHOLDER</div>'}
            ${project.projectStatus
              ? `<div class="status ${statusClass}">${project.projectStatus}</div>`
              : ''}
          </div>
          <div class="card-content">
            <span class="tag">${project.categoryName || ''}</span>

            <div class="cost">
              Funding Required:
              <span class="cost-amount">${formatCurrency(parseInt(project.projectBudget || 0, 10))}</span>
            </div>

            <div class="title">
              ${project.projectName || project.projectShortDescription || 'Untitled Project'}
            </div>

            <a class="view-link" href="./donatenow.html?id=${project.projectId || ''}">View Details</a>
          </div>
        </div>`;
    }

   
    async function fetchProjects (categoryId = 0) {
      try {
        projectList.innerHTML = '<div class="loading">Loading projects...</div>';

        let response;
        if (categoryId && categoryId !== '0') {
          // Filter by category via public endpoint
          const res = await fetch(`https://mumbailocal.org:8087/projects/filter?categoryId=${categoryId}`);
          response  = await res.json();

          const projects = response.data || [];
          if (!projects.length) {
            projectList.innerHTML = '<div class="no-results">No projects found for this category</div>';
            return;
          }
          projectList.innerHTML = projects.map(renderProjectCard).join('');
        } else {
          // Use internal ProjectService for full list
          response = await ProjectService.listAll();
          const projects = response?.data?.content || [];

          if (!projects.length) {
            projectList.innerHTML = '<div class="no-results">No projects found</div>';
            return;
          }
          projectList.innerHTML = projects.map(renderProjectCard).join('');
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        projectList.innerHTML = '<div class="error">Unable to load projects</div>';
      }
    }

    async function fetchProjectsByBudget (projectBudget = 0) {
      try {
        projectList.innerHTML = '<div class="loading">Loading projects...</div>';

        let response;
        if (projectBudget && projectBudget !== '0') {
          // Filter by budget via public endpoint
          const res = await fetch(`https://mumbailocal.org:8087/projects/filter?projectBudget=${projectBudget}`);
          response  = await res.json();

          const projects = response.data || [];
          if (!projects.length) {
            projectList.innerHTML = '<div class="no-results">No projects found for this budget</div>';
            return;
          }
          projectList.innerHTML = projects.map(renderProjectCard).join('');
        } else {
          response = await ProjectService.listAll();
          const projects = response?.data?.content || [];

          if (!projects.length) {
            projectList.innerHTML = '<div class="no-results">No projects found</div>';
            return;
          }
          projectList.innerHTML = projects.map(renderProjectCard).join('');
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        projectList.innerHTML = '<div class="error">Unable to load projects</div>';
      }
    }

    async function fetchProjectsByCategoryAndBudget (categoryId=0,projectBudget = 0 ) {
      try {
        projectList.innerHTML = '<div class="loading">Loading projects...</div>';

        let response;
        if (categoryId && categoryId !== '0' && projectBudget && projectBudget !== '0') {
          // Filter by budget via public endpoint
          const res = await fetch(`https://mumbailocal.org:8087/projects/filter?categoryid=${categoryId}&projectbudget=${projectBudget}`);
          response  = await res.json();

          const projects = response.data || [];
          if (!projects.length) {
            projectList.innerHTML = '<div class="no-results">No projects found for this category and budget</div>';
            return;
          }
          projectList.innerHTML = projects.map(renderProjectCard).join('');
        } else {
          response = await ProjectService.listAll();
          const projects = response?.data?.content || [];

          if (!projects.length) {
            projectList.innerHTML = '<div class="no-results">No projects found</div>';
            return;
          }
          projectList.innerHTML = projects.map(renderProjectCard).join('');
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        projectList.innerHTML = '<div class="error">Unable to load projects</div>';
      }
    }


    function attachEventHandlers () {
      categoryFilter?.addEventListener('change', e => fetchProjects(e.target.value));
      budgetFilter?.addEventListener('change',   e => fetchProjectsByBudget(e.target.value));
      categoryBudgetFilter?.addEventListener('change', e => fetchProjectsByCategoryAndBudget(categoryFilter.value, e.target.value));
    }

    

    attachEventHandlers();   // wires up UI filters
    fetchProjects();         // initial load
  }

  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseProjectListing);
  } else {
    initialiseProjectListing();
  }

 
  window.initialiseProjectListing = initialiseProjectListing;
})();
