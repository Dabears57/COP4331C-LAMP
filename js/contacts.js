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
    let url = urlBase + '/SearchContacts.' + extension;

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
        document.getElementById("contactTableBody").innerHTML = "<tr><td colspan='6'>No contacts found</td></tr>";
        return;
    }
    
    // Loop through the data array
    for (let i = 0; i < data.length; i++)
    {
        // Build the row with escaped HTML to prevent XSS
        contactList += "<tr>";
        contactList += "<td>" + escapeHtml(data[i].firstName) + "</td>";
        contactList += "<td>" + escapeHtml(data[i].lastName) + "</td>";
        contactList += "<td>" + escapeHtml(data[i].phone) + "</td>";
        contactList += "<td>" + escapeHtml(data[i].email) + "</td>";
        
        // Add Edit/Delete Buttons (passing the specific Contact ID to them)
        contactList += '<td><button onclick="openEditModal(\'' + data[i].contactId + '\', this)">Edit</button></td>';
        contactList += '<td><button onclick="deleteContact(\'' + data[i].contactId + '\')">Delete</button></td>';
        
        // Close the row
        contactList += "</tr>";
    }
    
    // Display the contact list
    document.getElementById("contactTableBody").innerHTML = contactList;
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
                // Display the success message
                document.getElementById("contactDeleteResult").innerHTML = "Contact has been deleted";

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
    // Clear the previous result message
    document.getElementById("contactAddResult").innerHTML = "";

    // Get the values from contact form and create a JSON payload. 
	let newContactFN = document.getElementById("contactFirstName").value;
	let newContactLN = document.getElementById("contactLastName").value;
	let newContactPhone = document.getElementById("contactPhone").value;
	let newContactEmail = document.getElementById("contactEmail").value;
    if( newContactFN == "" || newContactLN == "" || newContactPhone == "" || newContactEmail == "" )
    {
        document.getElementById("contactAddResult").innerHTML = "All fields are required";
        return;
    }
	let tmp = {firstName:newContactFN,
        lastName:newContactLN,
        phone:newContactPhone,
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
                // Display the success message
                document.getElementById("contactAddResult").innerHTML = "Contact has been added";

                // Reload the contacts to update with new contact added.  
                searchContacts(); 

                // Close the add contact modal
                document.getElementById("addContactModal").style.display = "none";

                // Clear the add contact form
                document.getElementById("contactFirstName").value = "";
                document.getElementById("contactLastName").value = "";
                document.getElementById("contactPhone").value = "";
                document.getElementById("contactEmail").value = "";
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

// Function to open the edit modal and populate it with existing contact data
// Mostly written by cursor, some help from Gemini
function openEditModal(id, button)
{
    // Save the ID for later (when the user clicks "Save")
    document.getElementById("editContactId").value = id;

    // Find the row that holds this button
    let row = button.parentNode.parentNode;

    // Get the text from the cells (0=First, 1=Last, 2=Phone, 3=Email)
    let first = row.cells[0].textContent;
    let last  = row.cells[1].textContent;
    let phone = row.cells[2].textContent;
    let email = row.cells[3].textContent;

    // Fill the "Edit" boxes
    document.getElementById("editContactFirstName").value = first;
    document.getElementById("editContactLastName").value = last;
    document.getElementById("editContactPhone").value = phone;
    document.getElementById("editContactEmail").value = email;

    // Show the popup
    document.getElementById("editContactModal").style.display = "block";
}

// Function to submit the edited contact (called when user clicks "Save" in the modal)
// Heavily assisted by cursor, some help from Gemini 
function editContact()
{
    // Clear the previous result message
    document.getElementById("contactEditResult").innerHTML = "";

    // Get the ID from the hidden input field in the edit contact modal
    let contactID = document.getElementById("editContactId").value;

    // Get the values from contact form and create a JSON payload
    let newContactFN = document.getElementById("editContactFirstName").value;
    let newContactLN = document.getElementById("editContactLastName").value;
    let newContactPhone = document.getElementById("editContactPhone").value;
    let newContactEmail = document.getElementById("editContactEmail").value;

    // Validate that all fields are filled out
    if( newContactFN == "" || newContactLN == "" || newContactPhone == "" || newContactEmail == "" )
    {
        // Inform the user that all fields are required
        document.getElementById("contactEditResult").innerHTML = "All fields are required";
        return;
    }

    let tmp = {contactId:contactID,
        firstName:newContactFN,
        lastName:newContactLN,
        phone:newContactPhone,
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
                // Display the success message
                document.getElementById("contactEditResult").innerHTML = "Contact has been edited";

                // Reload the contacts to update with edited contact
                searchContacts(); 

                // Close the edit contact modal
                document.getElementById("editContactModal").style.display = "none";
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

