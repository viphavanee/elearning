document.addEventListener('DOMContentLoaded', function () {
    // Check if token exists in session storage
    var token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token); 

    // Assuming userId is a field in your token
    const role = decodedToken.role;
    if (role === 'student') {
        return;
    } else {
        window.location.href = '/protected'; 
    }
});