function initializeProjectListing() {
    // Currency formatter
    console.log(`Initializing project listing.....................................................................`);
    
    const formatCurrency = amt => 
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amt);

    function renderProjectCard(project) {
        const imgSrc = project.projectMainImage?.startsWith('http') 
            ? project.projectMainImage 
            : (project.projectImages?.length > 0)
                ? project.projectImages[0]
                : '';
        
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
                        <span class="cost-amount">
                            ${formatCurrency(parseInt(project.projectBudget || 0))}
                        </span>
                    </div>
                    <div class="title">
                        ${project.projectName || project.projectShortDescription || 'Untitled Project'}
                    </div>
                    <a class="view-link" href="./donatenow.html?id=${project.projectId || ''}">View Details</a>
                </div>
            </div>`;
    }

    async function fetchProjects(categoryId = 0) {
        const projectList = document.getElementById('projectList');
        if (!projectList) {
            console.error('projectList element not found');
            return;
        }

        try {
            projectList.innerHTML = '<div class="loading">Loading projects...</div>';
            
            let response;
            if (categoryId && categoryId !== '0') {
                const res = await fetch(`https://mumbailocal.org:8087/projects/filter?categoryId=${categoryId}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                response = await res.json();
                const projects = response.data || [];
                projectList.innerHTML = projects.length 
                    ? projects.map(renderProjectCard).join('') 
                    : '<div class="no-results">No projects found for this category</div>';
            } else {
                response = await Api.project.listAll()
                console.log('Fetched projects:', response);
                
                const projects = response?.data?.content || [];
                projectList.innerHTML = projects.length 
                    ? projects.map(renderProjectCard).join('') 
                    : '<div class="no-results">No projects found</div>';
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
            projectList.innerHTML = '<div class="error">Unable to load projects</div>';
        }
    }

    function init() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => fetchProjects(e.target.value));
        }
        fetchProjects
    }

    // Initialize when DOM is ready
    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
}

// Start the project listing functionality
initializeProjectListing();