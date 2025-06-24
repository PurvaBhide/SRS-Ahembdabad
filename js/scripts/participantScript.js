// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Modal elements
    const modal = document.getElementById('myModal');
    const form = document.getElementById('paricipantform'); // Note: your form ID has a typo
    const closeBtn = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitBtn = document.getElementById('openmodal');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');

    // Add click event to button
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
            processDonation();
    });

    // Updated processDonation function to work with modal
    async function processDonation() {
      // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Processing...';
        spinner.style.display = 'inline-block';

        try {
            const participantName = document.getElementById("participantsname").value;
            const organizationName = document.getElementById("organizationname").value;
            const participantEmail = document.getElementById("email").value;
            const participantMobileNumber = document.getElementById("mobilenumber").value;
            const amount = document.getElementById("customAmount").value;

         
            let projectId = null;

            if (typeof currentProjectId !== "undefined" && currentProjectId) {
                projectId = currentProjectId;
            } else if (document.body.getAttribute("data-project-id")) {
                projectId = document.body.getAttribute("data-project-id");
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                projectId = urlParams.get("id");
            }

            const formData = {
                projetcId: projectId,
                participantName,
                organizationName,
                participantEmail,
                participantMobileNumber,
                amount,
            };

              setTimeout(() => {
                const mockResponse = {
                    status: 201,
                    data: {
                        participantID: 123,
                        token: 'PA' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                        participantName: participantName,
                        organizationName: organizationName,
                        participantEmail: participantEmail,
                        participantMobileNumber: participantMobileNumber,
                        amount: parseInt(amount),
                        projetcId: projectId
                    }
                };
                   showSuccessModal(mockResponse);
            }, 1500);

           

        } catch (error) {
            console.error("Error submitting application:", error);
            showErrorMessage(error.message || 'Failed to submit application. Please try again.');
            
        } finally {
            // Reset button state
            resetButtonState();
        }
    }

    // Function to show success modal with API response
    function showSuccessModal(response) {
         
        const data = response.data;
        
        // Display token from backend API response
        document.getElementById('trackingToken').textContent = data.token;
        // document.getElementById('tokenDisplay').textContent = data.token;
        
        // Update participant details in modal
        updateModalWithParticipantDetails(data);
        
        // Show modal
          modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        form.reset();
        if (document.getElementById('customAmount')) {
            document.getElementById('customAmount').value = '400000';
        }
    }

    // Function to update modal with participant details
    function updateModalWithParticipantDetails(data) {
        const modalBody = document.querySelector('.modal-body');
        
        let detailsSection = document.getElementById('applicationDetails');
        if (!detailsSection) {
            detailsSection = document.createElement('div');
            detailsSection.id = 'applicationDetails';
            detailsSection.className = 'application-details';
            detailsSection.style.cssText = `
                background: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                text-align: left;
            `;
            
            const trackingInfo = document.querySelector('.tracking-info');
            if (trackingInfo) {
                trackingInfo.parentNode.insertBefore(detailsSection, trackingInfo.nextSibling);
            }
        }
        
        detailsSection.innerHTML = `
            <h4 style="color: #0A1E46; margin-bottom: 10px;">Application Details:</h4>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; font-size: 0.9em;">
              
                <strong>Participant:</strong> <span style="color:#34495e">${data.participantName || 'N/A'}</span>
                <strong>Organization:</strong> <span style="color:#34495e">${data.organizationName || 'N/A'}</span>
                <strong>Email:</strong> <span style="color:#34495e">${data.participantEmail || 'N/A'}</span>
                <strong>Mobile:</strong> <span style="color:#34495e">${data.participantMobileNumber || 'N/A'}</span>
                <strong>Amount:</strong> <span style="color:#34495e">₹${data.amount ? data.amount.toLocaleString('en-IN') : 'N/A'}</span>
             
            </div>
        `;
    }

    // Function to show error message
    function showErrorMessage(message) {
        alert('Error: ' + message);
    }

    // Function to reset button state
    function resetButtonState() {
        submitBtn.disabled = false;
        btnText.textContent = 'Partner Now';
        spinner.style.display = 'none';
    }

    // Close modal when clicking X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking "Got it, Thanks!"
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal function
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Copy tracking token function
    window.copyTrackingToken = function() {
        const token = document.getElementById('trackingToken').textContent;
        const copyBtn = document.getElementById('copyTokenBtn');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(token).then(() => {
                showCopySuccess(copyBtn);
            }).catch(() => {
                fallbackCopyTextToClipboard(token, copyBtn);
            });
        } else {
            fallbackCopyTextToClipboard(token, copyBtn);
        }
    }

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
            document.execCommand('copy');
            showCopySuccess(button);
        } catch (err) {
            alert('Please copy the token manually: ' + text);
        }
        
        document.body.removeChild(textArea);
    }

    // Show copy success feedback
    function showCopySuccess(button) {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

});





















// function processDonation() {
//   const participantName = document.getElementById("participantsname").value;
//   const organizationName = document.getElementById("organizationname").value;
//   const participantEmail = document.getElementById("email").value;
//   const participantMobileNumber = document.getElementById("mobilenumber").value;
//   const amount = document.getElementById("customAmount").value;

//   let projetcId = null;

//   if (typeof currentProjectId !== "undefined" && currentProjectId) {
//     projetcId = currentProjectId;
//   } else if (document.body.getAttribute("data-project-id")) {
//     projetcId = document.body.getAttribute("data-project-id");
//   } else {
//     const urlParams = new URLSearchParams(window.location.search);
//     projetcId = urlParams.get("id");
//   }

//   const formData = {
//     projetcId,
//     participantName,
//     organizationName,
//     participantEmail,
//     participantMobileNumber,
//     amount,
//   };

//   var response = participantNowServices.createParticipant(formData);
//   if (response.status === 200 || response.status === 201) {

//     console.log(response.data);
   
//   modal.show();
//   }
 
// }
























