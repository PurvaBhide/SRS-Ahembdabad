// Helper: selects the pdf-grid and its parent container
const pdfGridSelector = ".pdf-grid";
const pdfGrid = document.querySelector(pdfGridSelector);
const pdfContainer = pdfGrid ? pdfGrid.parentElement : document.body;

// Create / update / remove a full-width message row (inserted outside/above the grid)
function showFullWidthMessage(message, level = "info") {
  // hide the grid
  if (pdfGrid) pdfGrid.style.display = "none";

  // find existing message row
  let row = document.querySelector(".pdf-message-row");
  const alertClass =
    level === "danger" ? "alert-danger" : level === "warning" ? "alert-warning" : "alert-info";

  const colHtml = `
    <div class="col-12">
      <div class="alert ${alertClass} text-center m-0 py-4">
        ${message}
      </div>
    </div>`;

  if (row) {
    row.innerHTML = colHtml;
    return;
  }

  row = document.createElement("div");
  row.className = "row pdf-message-row pb-4";
  row.innerHTML = colHtml;

  // Insert the message row before the pdfGrid if possible, otherwise append to container
  if (pdfGrid && pdfGrid.parentElement) {
    pdfGrid.parentElement.insertBefore(row, pdfGrid);
  } else {
    pdfContainer.appendChild(row);
  }
}

function removeFullWidthMessage() {
  const existing = document.querySelector(".pdf-message-row");
  if (existing) existing.remove();
  if (pdfGrid) pdfGrid.style.display = ""; // show grid
}

// Main logic: fetch reference documents and render or show message
document.addEventListener("DOMContentLoaded", () => {
  Api.document.getByType("reference")
    .then((response) => {
      // Validate structure: status 200 and array content
      if (response?.status === 200 && Array.isArray(response.data?.content)) {
        const docs = response.data.content;

        if (!docs.length) {
          // No documents found
          showFullWidthMessage("No reference documents available at the moment. Please check back later.", "info");
          return;
        }

        // We have documents -> remove any message row and render
        removeFullWidthMessage();

        // Ensure grid exists
        if (!pdfGrid) {
          console.error("PDF grid element not found in DOM:", pdfGridSelector);
          return;
        }

        // Clear existing content
        pdfGrid.innerHTML = "";

        // Render each doc card (kept similar structure to yours)
        docs.forEach((doc) => {
          const pdfCard = document.createElement("div");
          pdfCard.className = "pdf-card";

          const urlEscaped = (doc.documenturl || "").replace(/'/g, "\\'");
          const title = doc.documenttitle || "Untitled Document";
          const desc = doc.documentshortdesc || "";

          pdfCard.innerHTML = `
        
            <div class="pdf-info">
              <h3>${escapeHtml(title)}</h3>
              <p class="pdf-description">${escapeHtml(desc)}</p>
            </div>
            <div class="pdf-actions">
              <button class="btn btn-primary" onclick="openPDF('${urlEscaped}')">
                View
              </button>
              <a href="${encodeURI(doc.documenturl || '')}" download class="btn">
                Download
              </a>
            </div>
          `;

          pdfGrid.appendChild(pdfCard);
        });
      } else {
        // Response format invalid or zero status
        console.error("No reference documents found or invalid response format.", response);
        showFullWidthMessage("No reference documents found or response format invalid.", "warning");
      }
    })
    .catch((error) => {
      console.error("Error fetching reference documents:", error);
      showFullWidthMessage("Failed to load reference documents. Please try again later.", "danger");
    });
});

// Simple openPDF helper
function openPDF(url) {
  if (!url) {
    alert("Document URL is missing.");
    return;
  }
  window.open(url, "_blank");
}

// small helper to escape HTML to avoid injection in titles/descriptions
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
