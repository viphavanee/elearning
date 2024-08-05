function logout() {
    // Remove the token from localStorage
    localStorage.removeItem('token');

    // Redirect to the login page
    window.location.href = '/login';
}

// Add event listener to the logout button
document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});