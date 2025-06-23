// Track Application Script with Document Download
document.addEventListener('DOMContentLoaded', function() {
    const trackButton = document.querySelector('#trackappicationbtn');
    const trackInput = document.querySelector('#applicationtoken');
    const trackForm = document.querySelector('#trackappication form');

    if (!trackButton || !trackInput || !trackForm) {
        console.log('❌ Track elements not found');
        return;
    }

    console.log('✅ Track Application elements found');

    // Handle form submission
    trackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleTracking();
    });

    // Handle button click
    trackButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleTracking();
    });

    // Handle Enter key
    trackInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
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
            console.log('📦 Service Response:', response);

            // Hide loading state
            hideLoadingState();

            // Handle different status codes
            if (response.status === 400) {
                // Check for specific error messages
                if (response.message && response.message.includes("Invalid token prefix")) {
                    alert("Invalid token format. Please check your token and try again.");
                } else {
                    alert("Please enter a valid token");
                }
            } else if (response.status === 200) {
                showApplicationDetails(response.data);
            } else {
                alert("Something went wrong. Please try again.");
            }

        } catch (error) {
            console.log('❌ Service Error:', error);
            hideLoadingState();
            alert("Error occurred while tracking. Please try again.");
        }
    }

    function showLoadingState() {
        trackButton.disabled = true;
        trackButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
    }

    function hideLoadingState() {
        trackButton.disabled = false;
        trackButton.innerHTML = 'Track Application<i class="fas fa-paper-plane"></i>';
    }

    function showApplicationDetails(data) {
        const modal = document.getElementById('trackModal');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalBody) {
            console.error('❌ Modal elements not found');
            alert('Unable to display details. Please refresh the page.');
            return;
        }

        // Determine status styling
        let statusClass = 'status-pending';
        let statusIcon = 'fas fa-clock';

        switch(data.fundanideastatus?.toLowerCase()) {
            case 'approved':
                statusClass = 'status-approved';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusIcon = 'fas fa-times-circle';
                break;
            case 'in-progress':
                statusClass = 'status-in-progress';
                statusIcon = 'fas fa-cog fa-spin';
                break;
            default:
                statusClass = 'status-pending';
                statusIcon = 'fas fa-clock';
        }

        modalBody.innerHTML = `
            <div class="status-badge ${statusClass}">
                <i class="${statusIcon}"></i>
                ${data.fundanideastatus || 'Unknown'}
            </div>

            <div class="info-grid">
                <div class="info-item highlight-item">
                    <div class="info-label">Application Token</div>
                    <div class="info-value">${data.fundanideatoken || 'N/A'}</div>
                </div>

                <div class="info-item highlight-item">
                    <div class="info-label">Project Name</div>
                    <div class="info-value">${data.fundanideaprojectname || 'N/A'}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Nature of Project</div>
                    <div class="info-value">${data.natureofproject || 'N/A'}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Location</div>
                    <div class="info-value">${data.fundanideaprojectlocation || 'N/A'}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Department</div>
                    <div class="info-value">${data.fundanideadepartment || 'N/A'}</div>
                </div>

                <div class="info-item">
                    <div class="info-label">Organization Name</div>
                    <div class="info-value">${data.fundanideaorganizationname || 'N/A'}</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Contact Person</div>
                    <div class="info-value">${data.fundanideacontactpersonname || 'N/A'}</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Email ID</div>
                    <div class="info-value">${data.fundanideaemailid || 'N/A'}</div>
                </div>

                <div class="info-item contact-item">
                    <div class="info-label">Phone Number</div>
                    <div class="info-value">${data.fundanideaphonenumber || 'N/A'}</div>
                </div>

                <div class="info-item amount-item">
                    <div class="info-label">Estimated Amount</div>
                    <div class="info-value">₹${formatAmount(data.fundanideaestimateamount)}</div>
                </div>

                <div class="info-item full-width">
                    <div class="info-label">Project Description</div>
                    <div class="info-value">${data.fundanideadescription || 'N/A'}</div>
                </div>

                ${data.fundanideadocement ? `
                <div class="info-item full-width document-item" style="cursor: pointer;" onclick="downloadDocument('${data.fundanideadocement}', '${data.fundanideatoken}')">
                    <div class="info-label">Document</div>
                    <div class="info-value" style="color: #007bff; text-decoration: underline;">
                        <i class="fas fa-file-alt"></i> ${data.fundanideadocement}
                        <i class="fas fa-download" style="margin-left: 8px; font-size: 0.8rem;"></i>
                        <span style="font-size: 0.8rem; color: #6c757d; margin-left: 5px;">(Click to download)</span>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function formatAmount(amount) {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-IN').format(amount);
    }
});

// Document download function
function downloadDocument(documentName, token) {
    try {
        console.log('📥 Downloading document:', documentName);
        console.log('🎫 For token:', token);
        
        // Option 1: If you have a direct download API
        const downloadUrl = `/downloadDocument/${token}/${documentName}`;
        
        // Option 2: If documents are stored with full URLs
        // const downloadUrl = documentName; // If documentName contains full URL
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = documentName;
        link.target = '_blank';
        
        // Add to document temporarily
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Remove the link
        document.body.removeChild(link);
        
        // Show success message
        showDownloadMessage('Document download started successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Download Error:', error);
        showDownloadMessage('Failed to download document. Please try again.', 'error');
    }
}

// Alternative download function using fetch (if you need to handle authentication)
async function downloadDocumentWithAuth(documentName, token) {
    try {
        console.log('📥 Downloading document with auth:', documentName);
        
        showDownloadMessage('Preparing download...', 'info');
        
        // Call your API to get the document
        const response = await fetch(`/api/downloadDocument/${token}/${documentName}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + 'YOUR_AUTH_TOKEN', // Add your auth token if needed
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        // Get the blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documentName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        showDownloadMessage('Document downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Download Error:', error);
        showDownloadMessage('Failed to download document. Please try again.', 'error');
    }
}

// Show download message
function showDownloadMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
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
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            messageDiv.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            break;
        case 'error':
            messageDiv.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
            break;
        case 'info':
            messageDiv.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
            break;
    }
    
    messageDiv.textContent = message;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Modal control functions
function closeTrackModal() {
    const modal = document.getElementById('trackModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('trackModal');
    if (e.target === modal) {
        closeTrackModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTrackModal();
    }
});

// Add CSS for animations
const style = document.createElement('style');
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






















