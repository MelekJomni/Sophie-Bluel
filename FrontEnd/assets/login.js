const loginForm = document.querySelector("#login-form");

// Envoi du formulaire
loginForm.addEventListener("submit", function(event) {
    event.preventDefault(); 

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    login(email, password);
});

// Fonction login
function login(email, password) {
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Email ou mot de passe incorrect.");
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem("token", data.token);
        window.location.href = "index.html"; 
    })
    .catch(error => {
        afficherErreur(error.message);
    });
}

// Fonction pour afficher un message d'erreur

function afficherErreur(message) {
    const errorMsg = document.querySelector(".error-message");
    if (!errorMsg) return; 
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
}
