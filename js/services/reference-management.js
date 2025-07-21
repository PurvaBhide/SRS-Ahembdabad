document.addEventListener("DOMContentLoaded", () => {
  Api.document.getByType("reference")
    .then((response) => {
      if (response?.status === 200 && Array.isArray(response.data?.content)) {
        const pdfGrid = document.querySelector(".pdf-grid");
        pdfGrid.innerHTML = ""; // Clear existing content if any

        response.data.content.forEach((doc) => {
          const pdfCard = document.createElement("div");
          pdfCard.className = "pdf-card";

          pdfCard.innerHTML = `
            <div class="pdf-preview" onclick="openPDF('${doc.documenturl}')">
              <div class="pdf-icon">📄</div>
            </div>
            <div class="pdf-info">
              <h3>${doc.documenttitle || "Untitled Document"}</h3>
              <p class="pdf-description">${doc.documentshortdesc || ""}</p>
            </div>
            <div class="pdf-actions">
              <button class="btn btn-primary" onclick="openPDF('${doc.documenturl}')">
                View
              </button>
              <a href="${doc.documenturl}" download class="btn">
                Download
              </a>
            </div>
          `;

          pdfGrid.appendChild(pdfCard);
        });
      } else {
        console.error("No reference documents found or invalid response format.");
      }
    })
    .catch((error) => {
      console.error("Error fetching reference documents:", error);
    });
});

// Opens PDF in a new tab
function openPDF(url) {
  window.open(url, "_blank");
}
