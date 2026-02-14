// Global variable to store the contacts data in an array 
let contactsData = [];

// Function to load the page and search for contacts. Called on initial page load 
function loadPage() 
{
    // Read the cookie to get the user ID and name (stores to global variable from code.js)
    readCookie();

    // If the user ID is less than 0, redirect to the index page
    if( userId < 0 )
    {
        window.location.href = "index.html";
    }
    // Start searching the contacts to load them. 
    searchContacts();
}

// Helper function to open the add contact modal
function openAddModal()
{
    document.getElementById("addContactModal").style.display = "block";
    document.getElementById("contactAddResult").innerHTML = "";
    document.getElementById("contactAddResult").classList.remove("form-message--error");
    document.getElementById("contactFirstName").classList.remove("form-input--error");
    document.getElementById("contactLastName").classList.remove("form-input--error");
    document.getElementById("contactPhone").classList.remove("form-input--error");
    document.getElementById("contactEmail").classList.remove("form-input--error");
}

// Helper function to close the add contact modal
function closeAddModal()
{
    document.getElementById("addContactModal").style.display = "none";
    document.getElementById("contactFirstName").value = "";
    document.getElementById("contactLastName").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactAddResult").innerHTML = "";
}

// Helper function to close the edit contact modal
function closeEditModal()
{
    document.getElementById("editContactModal").style.display = "none";
    document.getElementById("contactEditResult").innerHTML = "";
    document.getElementById("contactDeleteResult").innerHTML = "";
}

// Helper function to escape HTML and prevent XSS attacks (written by Cursor) 
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Partially refactored by Cursor 
// Fetches data from API, stores in contactsData, and calls renderTable()
// A semi-substantial part of function was written / assisted by Cursor
function searchContacts()
{
    // Get the search text from the search input field
    let srch = document.getElementById("searchText").value;
	
	// Clear previous result messages
	document.getElementById("contactSearchResult").innerHTML = "";

    // Create a temporary object to hold the values
	let tmp = {search:srch,userId:userId};

    // Convert the object to a JSON string
	let jsonPayload = JSON.stringify( tmp );

    // Create the URL for the search contacts API
    let url = urlBase + '/SearchContact.' + extension;

    // Create a new XMLHttpRequest object
	let xhr = new XMLHttpRequest();
    // Open the request with the URL and set the content type to JSON
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    // Handle the response from the API
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				// Parse the response from the API
				let jsonObject = JSON.parse( xhr.responseText );
                // Get the results from the API
                let results = jsonObject.results;
                
                // Check if results exist and handle empty results
                if (!results || results.length === 0) {
                    contactsData = [];
                    renderTable(contactsData);
                    document.getElementById("contactSearchResult").innerHTML = "0 contact(s) loaded";
                    return;
                }
                
                // Store the results in the global contactsData array
                contactsData = results;
                
                // Render the table with the fetched data
                renderTable(contactsData);
                
                // Display success message with count
                document.getElementById("contactSearchResult").innerHTML = contactsData.length + " contact(s) loaded";
			}
		};
        // Send the request to the API
		xhr.send(jsonPayload);
	}
	// If there is an error, display the error message
	catch(err)
	{
		// Display the error message
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
}

// Written by Cursor as part of a refactor 
// Function to render the contacts table from an array of contact data
// Takes any array of contact objects and generates HTML table rows
function renderTable(data)
{
    let contactList = "";
    
    // Check if data exists and handle empty array
    if (!data || data.length === 0) {
        document.getElementById("contactTableBody").innerHTML = "<tr><td colspan='4'>No contacts found</td></tr>";
        return;
    }
    
    // Loop through the data array
    for (let i = 0; i < data.length; i++)
    {
        // Build the row with escaped HTML to prevent XSS
        // Make the entire row clickable to open edit modal
        contactList += "<tr onclick=\"openEditModalById('" + data[i].contactId + "')\" style=\"cursor: pointer;\">";
        contactList += "<td>" + escapeHtml(data[i].firstName) + "</td>";
        contactList += "<td>" + escapeHtml(data[i].lastName) + "</td>";
        contactList += "<td>" + escapeHtml(data[i].phone) + "</td>";
        contactList += "<td>" + escapeHtml(data[i].email) + "</td>";
        contactList += "</tr>";
    }
    
    // Display the contact list
    document.getElementById("contactTableBody").innerHTML = contactList;
}

// Helper function to open edit modal by contact ID
function openEditModalById(contactId)
{
    // Find the contact in the contactsData array
    let contact = contactsData.find(c => c.contactId == contactId);
    
    if (!contact) {
        return;
    }
    
    // Save the ID and populate the form
    document.getElementById("editContactId").value = contactId;
    document.getElementById("editContactFirstName").value = contact.firstName;
    document.getElementById("editContactLastName").value = contact.lastName;
    document.getElementById("editContactPhone").value = contact.phone;
    document.getElementById("editContactEmail").value = contact.email;
    
    // Clear any previous messages and error styling
    document.getElementById("contactEditResult").innerHTML = "";
    document.getElementById("contactDeleteResult").innerHTML = "";
    document.getElementById("contactEditResult").classList.remove("form-message--error");
    document.getElementById("editContactFirstName").classList.remove("form-input--error");
    document.getElementById("editContactLastName").classList.remove("form-input--error");
    document.getElementById("editContactPhone").classList.remove("form-input--error");
    document.getElementById("editContactEmail").classList.remove("form-input--error");
    
    // Show the modal
    document.getElementById("editContactModal").style.display = "block";
}

// Assisted by Cursor 
// Function to sort the contacts data by First Name or Last Name
function sortBy(columnName)
{
    // Sort the contactsData array based on the column name
    contactsData.sort((a, b) => {
        if (columnName === "firstName") {
            return a.firstName.localeCompare(b.firstName);
        } else if (columnName === "lastName") {
            return a.lastName.localeCompare(b.lastName);
        }
        // If the column name is not First Name or Last Name, return 0
        return 0;
    });
    // Render the table with the sorted data
    renderTable(contactsData);
}
// Function to delete a contact
// Partially written by Cursor 
function deleteContact(contactID)
{
    // Clear the previous result message
    document.getElementById("contactDeleteResult").innerHTML = "";

    // Show confirmation popup before deleting
    if (!confirm("Are you sure you want to delete this contact?")) {
        return;
    }
    // Create a temporary object + JSON payload to send to the API 
    let tmp = {contactId:contactID,userId:userId};
    let jsonPayload = JSON.stringify( tmp );

    // Create the URL for the delete contact API
    let url = urlBase + '/DeleteContact.' + extension;

    // Create a new XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        // Handle the response from the API
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                // Close the edit modal
                closeEditModal();

                // Reload the contacts to update with contact deleted.  
                searchContacts(); 
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        // Display the error message
        document.getElementById("contactDeleteResult").innerHTML = err.message;
    }
}

// Function to add a contact 
// Partially written by Cursor / Gemini
function addContact()
{
    // Clear the previous result message and error styling
    document.getElementById("contactAddResult").innerHTML = "";
    document.getElementById("contactAddResult").classList.remove("form-message--error");
    document.getElementById("contactFirstName").classList.remove("form-input--error");
    document.getElementById("contactLastName").classList.remove("form-input--error");
    document.getElementById("contactPhone").classList.remove("form-input--error");

    // Get the values from contact form and create a JSON payload. 
	let newContactFN = document.getElementById("contactFirstName").value;
	let newContactLN = document.getElementById("contactLastName").value;
	let rawPhone = document.getElementById("contactPhone").value;
	let newContactEmail = document.getElementById("contactEmail").value;
    
    // Collect all validation errors
    let errors = [];
    let hasError = false;
    
    // Validate that first name is entered
    if( newContactFN == "" )
    {
        errors.push("first name");
        document.getElementById("contactFirstName").classList.add("form-input--error");
        hasError = true;
    }
    // Validate first name length (max 50 characters)
    else if (newContactFN.length > 50) {
        errors.push("first name must be 50 characters or less");
        document.getElementById("contactFirstName").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate last name length (max 50 characters) if provided
    if (newContactLN.length > 50) {
        errors.push("last name must be 50 characters or less");
        document.getElementById("contactLastName").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate that phone number is entered
    if( rawPhone == "" )
    {
        errors.push("phone number");
        document.getElementById("contactPhone").classList.add("form-input--error");
        hasError = true;
    }
    else {
        // Clean phone number - remove all non-digit characters
        let cleanPhone = rawPhone.replace(/\D/g, '');
        
        // Validate phone number is exactly 10 digits
        if (cleanPhone.length !== 10) {
            errors.push("valid 10-digit phone number");
            document.getElementById("contactPhone").classList.add("form-input--error");
            hasError = true;
        }
    }
    
    // If there are any errors, display them and return
    if (hasError) {
        let errorMessage = "Please enter: " + errors.join(", ");
        document.getElementById("contactAddResult").innerHTML = errorMessage;
        document.getElementById("contactAddResult").classList.add("form-message--error");
        return;
    }
    
    // Clean and format phone number
    let cleanPhone = rawPhone.replace(/\D/g, '');
    let formattedPhone = '(' + cleanPhone.substring(0,3) + ') ' + cleanPhone.substring(3,6) + '-' + cleanPhone.substring(6,10);
    
	let tmp = {firstName:newContactFN,
        lastName:newContactLN,
        phone:formattedPhone,
        email:newContactEmail,
        userId:userId};
	let jsonPayload = JSON.stringify( tmp );

    // Create the URL for the add contact API
    let url = urlBase + '/AddContact.' + extension;

    // Create a new XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        // Handle the response from the API
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                // Close the add contact modal
                closeAddModal();

                // Reload the contacts to update with new contact added.  
                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        // Display the error message
        document.getElementById("contactAddResult").innerHTML = err.message;
    }
}

// Function to submit the edited contact (called when user clicks "Save" in the modal)
// Heavily assisted by cursor, some help from Gemini 
function editContact()
{
    // Clear the previous result message and error styling
    document.getElementById("contactEditResult").innerHTML = "";
    document.getElementById("contactEditResult").classList.remove("form-message--error");
    document.getElementById("editContactFirstName").classList.remove("form-input--error");
    document.getElementById("editContactLastName").classList.remove("form-input--error");
    document.getElementById("editContactPhone").classList.remove("form-input--error");

    // Get the ID from the hidden input field in the edit contact modal
    let contactID = document.getElementById("editContactId").value;

    // Get the values from contact form and create a JSON payload
    let newContactFN = document.getElementById("editContactFirstName").value;
    let newContactLN = document.getElementById("editContactLastName").value;
    let rawPhone = document.getElementById("editContactPhone").value;
    let newContactEmail = document.getElementById("editContactEmail").value;

    // Collect all validation errors
    let errors = [];
    let hasError = false;

    // Validate that first name is entered
    if( newContactFN == "" )
    {
        errors.push("first name");
        document.getElementById("editContactFirstName").classList.add("form-input--error");
        hasError = true;
    }
    // Validate first name length (max 50 characters)
    else if (newContactFN.length > 50) {
        errors.push("first name must be 50 characters or less");
        document.getElementById("editContactFirstName").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate last name length (max 50 characters) if provided
    if (newContactLN.length > 50) {
        errors.push("last name must be 50 characters or less");
        document.getElementById("editContactLastName").classList.add("form-input--error");
        hasError = true;
    }

    // Validate that phone number is entered
    if( rawPhone == "" )
    {
        errors.push("phone number");
        document.getElementById("editContactPhone").classList.add("form-input--error");
        hasError = true;
    }
    else {
        // Clean phone number - remove all non-digit characters
        let cleanPhone = rawPhone.replace(/\D/g, '');
        
        // Validate phone number is exactly 10 digits
        if (cleanPhone.length !== 10) {
            errors.push("valid 10-digit phone number");
            document.getElementById("editContactPhone").classList.add("form-input--error");
            hasError = true;
        }
    }
    
    // If there are any errors, display them and return
    if (hasError) {
        let errorMessage = "Please enter: " + errors.join(", ");
        document.getElementById("contactEditResult").innerHTML = errorMessage;
        document.getElementById("contactEditResult").classList.add("form-message--error");
        return;
    }
    
    // Clean and format phone number
    let cleanPhone = rawPhone.replace(/\D/g, '');
    let formattedPhone = '(' + cleanPhone.substring(0,3) + ') ' + cleanPhone.substring(3,6) + '-' + cleanPhone.substring(6,10);

    let tmp = {contactId:contactID,
        firstName:newContactFN,
        lastName:newContactLN,
        phone:formattedPhone,
        email:newContactEmail,
        userId:userId};
    let jsonPayload = JSON.stringify( tmp );

    // Create the URL for the edit contact API
    let url = urlBase + '/EditContact.' + extension;

    // Create a new XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try
    {
        // Handle the response from the API
        xhr.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                // Close the edit contact modal
                closeEditModal();

                // Reload the contacts to update with edited contact
                searchContacts();
            }
        };
        xhr.send(jsonPayload);
    }
    catch(err)
    {
        // Display the error message
        document.getElementById("contactEditResult").innerHTML = err.message;
    }
}

