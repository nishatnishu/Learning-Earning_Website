document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const inputs = form.querySelectorAll('input');
            let isEmpty = false;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('border-red-500');
                    isEmpty = true;
                } else {
                    input.classList.remove('border-red-500');
                }
            });

            if (isEmpty) {
                alert('Please fill in all fields.');
                return;
            }

            const email = form.querySelector('input[type="email"]').value.trim();
            const password = form.querySelector('input[type="password"]').value;

            if (window.location.pathname.includes('signup.html')) {
                // Save to localStorage (fake registration)
                localStorage.setItem(email, password);
                alert('Account created successfully!');
                window.location.href = 'dashboard.html'
            } else if (window.location.pathname.includes('signin.html')) {
                // Check credentials
                const storedPass = localStorage.getItem(email);
                if (storedPass === password) {
                    alert('Login successful!');
                  window.location.href = 'dashboard.html';
                } else {
                    alert('Invalid email or password.');
                }
            }
        });
    }

    const passwordField = document.querySelector('input[type="password"]');
    const toggleIcon = document.getElementById('togglePassword');

    if (toggleIcon && passwordField) {
        toggleIcon.addEventListener('click', () => {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            toggleIcon.classList.toggle('text-green-600');
        });
    }
});
