// Track Application Script - Handles both FundAnIdea and Participant responses
document.addEventListener("DOMContentLoaded", function () {
  const trackButton = document.querySelector("#trackappicationbtn");
  const trackInput = document.querySelector("#applicationtoken");
  const trackForm = document.querySelector("#trackappication form");

  if (!trackButton || !trackInput || !trackForm) {
    console.log("❌ Track elements not found");
    return;
  }

  console.log("✅ Track Application elements found");

  // Handle form submission
  trackForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleTracking();
  });

  // Handle button click
  trackButton.addEventListener("click", function (e) {
    e.preventDefault();
    handleTracking();
  });

  // Handle Enter key
  trackInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTracking();
    }
  });

  async function handleTracking() {
    const token = trackInput.value.trim();

    if (!token) {
      alert("Please enter a token");
      return;
    }

    // Show loading state
    showLoadingState();

    try {
      // Pass token to service
      const response = await trackApplicationServices.trackApplication(token);

      // Log response
      console.log("📦 Service Response:", response);

      // Hide loading state
      hideLoadingState();

      // Handle different status codes
      if (response.status === 400) {
        // Check for specific error messages
        if (
          response.message &&
          response.message.includes("Invalid token prefix")
        ) {
          alert("Invalid token format. Please check your token and try again.");
        } else {
          alert("Please enter a valid token");
        }
      } else if (response.status === 200) {
        showApplicationDetails(response.data, response.message);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.log("❌ Service Error:", error);
      hideLoadingState();
      alert("Error occurred while tracking. Please try again.");
    }
  }

  function showLoadingState() {
    trackButton.disabled = true;
    trackButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Tracking...';
  }

  function hideLoadingState() {
    trackButton.disabled = false;
    trackButton.innerHTML =
      'Track Application<i class="fas fa-paper-plane"></i>';
  }

  function showApplicationDetails(data, message) {
    const modal = document.getElementById("trackModal");
    const modalBody = document.getElementById("modalBody");

    if (!modal || !modalBody) {
      console.error("❌ Modal elements not found");
      alert("Unable to display details. Please refresh the page.");
      return;
    }

    // Determine if this is a FundAnIdea or Participant response
    const isFundAnIdea = data.fundanideaid !== undefined;
    const isParticipant = data.participant !== undefined;

    console.log(
      "📊 Response Type:",
      isFundAnIdea ? "FundAnIdea" : "Participant"
    );
   

    // Extract actual data based on response type
    const actualData = isParticipant ? data.participant : data;
    const projectdata= isParticipant?data.project:data;

    // Get status from appropriate field using ternary operators
    const status = isFundAnIdea
      ? data.fundanideastatus || "Unknown"
      : isParticipant
      ? actualData.status || "Pending"
      : "Unknown";

    // Determine status styling
    let statusClass = "status-pending";
    let statusIcon = "fas fa-clock";

    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        statusClass = "status-approved";
        statusIcon = "fas fa-check-circle";
        break;
      case "rejected":
      case "declined":
        statusClass = "status-rejected";
        statusIcon = "fas fa-times-circle";
        break;
      case "in-progress":
      case "progress":
      case "processing":
        statusClass = "status-in-progress";
        statusIcon = "fas fa-cog fa-spin";
        break;
      case "pending":
      case null:
      case "":
      default:
        statusClass = "status-pending";
        statusIcon = "fas fa-clock";
    }

    modalBody.innerHTML = `
            <div class="status-badge ${statusClass}">
                <i class="${statusIcon}"></i>
              
              ${
                isFundAnIdea
                  ? data.fundanideastatus || "Status not updated yet"
                  : isParticipant
                  ? actualData.status || "Status not updated yet"
                  : "N/A"
              }

            </div>

            <div class="info-grid">
                <div class="info-item highlight-item">
                    <div class="info-label">Application Token</div>
                    <div class="info-value">${
                      isFundAnIdea
                        ? data.fundanideatoken || "N/A"
                        : isParticipant
                        ? actualData.token || "N/A"
                        : "N/A"
                    }</div>
                </div>

                <div class="info-item highlight-item">
                    <div class="info-label">${
                      isFundAnIdea ? "Project Name" : "Participant Name"
                    }</div>
                    <div class="info-value">${
                      isFundAnIdea
                        ? data.fundanideaprojectname || "N/A"
                        : isParticipant
                        ? actualData.participantName || "N/A"
                        : "N/A"
                    }</div>
                </div>

                ${
                  isFundAnIdea
                    ? `
                <div class="info-item">
                    <div class="info-label">Nature of Project</div>
                    <div class="info-value">${
                      data.natureofproject || "N/A"
                    }</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Location</div>
                    <div class="info-value">${
                      data.fundanideaprojectlocation || "N/A"
                    }</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Department</div>
                    <div class="info-value">${
                      data.fundanideadepartment || "N/A"
                    }</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Organization Name</div>
                    <div class="info-value">${
                      data.fundanideaorganizationname || "N/A"
                    }</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Contact Person</div>
                    <div class="info-value">${
                      data.fundanideacontactpersonname || "N/A"
                    }</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Email ID</div>
                    <div class="info-value">${
                      data.fundanideaemailid || "N/A"
                    }</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">${
                      data.fundanideaphonenumber || "N/A"
                    }</div>
                </div>

                <div class="info-item amount-item">
                    <div class="info-label">Estimated Amount</div>
                    <div class="info-value">₹${formatAmount(
                      data.fundanideaestimateamount
                    )}</div>
                </div>

                <div class="info-item full-width">
                    <div class="info-label">Project Description</div>
                    <div class="info-value">${
                      data.fundanideadescription || "N/A"
                    }</div>
                </div>

                ${
                  data.fundanideadocement
                    ? `
                <div class="info-item full-width document-item" style="cursor: pointer;" onclick="openDocument('${data.fundanideadocement}', '${data.fundanideatoken}')">
                    <div class="info-label">Document</div>
                    <div class="info-value" style="color: #007bff; text-decoration: underline;">
                        <i class="fas fa-file-alt"></i> ${data.fundanideadocement}
                        <i class="fas fa-external-link-alt" style="margin-left: 8px; font-size: 0.8rem;"></i>
                        <span style="font-size: 0.8rem; color: #6c757d; margin-left: 5px;">(Click to open)</span>
                    </div>
                </div>
                `
                    : ""
                }
                `
                    : isParticipant
                    ? `
                <div class="info-item">
                    <div class="info-label">Project name</div>
                    <div class="info-value">${
                      projectdata.projectName || "N/A"
                    }</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Project Status</div>
                    <div class="info-value">${actualData.status || "N/A"}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Organization Name</div>
                    <div class="info-value">${
                      actualData.organizationName || "N/A"
                    }</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Email ID</div>
                    <div class="info-value">${
                      actualData.participantEmail || "N/A"
                    }</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Mobile Number</div>
                    <div class="info-value">${
                      actualData.participantMobileNumber || "N/A"
                    }</div>
                </div>

                <div class="info-item amount-item">
                    <div class="info-label">Amount</div>
                    <div class="info-value">₹${formatAmount(
                      actualData.amount
                    )}</div>
                </div>
<div class="info-item contact-item">
                    <div class="info-label"> note</div>
                    <div class="info-value">${
                      actualData.note || "No notes available"
                    }</div>
                </div>
                ${
                  actualData.note
                    ? `
                <div class="info-item full-width">
                    <div class="info-label">Notes</div>
                    <div class="info-value">${
                      actualData.note || "No notes available"
                    }</div>
                </div>
                `
                    : ""
                }
                `
                    : ""
                }
            </div>
        `;

    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function formatAmount(amount) {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN").format(amount);
  }
});

// Open document in new tab function
function openDocument(documentUrl, token) {
  try {
    console.log("📂 Opening document:", documentUrl);
    console.log("🎫 For token:", token);

    // Show opening message
    showDocumentMessage("Opening document...", "info");

    // Check if documentUrl is a full URL or just filename
    let finalUrl;
    if (documentUrl.startsWith("http")) {
      // Full URL provided
      finalUrl = documentUrl;
    } else {
      // Construct URL with different possible patterns
      finalUrl = `https://lakhpatididi.in/SRS-documents/${documentUrl}`;
    }

    console.log("🔗 Final URL:", finalUrl);

    // Open in new tab
    const newTab = window.open(finalUrl, "_blank");

    if (newTab) {
      showDocumentMessage("Document opened in new tab!", "success");
    } else {
      showDocumentMessage(
        "Failed to open document. Please check popup blocker.",
        "error"
      );
    }
  } catch (error) {
    console.error("❌ Document Open Error:", error);
    showDocumentMessage("Failed to open document.", "error");
  }
}

// Show document message
function showDocumentMessage(message, type) {
  // Create message element
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10003;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;

  // Set background color based on type
  switch (type) {
    case "success":
      messageDiv.style.background = "linear-gradient(135deg, #28a745, #20c997)";
      break;
    case "error":
      messageDiv.style.background = "linear-gradient(135deg, #dc3545, #c82333)";
      break;
    case "info":
      messageDiv.style.background = "linear-gradient(135deg, #007bff, #0056b3)";
      break;
  }

  messageDiv.textContent = message;

  // Add to page
  document.body.appendChild(messageDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    messageDiv.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      if (messageDiv.parentNode) {
        document.body.removeChild(messageDiv);
      }
    }, 300);
  }, 3000);
}

// Modal control functions
function closeTrackModal() {
  const modal = document.getElementById("trackModal");
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("trackModal");
  if (e.target === modal) {
    closeTrackModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeTrackModal();
  }
});

// Add CSS for animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .document-item:hover {
        background-color: #f8f9fa !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .document-item .info-value {
        transition: color 0.3s ease;
    }
    
    .document-item:hover .info-value {
        color: #0056b3 !important;
    }
`;
document.head.appendChild(style);
