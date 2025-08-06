
document.addEventListener("DOMContentLoaded", function () {
    loadAllStories();
});

// function loadAllStories() {
//     console.log("Calling API directly...");

//     fetch("https://mumbailocal.org:8087/listallSuccessStory")
//   .then(response => response.json())
//   .then(response => {
//     console.log("API Response Received:", response);
//     if (response.status === 200 && response.data && response.data.content) {
//       let stories = response.data.content;
//       // Move the story with the specific title to the top
//       const targetTitle = "Cleft Care Project at AMC Dental College";
//       const targetIndex = stories.findIndex(story => story.successstoryTitle === targetTitle);
//       if (targetIndex !== -1) {
//         const [targetStory] = stories.splice(targetIndex, 1);
//         stories.unshift(targetStory); // Add it to the beginning
//       }
//       console.log("Total stories after prioritizing:", stories.length);
//       const container = document.querySelector(".row.g-4");
//       container.innerHTML = ""; // Clear existing content
      
//       stories.forEach((story, index) => {
//         const storyCard = `
//           <div class="col-lg-4 col-md-6">
//                           <div class="card success-story-card">
//                             <div class="position-relative">
//                               <img src="${story.successstoryImage}" class="card-img-top story-image" alt="${story.successstoryTitle}">
//                               <span class="story-category">${getCategoryName(story.categoryId)}</span>
//                             </div>
//                             <div class="card-body">
//                               <p class="story-date mb-2"><i class="far fa-calendar-alt me-2"></i>${formatDate(story.successstoryDate)}</p>
//                               <h5 class="card-title story-title">${story.successstoryTitle}</h5>
//                               <p class="card-text story-excerpt">${shortenText(story.successstoryDescription, 120)}</p>
//                               <a href="#" class="read-more-btn" data-bs-toggle="modal" data-bs-target="#storyModal${index}"
//                                 style=" background: linear-gradient(to right, #165cda, #3B82F6); color: aliceblue; padding: 10px; border-radius: 5px;">
//                                 Read Full Story <i class="fas fa-arrow-right ms-2"></i>
//                               </a>
//                             </div>
//                           </div>
//                         </div>

//                         <!-- Modal -->
//                        <!-- Modal -->
// <div class="modal fade" id="storyModal${index}" tabindex="-1" aria-labelledby="storyModalLabel${index}" aria-hidden="true">
//   <div class="modal-dialog modal-lg custom-modal-desktop">
//     <div class="modal-content">
//       <div class="modal-header" style=" background: linear-gradient(to right, #165cda, #3B82F6); color: white;">
//         <h5 class="modal-title" id="storyModalLabel${index}">${story.successstoryTitle}</h5>
//         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background-color: white;"></button>
//       </div>
//       <div class="modal-body">
//         <div class="container-fluid">
//           <div class="row">
//             <div class="col-md-12 mb-3">
//              <iframe width="560" height="315" src="${story.successstoryVideo}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
//             </div>
//             <div class="col-md-12 d-flex flex-column justify-content-start">
//               <p><strong>Date:</strong> ${formatDate(story.successstoryDate)}</p>
//               <p><strong>Category:</strong> ${getCategoryName(story.categoryId)}</p>
//               <p><strong>Description:</strong> ${story.successstoryDescription}</p>
//               <div class="mt-auto pt-3">
             
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>

//                     `;
//                     container.insertAdjacentHTML("beforeend", storyCard);
//                 });

//             } else {
//                 console.error("Unexpected response structure:", response);
//             }
//         })
//         .catch(error => {
//             console.error("API Error:", error);
//         });
// }

function loadAllStories() {
    console.log("Calling API directly...");

    fetch("https://mumbailocal.org:8087/listallSuccessStory")
        .then(response => response.json())
        .then(response => {
            console.log("API Response Received:", response);
            if (response.status === 200 && response.data && response.data.content) {
                let stories = response.data.content;
                // Move the story with the specific title to the top
                const targetTitle = "Cleft Care Project at AMC Dental College";
                const targetIndex = stories.findIndex(story => story.successstoryTitle === targetTitle);
                if (targetIndex !== -1) {
                    const [targetStory] = stories.splice(targetIndex, 1);
                    stories.unshift(targetStory); // Add it to the beginning
                }
                console.log("Total stories after prioritizing:", stories.length);
                const container = document.querySelector(".row.g-4");
                container.innerHTML = ""; // Clear existing content
                
                stories.forEach((story, index) => {
                    // Determine if we should show video or image
                    const mediaContent = story.successstoryVideo 
                        ? `<iframe width="560" height="315" src="${story.successstoryVideo}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
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
                                    <a href="#" class="read-more-btn" data-bs-toggle="modal" data-bs-target="#storyModal${index}"
                                        style=" background: linear-gradient(to right, #165cda, #3B82F6); color: aliceblue; padding: 10px; border-radius: 5px;">
                                        Read Full Story <i class="fas fa-arrow-right ms-2"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Modal -->
                        <div class="modal fade" id="storyModal${index}" tabindex="-1" aria-labelledby="storyModalLabel${index}" aria-hidden="true">
                            <div class="modal-dialog modal-lg custom-modal-desktop">
                                <div class="modal-content">
                                    <div class="modal-header" style=" background: linear-gradient(to right, #165cda, #3B82F6); color: white;">
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
                                                    <div class="mt-auto pt-3">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML("beforeend", storyCard);
                });

            } else {
                console.error("Unexpected response structure:", response);
            }
        })
        .catch(error => {
            console.error("API Error:", error);
        });
}


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



















// <!-- Modal -->
// <div class="modal fade" id="storyModal${index}" tabindex="-1" aria-labelledby="storyModalLabel${index}" aria-hidden="true">
//   <div class="modal-dialog modal-lg modal-dialog-centered">
//     <div class="modal-content">
//       <div class="modal-header" style="background-color: #0A1E46; color: white;">
//         <h5 class="modal-title" id="storyModalLabel${index}">${story.successstoryTitle}</h5>
//         <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" style="background-color: white;"></button>
//       </div>
//       <div class="modal-body">
//         <div class="container-fluid">
//           <div class="row">
//             <div class="col-md-5 mb-3">
//               <img src="${story.successstoryImage}" alt="Story Image" class="img-fluid rounded shadow-sm">
//             </div>
//             <div class="col-md-7 d-flex flex-column justify-content-start">
//               <p><strong>Date:</strong> ${formatDate(story.successstoryDate)}</p>
//               <p><strong>Category:</strong> ${getCategoryName(story.categoryId)}</p>
//               <p><strong>Description:</strong> ${story.successstoryDescription}</p>
//               <div class="mt-auto pt-3">
//                 <h6>Download Full Document</h6>
//                 <a href="https://drive.google.com/file/d/1TC__RtKW1vHe8c65t9zX_48fOs2EI3XC/view" target="_blank"
//                   class="btn btn-primary">
//                   <i class="fas fa-file-pdf"></i> View PDF
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
