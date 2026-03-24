// ===== RÉCUPÉRATION DU FORMULAIRE =====

const loginForm = document.querySelector("#login-form");


// ===== ENVOI DU FORMULAIRE =====

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    await login(email, password);
});


// ===== FONCTION LOGIN  =====

async function login(email, password) {

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            // Transformation des données en JSON
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error("Email ou mot de passe incorrect.");
        }

        // Récupère les données JSON
        const data = await response.json();

        localStorage.setItem("token", data.token);
        window.location.href = "index.html";

    } catch (error) {
        
        afficherErreur(error.message);
    }
}


// ===== AFFICHAGE ERREUR =====

function afficherErreur(message) {

    const errorMsg = document.querySelector(".error-message");

    if (!errorMsg) return;

    errorMsg.textContent = message;
    errorMsg.style.display = "block";
}
