document.addEventListener('DOMContentLoaded', function () {
    // Check if token exists in session storage
    var token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token); // Decodes the JWT token

    // Assuming userId is a field in your token
    const role = decodedToken.role;
    if (role === 'student') {
        return;
    } else {
        // Example: Redirect to login page or show access denied message
        window.location.href = '/protected'; // Replace with your login page URL
    }
});