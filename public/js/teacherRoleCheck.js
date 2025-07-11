document.addEventListener('DOMContentLoaded', function () {
    // Check if token exists in session storage
    var token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token); 

    const role = decodedToken.role;
    if (role === 'teacher') {
        return;
    } else {
        window.location.href = '/protected';
    }
});