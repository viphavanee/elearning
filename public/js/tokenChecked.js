document.addEventListener('DOMContentLoaded', function() {
    // Check if token exists in session storage
    var authToken = localStorage.getItem('token');

    if (authToken) {
        // Token exists, you can use it for API requests or further validation
        // Example: Send token to server-side for verification or decode (if JWT)
        console.log('Token found:', authToken);
        // Example: You may redirect to a protected page here
        // window.location.href = 'protected_page.php'; // Uncomment and replace with your protected page URL
    } else {
        // Token does not exist, handle unauthorized access
        console.log('No token found');
        // Example: Redirect to login page or show access denied message
        window.location.href = '/login'; // Replace with your login page URL
    }
});