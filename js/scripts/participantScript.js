function processDonation() {
    // Get form field values
     const raisedAmount = document.querySelector(".raised-amount").innerText.trim();
    const participantName = document.getElementById("participantsname").value;
    const organizationName = document.getElementById("organizationname").value;
    const email = document.getElementById("email").value;
    const mobileNumber = document.getElementById("mobilenumber").value;

    // Log the values
    console.log("raisedAmount",raisedAmount);
    console.log("Participant Name:", participantName);
    console.log("Organization Name:", organizationName);
    console.log("Email:", email);
    console.log("Mobile Number:", mobileNumber);

    // You can also return them as an object if needed
    const formData = {
        raisedAmount,
        participantName,
        organizationName,
        email,
        mobileNumber
    };

    console.log("Form Data:", formData);
}
