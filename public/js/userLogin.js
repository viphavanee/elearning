document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector('form[action="/login/userChecked"]');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/login/userChecked', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const result = await response.json();
                    const { token, redirect } = result;

                    // Store the token in localStorage
                    localStorage.setItem('token', token);

                    // Redirect the user
                    window.location.href = redirect;
                } else {
                    const errorData = await response.json();
                    console.error('Error:', errorData.error);
                    alert('Login failed: ' + errorData.error);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login.');
            }
        });
    }
});
