// Form Management
class CorporateRequestForm {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 2;
    this.uploadedFileUrl = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateStepIndicators();
    this.showStep(this.currentStep);
  }

  bindEvents() {
    // File upload handler
    const fileInput = document.getElementById('projectDoc');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Form navigation
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (nextBtn) nextBtn.onclick = () => this.nextStep();
    if (backBtn) backBtn.onclick = () => this.previousStep();
    if (submitBtn) submitBtn.onclick = () => this.submitForm();
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    const label = document.getElementById('fileLabel');
    
    if (!file) {
      label.textContent = '📁 Choose File - No file chosen';
      label.classList.remove('file-selected');
      this.uploadedFileUrl = null;
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PDF or Word documents');
      event.target.value = '';
      return;
    }

    // Show uploading state
    label.textContent = '📁 Uploading...';
    label.classList.add('file-uploading');

    try {
      // Debug logging
      console.log('Checking service availability...');
      console.log('window.fundanideaService:', window.fundanideaService);
      console.log('typeof fundanideaService:', typeof fundanideaService);
      
      // Create the upload function directly to avoid reference errors
      const uploadFile = async function(file) {
        const formData = new FormData();
        formData.append('files', file);
        
        return $.ajax({
          url: 'https://mumbailocal.org:8087/upload/documents',
          method: 'POST',
          data: formData,
          processData: false,
          contentType: false
        });
      };
      
      console.log('Starting file upload...');
      
      // Use the upload function directly
      const response = await uploadFile(file);
      
      // Based on your API response structure: response.url
      this.uploadedFileUrl = response.url || response.data?.url || file.name;
      
      label.textContent = `📁 ${file.name} ✓`;
      label.classList.remove('file-uploading');
      label.classList.add('file-selected');
      
      console.log('File uploaded successfully:', this.uploadedFileUrl);
      console.log('Full API response:', response);
    } catch (error) {
      console.error('File upload failed:', error);
      label.textContent = `📁 Upload failed - ${file.name}`;
      label.classList.remove('file-uploading');
      label.classList.add('file-error');
      
      // Show error message to user
      alert('File upload failed. Please try again.');
      this.uploadedFileUrl = null;
    }
  }

  updateStepIndicators() {
    for (let i = 1; i <= this.totalSteps; i++) {
      const step = document.getElementById(`step${i}`);
      const connector = document.getElementById(`connector${i}`);

      if (i < this.currentStep) {
        step.className = 'step completed';
        if (connector) connector.className = 'step-connector completed';
      } else if (i === this.currentStep) {
        step.className = 'step active';
      } else {
        step.className = 'step inactive';
        if (connector) connector.className = 'step-connector';
      }
    }
  }

  showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));

    // Show current step
    if (step <= this.totalSteps) {
      document.getElementById(`formStep${step}`).classList.add('active');
    } else {
      document.getElementById('successStep').classList.add('active');
    }

    // Update buttons
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (step === 1) {
      backBtn.style.display = 'none';
      nextBtn.style.display = 'block';
      submitBtn.style.display = 'none';
    } else if (step === this.totalSteps) {
      backBtn.style.display = 'block';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'block';
    } else if (step > this.totalSteps) {
      backBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'none';
    }
  }

  validateStep(step) {
    let isValid = true;

    if (step === 1) {
      const fields = ['projectNature', 'projectName', 'location', 'department'];
      fields.forEach(field => {
        const element = document.getElementById(field);
        const errorElement = document.getElementById(field + 'Error');

        if (!element.value.trim()) {
          errorElement.style.display = 'block';
          element.style.borderColor = '#dc3545';
          isValid = false;
        } else {
          errorElement.style.display = 'none';
          element.style.borderColor = '#e9ecef';
        }
      });
    } else if (step === 2) {
      const fields = ['orgName', 'email', 'phone', 'contactPerson', 'estimatedAmount'];
      fields.forEach(field => {
        const element = document.getElementById(field);
        const errorElement = document.getElementById(field + 'Error');

        if (!element.value.trim()) {
          errorElement.style.display = 'block';
          element.style.borderColor = '#dc3545';
          isValid = false;
        } else {
          errorElement.style.display = 'none';
          element.style.borderColor = '#e9ecef';
        }
      });

      // Email validation
      const email = document.getElementById('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email.value && !emailRegex.test(email.value)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        document.getElementById('emailError').style.display = 'block';
        email.style.borderColor = '#dc3545';
        isValid = false;
      }

      // Phone validation
      const phone = document.getElementById('phone');
      const phoneRegex = /^[0-9]{10}$/;
      if (phone.value && !phoneRegex.test(phone.value.replace(/\D/g, ''))) {
        document.getElementById('phoneError').textContent = 'Please enter a valid 10-digit phone number';
        document.getElementById('phoneError').style.display = 'block';
        phone.style.borderColor = '#dc3545';
        isValid = false;
      }
    }

    return isValid;
  }

  nextStep() {
    if (this.validateStep(this.currentStep)) {
      this.currentStep++;
      this.showStep(this.currentStep);
      this.updateStepIndicators();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
      this.updateStepIndicators();
    }
  }

  collectFormData() {
    return {
      natureofproject: document.getElementById('projectNature').value,
      fundanideaprojectname: document.getElementById('projectName').value,
      fundanideaprojectlocation: document.getElementById('location').value,
      fundanideadepartment: document.getElementById('department').value,
      fundanideadocement: this.uploadedFileUrl || '', // Use uploaded file URL
      fundanideadescription: document.getElementById('estimatedImpact').value,
      fundanideaorganizationname: document.getElementById('orgName').value,
      fundanideaemailid: document.getElementById('email').value,
      fundanideaphonenumber: document.getElementById('phone').value,
      fundanideacontactpersonname: document.getElementById('contactPerson').value,
      fundanideaestimateamount: document.getElementById('estimatedAmount').value,
      fundanideastatus: "Pending"
    };
  }

  async submitForm() {
    if (!this.validateStep(this.currentStep)) {
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    try {
      // Create the submit function directly to avoid reference errors
      const submitData = async function(data) {
        return $.ajax({
          url: 'https://mumbailocal.org:8087/addFundanidea',
          method: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json',
          dataType: 'json'
        });
      };
      
      const formData = this.collectFormData();
      console.log('Submitting form data:', formData);

      const response = await submitData(formData);
      console.log('Form submitted successfully:', response);

      // Extract token and phone number for WhatsApp
      const token = response.data?.fundanideatoken || response.fundanideatoken;
      const phoneNumber = formData.fundanideaphonenumber;
      
      if (token) {
        // Send WhatsApp message
        await this.sendWhatsAppToken(phoneNumber, token);
        
        // Update success message to include token
        this.showSuccessWithToken(token);
      } else {
        // Show regular success step if no token
        this.currentStep = this.totalSteps + 1;
        this.showStep(this.currentStep);
        this.updateStepIndicators();
      }

    } catch (error) {
      console.error('Form submission failed:', error);
      
      // Show error message
      alert('Failed to submit form. Please try again.');
      
      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  async sendWhatsAppToken(phoneNumber, token) {
    try {
      const message = `🎉 Your Fund An Idea application has been submitted successfully!

📋 Application Token: ${token}

⚠️ IMPORTANT: Please save this token number. You will need it to track your application status.

Thank you for your submission. We will review your project proposal and get back to you within 3-5 business days.

- Amdavad Municipal Corporation`;

      // WhatsApp API call (you may need to replace this with your actual WhatsApp API endpoint)
      const whatsappData = {
        phone: phoneNumber,
        message: message,
        token: token
      };

      // Example WhatsApp API call - replace with your actual endpoint
      const whatsappResponse = await $.ajax({
        url: 'https://mumbailocal.org:8087/send-whatsapp', // Replace with your WhatsApp API endpoint
        method: 'POST',
        data: JSON.stringify(whatsappData),
        contentType: 'application/json',
        dataType: 'json'
      });

      console.log('WhatsApp sent successfully:', whatsappResponse);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      // Don't block the success flow if WhatsApp fails
    }
  }

  showSuccessWithToken(token) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    
    // Show success step
    document.getElementById('successStep').classList.add('active');
    
    // Update success message to include token
    const successStep = document.getElementById('successStep');
    successStep.innerHTML = `
      <div class="success-message">
        <div class="success-icon">✅</div>
        <h2>Request Submitted Successfully!</h2>
        <div class="token-display">
          <h3 style="color: #28a745; margin: 20px 0 10px 0;">Your Application Token</h3>
          <div style="background: #f8f9fa; border: 2px dashed #28a745; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #28a745; margin: 0; font-family: monospace; letter-spacing: 2px;">${token}</h2>
          </div>
          <p style="color: #dc3545; font-weight: bold; margin: 15px 0;">
            ⚠️ IMPORTANT: Please save this token number for tracking your application status
          </p>
        </div>
        <p>Thank you for your submission. We will review your project proposal and get back to you within 3-5 business days.</p>
        <p style="color: #6c757d; font-size: 14px; margin-top: 15px;">
          📱 A WhatsApp message with your token has been sent to your registered phone number.
        </p>
        <div style="margin-top: 30px;">
          <button class="btn btn-primary" onclick="copyToken('${token}')" style="margin-right: 10px;">
            📋 Copy Token
          </button>
          <button class="btn btn-secondary" onclick="resetForm()">Submit Another Request</button>
        </div>
      </div>
    `;
    
    // Update step indicators
    this.currentStep = this.totalSteps + 1;
    this.updateStepIndicators();
    
    // Hide navigation buttons
    document.getElementById('backBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('submitBtn').style.display = 'none';
  }

  resetForm() {
    this.currentStep = 1;
    this.uploadedFileUrl = null;
    
    // Reset all form fields
    document.querySelectorAll('input, select, textarea').forEach(field => {
      field.value = '';
      field.style.borderColor = '#e9ecef';
    });
    
    // Hide error messages
    document.querySelectorAll('.error-message').forEach(error => {
      error.style.display = 'none';
    });
    
    // Reset file input
    const fileLabel = document.getElementById('fileLabel');
    if (fileLabel) {
      fileLabel.textContent = '📁 Choose File - No file chosen';
      fileLabel.classList.remove('file-selected', 'file-error', 'file-uploading');
    }
    
    // Reset submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'SUBMIT';
    }
    
    this.showStep(this.currentStep);
    this.updateStepIndicators();
  }
}

// Global functions for button clicks (to maintain compatibility with existing HTML)
let formHandler;

function nextStep() {
  if (formHandler) formHandler.nextStep();
}

function previousStep() {
  if (formHandler) formHandler.previousStep();
}

function submitForm() {
  if (formHandler) formHandler.submitForm();
}

// Global function to copy token to clipboard
function copyToken(token) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(token).then(() => {
      alert('Token copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Token copied to clipboard!');
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = token;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Token copied to clipboard!');
  }
}

function resetForm() {
  if (formHandler) formHandler.resetForm();
}

// Initialize when DOM is ready - with fallback for jQuery
function initializeForm() {
  formHandler = new CorporateRequestForm();
}

// Try jQuery first, fallback to vanilla JS
if (typeof $ !== 'undefined') {
  $(document).ready(initializeForm);
} else if (typeof jQuery !== 'undefined') {
  jQuery(document).ready(initializeForm);
} else {
  // Fallback to vanilla JavaScript
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
  } else {
    // DOM is already loaded
    initializeForm();
  }
}

// CSS for file upload states (add this to your CSS file)
const fileUploadStyles = `
.file-input-label.file-uploading {
  color: #007bff;
  background-color: #e3f2fd;
}

.file-input-label.file-selected {
  color: #28a745;
  background-color: #d4edda;
}

.file-input-label.file-error {
  color: #dc3545;
  background-color: #f8d7da;
}
`;

// Add styles if not already present
if (!document.getElementById('fileUploadStyles')) {
  const style = document.createElement('style');
  style.id = 'fileUploadStyles';
  style.textContent = fileUploadStyles;
  document.head.appendChild(style);
}