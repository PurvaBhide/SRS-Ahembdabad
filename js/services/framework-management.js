// DOM Elements
const pdfGrid = document.querySelector('.pdf-grid');

// Function to render PDF cards
function renderPDFCards(apiResponse) {
    // Clear existing content
    pdfGrid.innerHTML = '';
    console.log(apiResponse, "apiResponse");

    // Check if response was successful
    if (apiResponse.status !== 200) {
        pdfGrid.innerHTML = `<p class="error">${apiResponse.message || 'Failed to load documents'}</p>`;
        return;
    }

    // Get documents array
    const documents = apiResponse.data?.content || [];
    
    // If no documents, show a message
    if (documents.length === 0) {
        pdfGrid.innerHTML = '<p class="no-documents">No documents available</p>';
        return;
    }

    // Create cards for each document
    documents.forEach(doc => {
        const pdfCard = document.createElement('div');
        pdfCard.className = 'pdf-card';

        pdfCard.innerHTML = `
            <div class="pdf-preview" onclick="openPDF('${doc.documenturl.replace(/'/g, "\\'")}')">
                <div class="pdf-icon">📄</div>
            </div>
            <div class="pdf-info">
                <h3>${doc.documenttitle}</h3>
                <p class="pdf-type">${doc.documentType}</p>
                <p class="pdf-description">${doc.documentshortdesc}</p>
            </div>
            <div class="pdf-actions">
                <button class="btn btn-primary" onclick="openPDF('${doc.documenturl.replace(/'/g, "\\'")}')">
                    View
                </button>
                <a href="${encodeURI(doc.documenturl)}" download="${doc.documenttitle.replace(/[^a-z0-9]/gi, '_')}.pdf" class="btn">
                    Download
                </a>
            </div>
        `;

        pdfGrid.appendChild(pdfCard);
    });
}

// Function to open PDF in new tab with better error handling
function openPDF(url) {
    // Clean up the URL first
    const cleanedUrl = url.trim();
    console.log('Attempting to open:', cleanedUrl);
    
    try {
        const encodedUrl = encodeURI(cleanedUrl);
        const newWindow = window.open('', '_blank');
        
        // Test if the PDF is accessible
        fetch(encodedUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    newWindow.location.href = encodedUrl;
                } else {
                    newWindow.close();
                    throw new Error(`Server returned ${response.status}`);
                }
            })
            .catch(error => {
                console.error('PDF access error:', error);
                alert('Failed to open PDF. Please try downloading instead.');
            });
    } catch (error) {
        console.error('Error opening PDF:', error);
        alert('Error opening document. The URL might be invalid.');
    }
}

// Function to initialize the document library
async function initDocumentLibrary() {
    try {
        // Show loading state
        pdfGrid.innerHTML = '<div class="loading">Loading documents...</div>';
        
        // Fetch documents from API (gets full response)
        const apiResponse = await Api.document.listFramework();
        
        // Render the documents
        renderPDFCards(apiResponse);
        console.log(apiResponse,"apiResponseapiResponseapiResponseapiResponseapiResponse");
    } catch (error) {
        console.error('Error initializing document library:', error.status);
      
        pdfGrid.innerHTML = `<p class="error">
        <span style="color:#0b1e46;">The document has not been released yet. We appreciate your patience.<span> </p>`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDocumentLibrary);


