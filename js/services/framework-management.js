// DOM Elements
const pdfGridSelector = '.pdf-grid';
const pdfGrid = document.querySelector(pdfGridSelector); // should be a container div
const pdfSection = pdfGrid ? pdfGrid.parentElement : document.body;

// Helper: create/remove error row outside .pdf-grid
function showErrorRow(message, type = 'info') {
  hidePdfGrid();

  let existing = document.querySelector('.pdf-error-row');
  if (existing) {
    existing.innerHTML = getErrorColHtml(message, type);
    return;
  }

  const row = document.createElement('div');
  row.className = 'row pdf-error-row pb-4';
  row.innerHTML = getErrorColHtml(message, type);

  if (pdfGrid && pdfGrid.parentElement) {
    pdfGrid.parentElement.insertBefore(row, pdfGrid);
  } else {
    pdfSection.appendChild(row);
  }
}

function getErrorColHtml(message, type) {
  const alertClass =
    type === 'danger' ? 'alert-danger' :
    type === 'warning' ? 'alert-warning' : 'alert-info';

  return `
    <div class="col-12">
      <div class="alert ${alertClass} text-center m-0 py-P">
        ${message}
      </div>
    </div>
  `;
}

function removeErrorRow() {
  const existing = document.querySelector('.pdf-error-row');
  if (existing) existing.remove();
}

function hidePdfGrid() {
  if (pdfGrid) pdfGrid.style.display = 'none';
}

function showPdfGrid() {
  if (pdfGrid) pdfGrid.style.display = '';
}

// Render the PDF cards into the .pdf-grid (flex-based)
function renderPDFGrid(documents) {
  removeErrorRow();
  showPdfGrid();

  if (!pdfGrid) {
    console.error('PDF grid element not found:', pdfGridSelector);
    return;
  }

  pdfGrid.innerHTML = ''; // Clear existing

  documents.forEach(doc => {
    const title = doc.documenttitle || 'Untitled Document';
    const type = doc.documentType || '';
    const shortDesc = doc.documentshortdesc || '';
    const rawUrl = doc.documenturl || '';
    const safeUrlForOnclick = String(rawUrl).replace(/'/g, "\\'");

    const col = document.createElement('div');
    col.className = 'pdf-col';

    col.innerHTML = `
      <div class="pdf-card card h-100">
        <div class="card-body d-flex flex-column">
          <div class="pdf-preview mb-3" style="cursor:pointer;" onclick="openPDF('${safeUrlForOnclick}')">
            <div class="pdf-icon" style="font-size:36px;">📄</div>
          </div>
          <div class="pdf-info mb-3">
            <h6 class="card-title mb-1">${escapeHtml(title)}</h6>
            <p class="small text-muted mb-1">${escapeHtml(type)}</p>
            <p class="small text-muted mb-0">${escapeHtml(shortDesc)}</p>
          </div>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-primary" onclick="openPDF('${safeUrlForOnclick}')">View</button>
            <a href="${encodeURI(rawUrl)}" download="${sanitizeFilename(title)}.pdf" class="btn btn-sm btn-outline-secondary">Download</a>
          </div>
        </div>
      </div>
    `;

    pdfGrid.appendChild(col);
  });
}

// Main rendering logic
function renderPDFCards(apiResponse) {
  if (!apiResponse) {
    showErrorRow('Failed to load documents. Please try again later.', 'danger');
    return;
  }

  if (apiResponse.status !== 200) {
    showErrorRow(apiResponse.message || 'Failed to load documents', 'warning');
    return;
  }

  const documents = apiResponse.data?.content || [];
  if (!documents.length) {
    showErrorRow('The document has not been released yet. We appreciate your patience.', 'info');
    return;
  }

  renderPDFGrid(documents);
}

// PDF open with HEAD check and fallback
function openPDF(url) {
  if (!url) {
    alert('Document URL missing.');
    return;
  }

  const encodedUrl = encodeURI(url.trim());
  const newWindow = window.open('', '_blank');

  fetch(encodedUrl, { method: 'HEAD' })
    .then(res => {
      if (res.ok) {
        newWindow.location.href = encodedUrl;
      } else {
        newWindow.close();
        alert('Failed to open PDF. Try downloading.');
      }
    })
    .catch(() => {
      newWindow.close();
      alert('Error opening document.');
    });
}

// Init library
async function initDocumentLibrary() {
  // Show a temporary loading row (outside .pdf-grid)
  showErrorRow(`<div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading documents...</div>`, 'info');

  try {
    const apiResponse = await Api.document.listFramework();
    renderPDFCards(apiResponse);
  } catch (error) {
    console.error('Error initializing document library:', error);
    showErrorRow('The document has not been released yet. We appreciate your patience.', 'info');
  }
}

// Utilities
function sanitizeFilename(name) {
  return String(name || 'document').replace(/[^a-z0-9_\-\.]/gi, '_');
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start on DOM load
document.addEventListener('DOMContentLoaded', initDocumentLibrary);
