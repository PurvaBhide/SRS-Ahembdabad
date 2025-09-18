// // Wait for DOM to be fully loaded
// document.addEventListener("DOMContentLoaded", function () {
//   // Modal elements
//   const modal = document.getElementById("myModal");
//   const form = document.getElementById("paricipantform"); // Note: keeping your original form ID with typo
//   const closeBtn = document.getElementById("closeModal");
//   const closeModalBtn = document.getElementById("closeModalBtn");
//   const submitBtn = document.getElementById("openmodal");
//   const btnText = submitBtn.querySelector(".btn-text");
//   const spinner = submitBtn.querySelector(".loading-spinner");

//   // Check if all elements exist
//   if (!modal || !form || !submitBtn) {
//     console.error("Required elements not found. Check your HTML structure.");
//     return;
//   }

//   // Add click event to button
//   submitBtn.addEventListener("click", function (e) {
//     e.preventDefault();
//     processDonation();
//   });

//   // Updated processDonation function to work with modal
//   async function processDonation() {
//     // Validate form first
//     const participantName = document.getElementById("participantsname");
//     const organizationName = document.getElementById("organizationname");
//     const participantEmail = document.getElementById("email");
//     const participantMobileNumber = document.getElementById("mobilenumber");
//     const amount = document.getElementById("customAmount");

//     // Check if all required fields are filled
//     if (
//       !participantName.value.trim() ||
//       !organizationName.value.trim() ||
//       !participantEmail.value.trim() ||
//       !participantMobileNumber.value.trim() ||
//       !amount.value.trim()
//     ) {
//       showErrorMessage("Please fill in all required fields.");
//       return;
//     }

//     // Basic email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(participantEmail.value)) {
//       showErrorMessage("Please enter a valid email address.");
//       return;
//     }

//     // Basic mobile number validation (assuming 10 digits)
//     const mobileRegex = /^[0-9]{10}$/;
//     if (!mobileRegex.test(participantMobileNumber.value)) {
//       showErrorMessage("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     // Show loading state
//     submitBtn.disabled = true;
//     btnText.textContent = "Processing...";
//     spinner.style.display = "inline-block";

//     try {
//       // Get project ID from various sources
//       let projectId = null;

//       if (typeof currentProjectId !== "undefined" && currentProjectId) {
//         projectId = currentProjectId;
//       } else if (document.body.getAttribute("data-project-id")) {
//         projectId = document.body.getAttribute("data-project-id");
//       } else {
//         const urlParams = new URLSearchParams(window.location.search);
//         projectId = urlParams.get("id") || 11; // Default to 11 if no ID found
//       }

//       const formData = {
//         projetcId: projectId,
//         participantName: participantName.value.trim(),
//         organizationName: organizationName.value.trim(),
//         participantEmail: participantEmail.value.trim(),
//         participantMobileNumber: participantMobileNumber.value.trim(),
//         amount: parseInt(amount.value) || 0,
//       };

//       // Handle API call with Promise
//       try {
//         const apiPromise = participantNowServices.createParticipant(formData);

//         // Handle the promise response
//         apiPromise
//           .then(function (response) {
//             // Check if response exists and has valid structure
//             if (
//               response &&
//               response.data &&
//               response.status &&
//               (response.status === 200 || response.status === 201)
//             ) {
//               showSuccessModal(response);
//             } else {
//               showErrorMessage("Invalid response from server");
//               resetButtonState();
//             }
//           })
//           .catch(function (error) {
//             showErrorMessage("Failed to submit application. Please try again.");
//             resetButtonState();
//           });
//       } catch (error) {
//         showErrorMessage("Failed to submit application. Please try again.");
//         resetButtonState();
//       }
//     } catch (error) {
//       showErrorMessage(
//         error.message || "Failed to submit application. Please try again."
//       );
//       resetButtonState();
//     }
//   }

//   // Function to show success modal with API response
//   function showSuccessModal(response) {
//     if (!response || !response.data) {
//       showErrorMessage("Invalid response from server");
//       resetButtonState();
//       return;
//     }

//     const data = response.data;

//     // Display token from backend API response
//     const tokenElement = document.getElementById("trackingToken");
//     if (tokenElement && data.token) {
//       tokenElement.textContent = data.token;
//     } else {
//       console.error("Token element not found or token missing");
//     }

//     // Update participant details in modal
//     updateModalWithParticipantDetails(data);

//     // Show modal
//     if (modal) {
//       modal.style.display = "block";
//       document.body.style.overflow = "hidden";
//     } else {
//       console.error("Modal element not found");
//     }

//     // Reset form
//     form.reset();
//     if (document.getElementById("customAmount")) {
//       document.getElementById("customAmount").value = "400000";
//     }

//     // Reset button state
//     resetButtonState();
//   }

//   // Function to update modal with participant details
//   function updateModalWithParticipantDetails(data) {
//     const modalBody = document.querySelector(".modal-body");

//     if (!modalBody) {
//       console.error("Modal body not found");
//       return;
//     }

//     let detailsSection = document.getElementById("applicationDetails");
//     if (!detailsSection) {
//       detailsSection = document.createElement("div");
//       detailsSection.id = "applicationDetails";
//       detailsSection.className = "application-details";

//       const trackingInfo = document.querySelector(".tracking-info");
//       if (trackingInfo) {
//         trackingInfo.parentNode.insertBefore(
//           detailsSection,
//           trackingInfo.nextSibling
//         );
//       } else {
//         modalBody.appendChild(detailsSection);
//       }
//     }

//     detailsSection.innerHTML = `
//             <h4>Application Details:</h4>
//             <div class="details-row">
//             <div class="details-col-left">
//                 <div class="detail-item">
//                     <strong class="detail-label">Participant:</strong> 
//                     <span class="detail-value">${
//                       data.participantName || "N/A"
//                     }</span>
//                 </div>
//                 <div class="detail-item">
//                     <strong class="detail-label">Organization:</strong> 
//                     <span class="detail-value">${
//                       data.organizationName || "N/A"
//                     }</span>
//                 </div>
//                 <div class="detail-item">
//                     <strong class="detail-label">Email:</strong> 
//                     <span class="detail-value">${
//                       data.participantEmail || "N/A"
//                     }</span>
//                 </div>
//             </div>
//             <div class="details-col-right">
//                 <div class="detail-item">
//                     <strong class="detail-label">Mobile:</strong> 
//                     <span class="detail-value">${
//                       data.participantMobileNumber || "N/A"
//                     }</span>
//                 </div>
//                 <div class="detail-item">
//                     <strong class="detail-label">Amount:</strong> 
//                     <span class="detail-value">₹${
//                       data.amount ? data.amount.toLocaleString("en-IN") : "N/A"
//                     }</span>
//                 </div>
//             </div>
//         </div>
//         `;
//   }

//   // Function to show error message
//   function showErrorMessage(message) {
//     // You can replace this with a more sophisticated error display
//     alert("Error: " + message);
//   }

//   // Function to reset button state
//   function resetButtonState() {
//     if (submitBtn && btnText && spinner) {
//       submitBtn.disabled = false;
//       btnText.textContent = "Partner Now";
//       spinner.style.display = "none";
//     }
//   }

//   // Close modal when clicking X
//   if (closeBtn) {
//     closeBtn.addEventListener("click", closeModal);
//   }

//   // Close modal when clicking "Close"
//   if (closeModalBtn) {
//     closeModalBtn.addEventListener("click", closeModal);
//   }

//   // Close modal when clicking outside of it
//   window.addEventListener("click", function (e) {
//     if (e.target === modal) {
//       closeModal();
//     }
//   });

//   // Close modal function
//   function closeModal() {
//     if (modal) {
//       modal.style.display = "none";
//       document.body.style.overflow = "auto";
//     }
//   }

//   // Close modal with Escape key
//   document.addEventListener("keydown", function (e) {
//     if (e.key === "Escape" && modal && modal.style.display === "block") {
//       closeModal();
//     }
//   });

//   // Make closeModal available globally if needed
//   window.closeModal = closeModal;
// });

// // Copy tracking token function (global scope)
// window.copyTrackingToken = function () {
//   const tokenElement = document.getElementById("trackingToken");
//   const copyBtn = document.getElementById("copyTokenBtn");

//   if (!tokenElement || !copyBtn) {
//     console.error("Token or copy button element not found");
//     return;
//   }

//   const token = tokenElement.textContent;

//   if (!token || token === "Loading...") {
//     showErrorMessage("No token available to copy");
//     return;
//   }

//   if (navigator.clipboard && navigator.clipboard.writeText) {
//     navigator.clipboard
//       .writeText(token)
//       .then(() => {
//         showCopySuccess(copyBtn);
//       })
//       .catch((err) => {
//         fallbackCopyTextToClipboard(token, copyBtn);
//       });
//   } else {
//     fallbackCopyTextToClipboard(token, copyBtn);
//   }
// };

// // Fallback copy function for older browsers
// function fallbackCopyTextToClipboard(text, button) {
//   const textArea = document.createElement("textarea");
//   textArea.value = text;
//   textArea.style.position = "fixed";
//   textArea.style.left = "-999999px";
//   textArea.style.top = "-999999px";
//   document.body.appendChild(textArea);
//   textArea.focus();
//   textArea.select();

//   try {
//     const successful = document.execCommand("copy");
//     if (successful) {
//       showCopySuccess(button);
//     } else {
//       throw new Error("Copy command failed");
//     }
//   } catch (err) {
//     alert("Please copy the token manually: " + text);
//   }

//   document.body.removeChild(textArea);
// }

// // Show copy success feedback
// function showCopySuccess(button) {
//   if (!button) return;

//   const originalText = button.textContent;
//   button.textContent = "✅ Copied!";
//   button.classList.add("copied");

//   setTimeout(() => {
//     button.textContent = originalText;
//     button.classList.remove("copied");
//   }, 2000);
// }

// // Error message function for global use
// function showErrorMessage(message) {
//   alert("Error: " + message);
// }



// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Modal elements
  const modal = document.getElementById("myModal");
  const form = document.getElementById("paricipantform"); // Note: keeping your original form ID with typo
  const closeBtn = document.getElementById("closeModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const submitBtn = document.getElementById("openmodal");

  // Check if all elements exist
  if (!modal || !form || !submitBtn) {
    console.error("Required elements not found. Check your HTML structure.");
    return;
  }

  // Add click event to button
  submitBtn.addEventListener("click", function (e) {
    e.preventDefault();
    processDonation();
  });

  // Updated processDonation function to work with modal
  async function processDonation() {
    // Validate form first
    const participantName = document.getElementById("participantsname");
    const organizationName = document.getElementById("organizationname");
    const participantEmail = document.getElementById("email");
    const participantMobileNumber = document.getElementById("mobilenumber");
    const amount = document.getElementById("customAmount");

    // Check if all required fields are filled
    if (
      !participantName.value.trim() ||
      !organizationName.value.trim() ||
      !participantEmail.value.trim() ||
      !participantMobileNumber.value.trim() ||
      !amount.value.trim()
    ) {
      showErrorMessage("Please fill in all required fields.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(participantEmail.value)) {
      showErrorMessage("Please enter a valid email address.");
      return;
    }

    // Basic mobile number validation (assuming 10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(participantMobileNumber.value)) {
      showErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      // Get project ID from various sources
      let projectId = null;

      if (typeof currentProjectId !== "undefined" && currentProjectId) {
        projectId = currentProjectId;
      } else if (document.body.getAttribute("data-project-id")) {
        projectId = document.body.getAttribute("data-project-id");
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        projectId = urlParams.get("id") || 11; // Default to 11 if no ID found
      }

      const formData = {
        projetcId: projectId,
        participantName: participantName.value.trim(),
        organizationName: organizationName.value.trim(),
        participantEmail: participantEmail.value.trim(),
        participantMobileNumber: participantMobileNumber.value.trim(),
        amount: parseInt(amount.value) || 0,
      };

      // Handle API call with Promise
      try {
        const apiPromise = participantNowServices.createParticipant(formData);

        // Handle the promise response
        apiPromise
          .then(function (response) {
            if (
              response &&
              response.data &&
              response.status &&
              (response.status === 200 || response.status === 201)
            ) {
              showSuccessModal(response);
            } else {
              showErrorMessage("Invalid response from server");
            }
          })
          .catch(function () {
            showErrorMessage("Failed to submit application. Please try again.");
          });
      } catch (error) {
        showErrorMessage("Failed to submit application. Please try again.");
      }
    } catch (error) {
      showErrorMessage(
        error.message || "Failed to submit application. Please try again."
      );
    }
  }

  // Function to show success modal with API response
  function showSuccessModal(response) {
    if (!response || !response.data) {
      showErrorMessage("Invalid response from server");
      return;
    }

    const data = response.data;

    // Display token from backend API response
    const tokenElement = document.getElementById("trackingToken");
    if (tokenElement && data.token) {
      tokenElement.textContent = data.token;
    }

    // Update participant details in modal
    updateModalWithParticipantDetails(data);

    // Show modal
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    // Reset form
    form.reset();
    if (document.getElementById("customAmount")) {
      document.getElementById("customAmount").value = "400000";
    }
  }

  // Function to update modal with participant details
  function updateModalWithParticipantDetails(data) {
    const modalBody = document.querySelector(".modal-body");

    if (!modalBody) return;

    let detailsSection = document.getElementById("applicationDetails");
    if (!detailsSection) {
      detailsSection = document.createElement("div");
      detailsSection.id = "applicationDetails";
      detailsSection.className = "application-details";

      const trackingInfo = document.querySelector(".tracking-info");
      if (trackingInfo) {
        trackingInfo.parentNode.insertBefore(
          detailsSection,
          trackingInfo.nextSibling
        );
      } else {
        modalBody.appendChild(detailsSection);
      }
    }

    detailsSection.innerHTML = `
      <h4>Application Details:</h4>
      <div class="details-row">
        <div class="details-col-left">
          <div class="detail-item"><strong>Participant:</strong> ${data.participantName || "N/A"}</div>
          <div class="detail-item"><strong>Organization:</strong> ${data.organizationName || "N/A"}</div>
          <div class="detail-item"><strong>Email:</strong> ${data.participantEmail || "N/A"}</div>
        </div>
        <div class="details-col-right">
          <div class="detail-item"><strong>Mobile:</strong> ${data.participantMobileNumber || "N/A"}</div>
          <div class="detail-item"><strong>Amount:</strong> ₹${data.amount ? data.amount.toLocaleString("en-IN") : "N/A"}</div>
        </div>
      </div>
    `;
  }

  // Function to show error message
  function showErrorMessage(message) {
    alert("Error: " + message);
  }

  // Close modal when clicking X
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking "Close"
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  // Close modal when clicking outside of it
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal function
  function closeModal() {
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.style.display === "block") {
      closeModal();
    }
  });

  window.closeModal = closeModal;
});

// Copy tracking token function (global scope)
window.copyTrackingToken = function () {
  const tokenElement = document.getElementById("trackingToken");
  const copyBtn = document.getElementById("copyTokenBtn");

  if (!tokenElement || !copyBtn) {
    console.error("Token or copy button element not found");
    return;
  }

  const token = tokenElement.textContent;

  if (!token || token === "Loading...") {
    alert("Error: No token available to copy");
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(token)
      .then(() => {
        showCopySuccess(copyBtn);
      })
      .catch(() => {
        fallbackCopyTextToClipboard(token, copyBtn);
      });
  } else {
    fallbackCopyTextToClipboard(token, copyBtn);
  }
};

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text, button) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      showCopySuccess(button);
    } else {
      throw new Error("Copy command failed");
    }
  } catch (err) {
    alert("Please copy the token manually: " + text);
  }

  document.body.removeChild(textArea);
}

// Show copy success feedback
function showCopySuccess(button) {
  if (!button) return;

  const originalText = button.textContent;
  button.textContent = "✅ Copied!";
  button.classList.add("copied");

  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("copied");
  }, 2000);
}
