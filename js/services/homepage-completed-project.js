(function () {
  function initialiseProjectListing() {
    const projectList = document.getElementById('completeProjectsContainer');
    console.log(projectList, "projectList");

    /**
     * Renders a single project card for completed projects
     * @param {Object} project - Project data
     * @returns {string} - HTML string for the project card
     */
    function renderProjectCard(project) {
      console.log('Rendering project card for:', project);
      
      const imgSrc = project.projectMainImage?.startsWith('http')
        ? project.projectMainImage
        : (project.projectImages?.length ? project.projectImages[0] : 'placeholder.jpg');

      const statusClass = project.projectStatus
        ? project.projectStatus.toLowerCase().replace(/\s+/g, '-')
        : '';

      console.log('Project status check:', {
        projectName: project.projectName,
        status: project.projectStatus,
        statusLower: project.projectStatus?.toLowerCase(),
        isCompleted: project.projectStatus?.toLowerCase() === 'completed'
      });

      // Only render if project is completed
      if (project.projectStatus?.toLowerCase() === 'completed') {
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

      console.log('Project not completed, skipping:', project.projectName, 'Status:', project.projectStatus);
      return ''; // Return nothing if not completed
    }

    /**
     * Fetch projects using the by-status API endpoint or fallback to listAll
     */
    async function fetchProjects() {
      try {
        // Show loading indicator
        projectList.innerHTML = '<div class="loading">Loading projects...</div>';

        console.log('Attempting to fetch completed projects...');

        // First try the specific by-status API if available
        let response;
        let projects = [];

        // Try to use the by-status endpoint first
        try {
          console.log('Trying by-status API...');
          // Assuming you have a custom API call method or fetch
          if (typeof api !== 'undefined' && api.request) {
            response = await api.request({
              path: '/projects/by-status?status=Completed&page=0&size=50',
              method: 'GET'
            });
            console.log('By-status API response:', response);
            
            if (response && response.status === 200 && response.data) {
              projects = Array.isArray(response.data) ? response.data : 
                        (response.data.content ? response.data.content : []);
            }
          }
        } catch (byStatusError) {
          console.log('By-status API failed, falling back to listAll:', byStatusError);
        }

        // Fallback to listAll if by-status didn't work
        if (projects.length === 0) {
          console.log('Using listAll fallback...');
          response = await ProjectService.listAll(0, 100);
          console.log('ListAll API response:', response);
          
          const allProjects = response?.data?.content || response?.data || [];
          console.log('All projects received:', allProjects.length);
          
          // Log all project statuses to see what we have
          allProjects.forEach((project, index) => {
            console.log(`Project ${index}:`, {
              name: project.projectName,
              status: project.projectStatus,
              statusType: typeof project.projectStatus,
              id: project.projectId
            });
          });

          // Filter for 'Completed' projects only
          projects = allProjects.filter(p => {
            const isCompleted = p.projectStatus?.toLowerCase() === 'completed';
            console.log(`Filtering ${p.projectName}: status="${p.projectStatus}", isCompleted=${isCompleted}`);
            return isCompleted;
          });
        }

        console.log('Final completed projects:', projects.length);

        // Show fallback if none found
        if (!projects.length) {
          console.log('No completed projects found');
          projectList.innerHTML = `
            <div class="no-results">
              <h3>No completed projects found</h3>
              <p>There are currently no projects with "Completed" status.</p>
              <button onclick="window.location.reload()" class="btn btn-primary">Refresh Page</button>
            </div>`;
          return;
        }

        // Sort by completion date if available (most recent first)
        projects.sort((a, b) => {
          const dateA = new Date(a.completedDate || a.updatedDate || a.createdDate || 0);
          const dateB = new Date(b.completedDate || b.updatedDate || b.createdDate || 0);
          return dateB - dateA;
        });

        // Limit to 6 most recent
        const recentCompletedProjects = projects.slice(0, 6);
        console.log('Displaying projects:', recentCompletedProjects.length);

        // Render all cards
        const projectCardsHTML = recentCompletedProjects.map(renderProjectCard).join('');
        console.log('Generated HTML length:', projectCardsHTML.length);
        
        if (projectCardsHTML.trim() === '') {
          console.log('No HTML generated from projects');
          projectList.innerHTML = `
            <div class="no-results">
              <h3>No completed projects to display</h3>
              <p>Projects were found but none could be rendered.</p>
            </div>`;
        } else {
          projectList.innerHTML = projectCardsHTML;
          console.log('Successfully rendered completed projects');
        }

      } catch (err) {
        console.error('Failed to load projects:', err);
        projectList.innerHTML = `
          <div class="error">
            <h3>Unable to load projects</h3>
            <p>Error: ${err.message}</p>
            <button onclick="window.location.reload()" class="btn btn-primary">Try Again</button>
          </div>`;
      }
    }

    // Initial fetch
    fetchProjects();

    // Make fetchProjects available globally for debugging
    window.debugFetchProjects = fetchProjects;
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseProjectListing);
  } else {
    initialiseProjectListing();
  }

  // Make available globally if needed
  window.initialiseProjectListing = initialiseProjectListing;
})();














// (function () {
//   function initialiseProjectListing() {
//     const projectList = document.getElementById('completeProjectsContainer');
//     console.log(projectList,"projectList");

//     /**
//      * Renders a single project card for completed projects
//      * @param {Object} project - Project data
//      * @returns {string} - HTML string for the project card
//      */
//     function renderProjectCard(project) {
//       const imgSrc = project.projectMainImage?.startsWith('http')
//         ? project.projectMainImage
//         : (project.projectImages?.length ? project.projectImages[0] : 'placeholder.jpg'); // fallback

//       const statusClass = project.projectStatus
//         ? project.projectStatus.toLowerCase().replace(/\s+/g, '-')
//         : '';

//       // Only render if project is completed
//       if (project.projectStatus?.toLowerCase() === 'Completed') {
//         return `
//           <div class="col-md-4 mb-4">
//             <div class="card h-100 shadow-sm">
//               <img src="${imgSrc}" class="card-img-top" alt="${project.projectName}" style="height: 200px; object-fit: cover;">
//               <div class="card-body d-flex flex-column">
//                 <h5 class="card-title">${project.projectName}</h5>
//                 <p class="card-text flex-grow-1">${project.projectShortDescription || 'No description available.'}</p>
//                 <div class="mt-auto text-center">
//                   <a class="btn btn-primary px-4" href="./donatenow.html?id=${project.projectId || ''}">View Details</a>
//                 </div>
//               </div>
//             </div>
//           </div>`;
//       }

//       return ''; // Return nothing if not completed
//     }

//     /**
//      * Fetch projects and render only 6 recent completed ones
//      * @param {number} categoryId - Optional category ID (default 0)
//      */
//     async function fetchProjects(categoryId = 0) {
//       try {
//         // Show loading indicator
//         projectList.innerHTML = '<div class="loading">Loading projects...</div>';

//         // Fetch project list from service
//         const response = await ProjectService.listAll();
//         const projects = response?.data?.content || [];

//         // Filter for 'Completed' projects only
//         const completedProjects = projects.filter(
//           p => p.projectStatus?.toLowerCase() === 'Completed'
//         );

//         // Optional: Sort by completion date if available
//         // completedProjects.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));

//         // Slice to show only the first 6
//         const recentCompletedProjects = completedProjects.slice(0, 6);

//         // Show fallback if none
//         if (!recentCompletedProjects.length) {
//           projectList.innerHTML = '<div class="no-results">No completed projects found</div>';
//           return;
//         }

//         // Render all cards
//         projectList.innerHTML = recentCompletedProjects.map(renderProjectCard).join('');
//       } catch (err) {
//         console.error('Failed to load projects:', err);
//         projectList.innerHTML = '<div class="error">Unable to load projects</div>';
//       }
//     }

//     // Initial fetch
//     fetchProjects();
//   }

//   // Run when DOM is ready
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initialiseProjectListing);
//   } else {
//     initialiseProjectListing();
//   }

//   // Optional: make available globally if needed
//   window.initialiseProjectListing = initialiseProjectListing;
// })();