// ===== RÉCUPÉRATION DU FORMULAIRE =====

const loginForm = document.querySelector("#login-form");


// ===== ENVOI DU FORMULAIRE =====

loginForm.addEventListener("submit", async function(event) {

    // Empêche le rechargement de la page
    event.preventDefault(); 

    // Récupère les valeurs du formulaire
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Appelle la fonction login
    await login(email, password);
});


// ===== FONCTION LOGIN  =====

async function login(email, password) {

    try {
        // Envoi de la requête à l'API
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            // Transformation des données en JSON
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Vérifie si la réponse est correcte
        if (!response.ok) {
            throw new Error("Email ou mot de passe incorrect.");
        }

        // Récupère les données JSON
        const data = await response.json();

        // Sauvegarde du token
        localStorage.setItem("token", data.token);

        // Redirection vers la page d'accueil
        window.location.href = "index.html";

    } catch (error) {
        // Affiche l'erreur si problème
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
