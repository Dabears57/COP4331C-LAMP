const urlBase = 'https://christianartigas.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

// Function to switch between login and signup tabs
function switchTab(tab) {
	const loginTab = document.getElementById('loginTab');
	const signupTab = document.getElementById('signupTab');
	const loginForm = document.getElementById('loginForm');
	const signupForm = document.getElementById('signupForm');
	
	// Clear any error messages
	document.getElementById('loginResult').innerHTML = '';
	document.getElementById('signupResult').innerHTML = '';
	document.getElementById('signupResult').classList.remove('form-message--success');
	
	if (tab === 'login') {
		// Activate login tab
		loginTab.classList.add('auth-tabs__tab--active');
		signupTab.classList.remove('auth-tabs__tab--active');
		loginForm.classList.remove('auth-form--hidden');
		signupForm.classList.add('auth-form--hidden');
	} else if (tab === 'signup') {
		// Activate signup tab
		signupTab.classList.add('auth-tabs__tab--active');
		loginTab.classList.remove('auth-tabs__tab--active');
		signupForm.classList.remove('auth-form--hidden');
		loginForm.classList.add('auth-form--hidden');
	}
}

// Add event listeners for Enter key on form inputs
document.addEventListener('DOMContentLoaded', function() {
	// Login form Enter key support
	const loginInputs = ['loginName', 'loginPassword'];
	loginInputs.forEach(function(inputId) {
		const input = document.getElementById(inputId);
		if (input) {
			input.addEventListener('keypress', function(event) {
				if (event.key === 'Enter') {
					event.preventDefault();
					doLogin();
				}
			});
		}
	});
	
	// Signup form Enter key support
	const signupInputs = ['signupUserName', 'signupFirstName', 'signupLastName', 'signupPassword'];
	signupInputs.forEach(function(inputId) {
		const input = document.getElementById(inputId);
		if (input) {
			input.addEventListener('keypress', function(event) {
				if (event.key === 'Enter') {
					event.preventDefault();
					doSignup();
				}
			});
		}
	});
});

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	
	// Clear previous messages
	document.getElementById("loginResult").innerHTML = "";
	
	// Validate inputs
	if (!login || !password) {
		document.getElementById("loginResult").innerHTML = "Please fill in all fields";
		return;
	}
	
	var hash = md5(password);
	var tmp = {login:login, password:hash};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.userId;
		
				if (userId < 1)
				{		
					document.getElementById("loginResult").innerHTML = "Invalid username or password";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = "An error occurred. Please try again.";
	}
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function doSignup()
{
	// Get the values from the signup form 
	let userName = document.getElementById("signupUserName").value;
	let firstName = document.getElementById("signupFirstName").value;
	let lastName = document.getElementById("signupLastName").value;
	let password = document.getElementById("signupPassword").value;
	
	// Clear previous messages
	document.getElementById("signupResult").innerHTML = "";
	document.getElementById("signupResult").classList.remove("form-message--success");
	
	// Validate inputs
	if (!userName || !firstName || !lastName || !password) {
		document.getElementById("signupResult").innerHTML = "Please fill in all fields";
		return;
	}
	
	// Validate password length
	if (password.length < 6) {
		document.getElementById("signupResult").innerHTML = "Password must be at least 6 characters";
		return;
	}
	
	// Hash the password
	let hashedPassword = md5(password);
	
	// Create a temporary object to hold the values
	let tmp = {
		login: userName,
		firstName: firstName,
		lastName: lastName,
		password: hashedPassword
	};
	
	// Convert the object to a JSON string
	let jsonPayload = JSON.stringify(tmp);

	// Create the URL for the signup API
	let url = urlBase + '/Signup.' + extension;

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
				// Parse the response from the API
				let jsonObject = JSON.parse(xhr.responseText);
				
				// If there is no error, display a success message
				if (jsonObject.error == "" || !jsonObject.error)
				{
					const resultElement = document.getElementById("signupResult");
					resultElement.innerHTML = "Account created successfully! Please login.";
					resultElement.classList.add("form-message--success");
					
					// Clear the form
					document.getElementById("signupUserName").value = "";
					document.getElementById("signupFirstName").value = "";
					document.getElementById("signupLastName").value = "";
					document.getElementById("signupPassword").value = "";
					
					// Switch to login tab after 2 seconds
					setTimeout(function() {
						switchTab('login');
					}, 2000);
				}
				// If there is an error, display the error message
				else
				{
					document.getElementById("signupResult").innerHTML = jsonObject.error;
				}
			}
		};
		// Send the request to the API
		xhr.send(jsonPayload);
	}
	// If there is an error, display the error message
	catch(err)
	{
		document.getElementById("signupResult").innerHTML = "An error occurred. Please try again.";
	}
}

