(function () {
  function initialiseProjectListing() {
    const projectList = document.getElementById('ongoingProjectsContainer');

    /**
     * Renders a single project card for ongoing projects
     * @param {Object} project - Project data
     * @returns {string} - HTML string for the project card
     */
    function renderProjectCard(project) {
      const imgSrc = project.projectMainImage?.startsWith('http')
        ? project.projectMainImage
        : (project.projectImages?.length ? project.projectImages[0] : 'placeholder.jpg'); // fallback

      const statusClass = project.projectStatus
        ? project.projectStatus.toLowerCase().replace(/\s+/g, '-')
        : '';

      // Only render if project is ongoing
      if (project.projectStatus?.toLowerCase() === 'ongoing') {
        return `
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${imgSrc}" class="card-img-top" alt="${project.projectName}" style="height: 200px; object-fit: cover;">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${project.projectName}</h5>
                <p class="card-text flex-grow-1">${project.projectShortDescription || 'No description available.'}</p>
                <div class="mt-auto text-center">
                  <a class="btn btn-primary px-4" href="./donatenow.html?id=${project.projectId || ''}">View Details</a>
                </div>
              </div>
            </div>
          </div>`;
      }

      return ''; // Return nothing if not ongoing
    }

    /**
     * Fetch projects and render only 6 recent ongoing ones
     * @param {number} categoryId - Optional category ID (default 0)
     */
    async function fetchProjects(categoryId = 0) {
      try {
        // Show loading indicator
        projectList.innerHTML = '<div class="loading">Loading projects...</div>';

        // Fetch project list from service
        const response = await ProjectService.listAll();
        const projects = response?.data?.content || [];

        // Filter for 'Ongoing' projects only
        const ongoingProjects = projects.filter(
          p => p.projectStatus?.toLowerCase() === 'ongoing'
        );

        // Optional: Sort by creation date if available
        // ongoingProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Slice to show only the first 6
        const recentOngoingProjects = ongoingProjects.slice(0, 6);

        // Show fallback if none
        if (!recentOngoingProjects.length) {
          projectList.innerHTML = '<div class="no-results">No ongoing projects found</div>';
          return;
        }

        // Render all cards
        projectList.innerHTML = recentOngoingProjects.map(renderProjectCard).join('');
      } catch (err) {
        console.error('Failed to load projects:', err);
        projectList.innerHTML = '<div class="error">Unable to load projects</div>';
      }
    }

    // Initial fetch
    fetchProjects();
  fetchProjectsByCategory();

}

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseProjectListing);
  } else {
    initialiseProjectListing();
  }

  // Optional: make available globally if needed
  window.initialiseProjectListing = initialiseProjectListing;
})();
