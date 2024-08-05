document.addEventListener('DOMContentLoaded', function () {
    // Check if token exists in session storage
    var authToken = localStorage.getItem('token');

    if (authToken) {
        return;
    } else {
        window.location.href = '/login'; // Replace with your login page URL
    }
});