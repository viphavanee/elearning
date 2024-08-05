
// Ensure the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token); // Decodes the JWT token

        // Assuming firstname and role are fields in your token
        const firstname = decodedToken.firstname;
        const role = decodedToken.role;

        if (firstname && role) {
            // Set the text content with the firstname and role
            const spanFirstname = document.getElementById('userFirstname');
            const spanRole = document.getElementById('userRole');

            if (spanFirstname) {
                spanFirstname.textContent = firstname;
            }

            if (spanRole) {
                spanRole.textContent = role;
            }
        }
    }
});
