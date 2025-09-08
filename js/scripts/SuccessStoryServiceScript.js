document.addEventListener("DOMContentLoaded", function () {
    loadStories(0); // load first page
});

const pageSize = 10;
let currentPage = 0;
let totalPages = 0;

function loadStories(page) {
    console.log("Calling paginated API...");

    fetch(`https://mumbailocal.org:8087/listallSuccessStory?page=${page}&size=${pageSize}`)
        .then(response => response.json())
        .then(response => {
            console.log("API Response Received:", response);
            if (response.status === 200 && response.data && response.data.content) {
                let stories = response.data.content;
                totalPages = response.data.totalPages;
                currentPage = response.data.number;

                // Move the specific story to the top
                const targetTitle = "Cleft Care Project at AMC Dental College";
                const targetIndex = stories.findIndex(story => story.successstoryTitle === targetTitle);
                if (targetIndex !== -1) {
                    const [targetStory] = stories.splice(targetIndex, 1);
                    stories.unshift(targetStory);
                }

                console.log(`Rendering page ${currentPage + 1} of ${totalPages}, ${stories.length} stories`);
                renderStories(stories);
                renderPagination(totalPages, currentPage);
            } else {
                console.error("Unexpected response structure:", response);
            }
        })
        .catch(error => {
            console.error("API Error:", error);
        });
}

function renderStories(stories) {
    const container = document.querySelector(".row.g-4");
    container.innerHTML = ""; // Clear existing content

    stories.forEach((story, index) => {
        const mediaContent = story.successstoryVideo
            ? `<div class="ratio ratio-16x9">
                 <iframe src="${story.successstoryVideo}" title="YouTube video player" frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
               </div>`
            : `<img src="${story.successstoryImage}" alt="Story Image" class="img-fluid rounded shadow-sm">`;

        const storyCard = `
            <div class="col-lg-4 col-md-6">
                <div class="card success-story-card">
                    <div class="position-relative">
                        <img src="${story.successstoryImage}" class="card-img-top story-image" alt="${story.successstoryTitle}">
                        <span class="story-category">${getCategoryName(story.categoryId)}</span>
                    </div>
                    <div class="card-body">
                        <p class="story-date mb-2"><i class="far fa-calendar-alt me-2"></i>${formatDate(story.successstoryDate)}</p>
                        <h5 class="card-title story-title">${story.successstoryTitle}</h5>
                        <p class="card-text story-excerpt">${shortenText(story.successstoryDescription, 120)}</p>
                        <a href="#" class="button-read-more" data-bs-toggle="modal" data-bs-target="#storyModal${index}">
                            Read Full Story <i class="fas fa-arrow-right ms-2"></i>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Modal -->
            <div class="modal fade" id="storyModal${index}" tabindex="-1" aria-labelledby="storyModalLabel${index}" aria-hidden="true">
                <div class="modal-dialog modal-lg custom-modal-desktop">
                    <div class="modal-content">
                        <div class="modal-header" style="background: linear-gradient(135deg, #0E45B3 0%, #0000FF 100%); color: white;">
                            <h5 class="modal-title" id="storyModalLabel${index}">${story.successstoryTitle}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background-color: white;"></button>
                        </div>
                        <div class="modal-body">
                            <div class="container-fluid">
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        ${mediaContent}
                                    </div>
                                    <div class="col-md-12 d-flex flex-column justify-content-start">
                                        <p><strong>Date:</strong> ${formatDate(story.successstoryDate)}</p>
                                        <p><strong>Category:</strong> ${getCategoryName(story.categoryId)}</p>
                                        <p><strong>Description:</strong> ${story.successstoryDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", storyCard);

        // stop video when modal closes
        const modal = document.getElementById(`storyModal${index}`);
        modal.addEventListener("hidden.bs.modal", function () {
            const iframe = this.querySelector("iframe");
            if (iframe) {
                const iframeSrc = iframe.src;
                iframe.src = "";
                iframe.src = iframeSrc;
            }
        });
    });
}

function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    pagination.innerHTML = "";

    // Previous
    pagination.innerHTML += `
        <li class="page-item ${currentPage === 0 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>`;

    // Page numbers
    for (let i = 0; i < totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
            </li>`;
    }

    // Next
    pagination.innerHTML += `
        <li class="page-item ${currentPage === totalPages - 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>`;

    // Add click listeners
    document.querySelectorAll("#pagination .page-link").forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const page = parseInt(this.getAttribute("data-page"));
            if (!isNaN(page) && page >= 0 && page < totalPages) {
                loadStories(page);
            }
        });
    });
}

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function getCategoryName(categoryId) {
    const categories = {
        1: "Health",
        2: "Environment",
        3: "Education",
        4: "Social",
        5: "Infrastructure"
    };
    return categories[categoryId] || "Uncategorized";
}

function shortenText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
