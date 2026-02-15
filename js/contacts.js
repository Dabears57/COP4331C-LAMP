// Very large portion of this file was written by Cursor.

// Global variable to store the contacts data in an array 
let contactsData = [];

// Global variables to track sorting state
let currentSortColumn = 'firstName';  // Default sort column
let sortDirection = 'asc';            // Default sort direction (ascending)

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
    
    // Add Enter key support for search input
    const searchInput = document.getElementById("searchText");
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchContacts();
            }
        });
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
    document.getElementById("contactAddress").classList.remove("form-input--error");
    document.getElementById("contactCompany").classList.remove("form-input--error");
    document.getElementById("contactNote").classList.remove("form-input--error");
    
    // Add Enter key listener for add contact modal
    addEnterKeyListenerToModal('addContactModal', addContact);
}

// Helper function to close the add contact modal
function closeAddModal()
{
    document.getElementById("addContactModal").style.display = "none";
    document.getElementById("contactFirstName").value = "";
    document.getElementById("contactLastName").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactAddress").value = "";
    document.getElementById("contactCompany").value = "";
    document.getElementById("contactNote").value = "";
    document.getElementById("contactAddResult").innerHTML = "";
    
    // Remove Enter key listener when closing
    removeEnterKeyListenerFromModal('addContactModal');
}

// Helper function to close the view/edit contact modal
function closeViewModal()
{
    document.getElementById("viewContactModal").style.display = "none";
    document.getElementById("contactEditResult").innerHTML = "";
    document.getElementById("contactDeleteResult").innerHTML = "";
    // Reset to view mode when closing
    exitEditMode();
}

// Helper function to show the delete confirmation modal
function showDeleteConfirm()
{
    document.getElementById("deleteConfirmModal").style.display = "block";
}

// Helper function to close the delete confirmation modal
function closeDeleteConfirm()
{
    document.getElementById("deleteConfirmModal").style.display = "none";
}

// Function to confirm and execute the delete
function confirmDelete()
{
    // Get the contact ID from the view modal
    let contactID = document.getElementById("viewContactId").value;
    
    // Close the confirmation modal
    closeDeleteConfirm();
    
    // Execute the delete
    deleteContact(contactID);
}

// Function to enter edit mode
function enterEditMode()
{
    // Change title
    document.getElementById("contactModalTitle").textContent = "Edit Contact";
    
    // Hide view mode content
    document.getElementById("viewModeContent").style.display = "none";
    
    // Show edit mode content
    document.getElementById("editModeContent").style.display = "block";
    
    // Hide edit button, keep delete button
    document.getElementById("editContactBtn").style.display = "none";
    
    // Add Enter key listener for edit mode
    addEnterKeyListenerToModal('editModeContent', saveContact);
}

// Function to exit edit mode (return to view mode)
function exitEditMode()
{
    // Change title
    document.getElementById("contactModalTitle").textContent = "View Contact";
    
    // Show view mode content
    document.getElementById("viewModeContent").style.display = "block";
    
    // Hide edit mode content
    document.getElementById("editModeContent").style.display = "none";
    
    // Show edit button
    document.getElementById("editContactBtn").style.display = "flex";
    
    // Clear any error messages
    document.getElementById("contactEditResult").innerHTML = "";
    
    // Remove Enter key listener when exiting edit mode
    removeEnterKeyListenerFromModal('editModeContent');
}

// Function to cancel edit and return to view mode
function cancelEdit()
{
    // Get the contact ID
    let contactID = document.getElementById("viewContactId").value;
    
    // Find the contact to restore original values
    let contact = contactsData.find(c => c.contactId == contactID);
    
    if (contact) {
        // Restore original values in edit inputs
        document.getElementById("editContactFirstName").value = contact.firstName;
        document.getElementById("editContactLastName").value = contact.lastName || "";
        document.getElementById("editContactPhone").value = contact.phone;
        document.getElementById("editContactEmail").value = contact.email || "";
        document.getElementById("editContactAddress").value = contact.address || "";
        document.getElementById("editContactCompany").value = contact.company || "";
        document.getElementById("editContactNote").value = contact.note || "";
    }
    
    // Return to view mode
    exitEditMode();
}

// Function to save contact changes
function saveContact()
{
    // Call the existing editContact function
    editContact();
}

// Helper function to add Enter key listener to a modal
function addEnterKeyListenerToModal(elementId, saveFunction)
{
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Remove any existing listener first to prevent duplicates
    removeEnterKeyListenerFromModal(elementId);
    
    // Store the handler so we can remove it later
    const handler = function(event) {
        // Only trigger if Enter is pressed and not already processing
        if (event.key === 'Enter' && !element._isProcessing) {
            event.preventDefault();
            element._isProcessing = true;
            saveFunction();
            // Reset processing flag after a short delay
            setTimeout(() => {
                element._isProcessing = false;
            }, 500);
        }
    };
    
    // Store the handler on the element for later removal
    element._enterKeyHandler = handler;
    
    // Add the listener
    element.addEventListener('keypress', handler);
}

// Helper function to remove Enter key listener from a modal
function removeEnterKeyListenerFromModal(elementId)
{
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Remove the listener if it exists
    if (element._enterKeyHandler) {
        element.removeEventListener('keypress', element._enterKeyHandler);
        delete element._enterKeyHandler;
    }
    
    // Clean up the processing flag
    if (element._isProcessing) {
        delete element._isProcessing;
    }
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
                
                // Apply default sort (firstName ascending)
                sortBy(currentSortColumn);
                
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

// Helper function to open view modal by contact ID
function openEditModalById(contactId)
{
    // Find the contact in the contactsData array
    let contact = contactsData.find(c => c.contactId == contactId);
    
    if (!contact) {
        return;
    }
    
    // Save the ID
    document.getElementById("viewContactId").value = contactId;
    
    // Populate view mode with contact data
    document.getElementById("viewFirstName").textContent = contact.firstName;
    document.getElementById("viewLastName").textContent = contact.lastName || "";
    document.getElementById("viewPhone").textContent = contact.phone;
    document.getElementById("viewEmail").textContent = contact.email || "";
    document.getElementById("viewAddress").textContent = contact.address || "";
    document.getElementById("viewCompany").textContent = contact.company || "";
    document.getElementById("viewNote").textContent = contact.note || "";
    
    // Populate edit mode inputs (hidden initially)
    document.getElementById("editContactFirstName").value = contact.firstName;
    document.getElementById("editContactLastName").value = contact.lastName || "";
    document.getElementById("editContactPhone").value = contact.phone;
    document.getElementById("editContactEmail").value = contact.email || "";
    document.getElementById("editContactAddress").value = contact.address || "";
    document.getElementById("editContactCompany").value = contact.company || "";
    document.getElementById("editContactNote").value = contact.note || "";
    
    // Clear any previous messages and error styling
    document.getElementById("contactEditResult").innerHTML = "";
    document.getElementById("contactDeleteResult").innerHTML = "";
    document.getElementById("contactEditResult").classList.remove("form-message--error");
    document.getElementById("editContactFirstName").classList.remove("form-input--error");
    document.getElementById("editContactLastName").classList.remove("form-input--error");
    document.getElementById("editContactPhone").classList.remove("form-input--error");
    document.getElementById("editContactEmail").classList.remove("form-input--error");
    document.getElementById("editContactAddress").classList.remove("form-input--error");
    document.getElementById("editContactCompany").classList.remove("form-input--error");
    document.getElementById("editContactNote").classList.remove("form-input--error");
    
    // Ensure we're in view mode
    exitEditMode();
    
    // Show the modal
    document.getElementById("viewContactModal").style.display = "block";
}

// Assisted by Cursor 
// Function to sort the contacts data by First Name or Last Name with bidirectional sorting
function sortBy(columnName)
{
    // Check if clicking the same column - toggle direction
    if (currentSortColumn === columnName) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // New column - default to ascending
        currentSortColumn = columnName;
        sortDirection = 'asc';
    }
    
    // Sort the contactsData array based on the column name and direction
    contactsData.sort((a, b) => {
        let comparison = 0;
        
        if (columnName === "firstName") {
            comparison = a.firstName.localeCompare(b.firstName);
        } else if (columnName === "lastName") {
            comparison = a.lastName.localeCompare(b.lastName);
        }
        
        // Reverse the comparison if descending
        return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // Update visual indicators
    updateSortIndicators(columnName, sortDirection);
    
    // Render the table with the sorted data
    renderTable(contactsData);
}

// Function to update sort direction indicators in table headers
function updateSortIndicators(columnName, direction)
{
    // Remove all existing indicators
    document.querySelectorAll('.table thead th').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Add indicator to the sorted column
    const headers = document.querySelectorAll('.table thead th');
    if (columnName === 'firstName') {
        headers[0].classList.add(direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    } else if (columnName === 'lastName') {
        headers[1].classList.add(direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }
}
// Function to delete a contact
// Partially written by Cursor 
function deleteContact(contactID)
{
    // Clear the previous result message
    document.getElementById("contactDeleteResult").innerHTML = "";

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
                // Close the view modal
                closeViewModal();

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
    document.getElementById("contactAddress").classList.remove("form-input--error");
    document.getElementById("contactCompany").classList.remove("form-input--error");
    document.getElementById("contactNote").classList.remove("form-input--error");

    // Get the values from contact form and create a JSON payload. 
	let newContactFN = document.getElementById("contactFirstName").value;
	let newContactLN = document.getElementById("contactLastName").value;
	let rawPhone = document.getElementById("contactPhone").value;
	let newContactEmail = document.getElementById("contactEmail").value;
	let newContactAddress = document.getElementById("contactAddress").value;
	let newContactCompany = document.getElementById("contactCompany").value;
	let newContactNote = document.getElementById("contactNote").value;
    
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
    
    // Validate address length (max 255 characters) if provided
    if (newContactAddress.length > 255) {
        errors.push("address must be 255 characters or less");
        document.getElementById("contactAddress").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate company length (max 100 characters) if provided
    if (newContactCompany.length > 100) {
        errors.push("company must be 100 characters or less");
        document.getElementById("contactCompany").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate note length (max 255 characters) if provided
    if (newContactNote.length > 255) {
        errors.push("note must be 255 characters or less");
        document.getElementById("contactNote").classList.add("form-input--error");
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
        address:newContactAddress,
        company:newContactCompany,
        note:newContactNote,
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
    document.getElementById("editContactAddress").classList.remove("form-input--error");
    document.getElementById("editContactCompany").classList.remove("form-input--error");
    document.getElementById("editContactNote").classList.remove("form-input--error");

    // Get the ID from the hidden input field in the view contact modal
    let contactID = document.getElementById("viewContactId").value;

    // Get the values from contact form and create a JSON payload
    let newContactFN = document.getElementById("editContactFirstName").value;
    let newContactLN = document.getElementById("editContactLastName").value;
    let rawPhone = document.getElementById("editContactPhone").value;
    let newContactEmail = document.getElementById("editContactEmail").value;
    let newContactAddress = document.getElementById("editContactAddress").value;
    let newContactCompany = document.getElementById("editContactCompany").value;
    let newContactNote = document.getElementById("editContactNote").value;

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
    
    // Validate address length (max 255 characters) if provided
    if (newContactAddress.length > 255) {
        errors.push("address must be 255 characters or less");
        document.getElementById("editContactAddress").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate company length (max 100 characters) if provided
    if (newContactCompany.length > 100) {
        errors.push("company must be 100 characters or less");
        document.getElementById("editContactCompany").classList.add("form-input--error");
        hasError = true;
    }
    
    // Validate note length (max 255 characters) if provided
    if (newContactNote.length > 255) {
        errors.push("note must be 255 characters or less");
        document.getElementById("editContactNote").classList.add("form-input--error");
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
        address:newContactAddress,
        company:newContactCompany,
        note:newContactNote,
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
                // Reload the contacts to update with edited contact
                searchContacts();
                
                // Update the view mode display with new values
                document.getElementById("viewFirstName").textContent = newContactFN;
                document.getElementById("viewLastName").textContent = newContactLN;
                document.getElementById("viewPhone").textContent = formattedPhone;
                document.getElementById("viewEmail").textContent = newContactEmail;
                document.getElementById("viewAddress").textContent = newContactAddress;
                document.getElementById("viewCompany").textContent = newContactCompany;
                document.getElementById("viewNote").textContent = newContactNote;
                
                // Return to view mode
                exitEditMode();
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

