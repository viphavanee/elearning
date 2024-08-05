// tokenUtils.js
function getToken() {
    return localStorage.getItem('token');
}

function getUserIdFromToken(token) {
    const decodedToken = jwt_decode(token); // Make sure to include jwt-decode library in your HTML
    return decodedToken.userId; // Adjust based on your token structure
}
