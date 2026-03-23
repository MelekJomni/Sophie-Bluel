// Récupère le token (si l'utilisateur est connecté)
const token = localStorage.getItem("token");

// Liens et boutons principaux
const loginLink = document.getElementById("login-link");
const editionBanner = document.getElementById("edition-banner");
const editButton = document.getElementById("btn-edit");

// Galerie et filtres
const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");

// Éléments de la modal
const modal = document.getElementById("modal");
const modalOverlay = document.querySelector(".modal-overlay");
const modalClose = document.querySelector(".modal-close");
const modalBack = document.querySelector(".modal-back");

// Pages dans la modal
const galleryPage = document.querySelector(".gallery-page");
const formPage = document.querySelector(".form-page");

// Galerie dans la modal + bouton ajout
const modalGallery = document.querySelector(".modal-gallery");
const btnAddPhoto = document.querySelector(".modal-btn-add");

// Formulaire
const modalForm = document.getElementById("modal-form");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const titleInput = document.getElementById("title-input");
const categoryInput = document.getElementById("category-input");
const submitButton = document.querySelector('#modal-form button.btn-validate');
const uploadPlaceholder = document.getElementById("upload-placeholder");


// ===== MODE CONNECTÉ / VISITEUR =====

if (token) {
    // Si connecté → afficher mode édition
    if (editionBanner) editionBanner.classList.remove("hidden");

    if (loginLink) {
        loginLink.textContent = "logout";

        // Déconnexion
        loginLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.reload();
        });
    }

    // Cache les filtres et affiche bouton modifier
    if (filters) filters.classList.add("hidden");
    if (editButton) editButton.classList.remove("hidden");

} else {
    // Mode visiteur
    if (editionBanner) editionBanner.classList.add("hidden");
    if (editButton) editButton.classList.add("hidden");
    if (filters) filters.classList.remove("hidden");

    // Redirection vers login
    if (loginLink) {
        loginLink.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
}


// ===== API =====

let works = [];       // Liste des projets
let categories = [];  // Liste des catégories

// Récupérer les projets depuis l’API
async function getWorks() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        works = await response.json();
    } catch (err) {
        console.error("Erreur récupération works:", err);
    }
}

// Récupérer les catégories
async function getCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        categories = await response.json();
    } catch (err) {
        console.error("Erreur récupération categories:", err);
    }
}


// ===== AFFICHAGE DES PROJETS =====

function createWorks(worksArray) {
    if (!gallery) return;

    gallery.innerHTML = ""; // Vide la galerie

    if (worksArray.length === 0) {
        gallery.textContent = "Aucun projet disponible.";
        return;
    }

    // Crée un élément pour chaque projet
    worksArray.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        img.src = work.imageUrl;
        img.alt = work.title;
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}


// ===== FILTRES =====

// Créer un bouton filtre
function createFilter(category) {
    if (!filters) return;

    const button = document.createElement("button");
    button.textContent = category.name;

    // Bouton "Tous" actif par défaut
    if (category.id === 0) button.classList.add("active");

    button.addEventListener("click", () => {
        // Retire la classe active des autres boutons
        document.querySelectorAll(".filters button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        // Filtrage
        if (category.id === 0) {
            createWorks(works);
        } else {
            const filtered = works.filter(w => w.categoryId === category.id);
            createWorks(filtered);
        }
    });

    filters.appendChild(button);
}

// Créer tous les filtres
function createFilters(categoriesArray) {
    createFilter({ id: 0, name: "Tous" });
    categoriesArray.forEach(category => createFilter(category));
}


// ===== INITIALISATION =====

async function init() {
    await getWorks();
    await getCategories();

    createWorks(works);

    // Les filtres seulement si visiteur
    if (!token) createFilters(categories);
}

init();


// ===== MODAL =====

// Ouvrir la modal
function openModal() {
    if (!modal) return;

    modal.classList.remove("hidden");

    showGalleryPage();
    fillModalGallery();
    fillCategorySelect();
}

// Fermer la modal
function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
}


// Afficher galerie dans la modal
function showGalleryPage() {
    if (galleryPage) galleryPage.classList.remove("hidden");
    if (formPage) formPage.classList.add("hidden");
    if (modalBack) modalBack.classList.add("hidden");

    // Reset formulaire
    if (preview) preview.classList.add("hidden");
    if (uploadPlaceholder) uploadPlaceholder.classList.remove("hidden");
    if (fileInput) fileInput.value = "";
    if (titleInput) titleInput.value = "";
    if (categoryInput) categoryInput.value = "";

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.remove("valid");
    }
}

// Afficher formulaire
function showFormPage() {
    if (galleryPage) galleryPage.classList.add("hidden");
    if (formPage) formPage.classList.remove("hidden");
    if (modalBack) modalBack.classList.remove("hidden");
}


// ===== GALERIE MODAL =====

function fillModalGallery() {
    if (!modalGallery) return;

    modalGallery.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;

        // Bouton supprimer
        const btnDelete = document.createElement("button");
        btnDelete.classList.add("delete-btn");

        btnDelete.addEventListener("click", () => deleteWork(work.id));

        figure.appendChild(img);
        figure.appendChild(btnDelete);

        modalGallery.appendChild(figure);
    });
}


// ===== SUPPRESSION =====

async function deleteWork(id) {
    if (!token) return;

    try {
        await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Met à jour localement
        works = works.filter(work => work.id !== id);

        createWorks(works);
        fillModalGallery();

    } catch (error) {
        console.error("Erreur réseau :", error);
    }
}


// ===== FORMULAIRE =====

// Aperçu image
if (fileInput) {
    fileInput.addEventListener("change", () => {
        if (!fileInput.files[0]) return;

        preview.src = URL.createObjectURL(fileInput.files[0]);
        preview.classList.remove("hidden");

        uploadPlaceholder.classList.add("hidden");

        allowSubmit();
    });
}

// Validation du formulaire
function allowSubmit() {
    const valid =
        fileInput.files.length > 0 &&
        titleInput.value.trim() !== "" &&
        categoryInput.value !== "";

    submitButton.disabled = !valid;
}


// ===== SOUMISSION =====

if (modalForm) {
    modalForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        formData.append("title", titleInput.value);
        formData.append("category", categoryInput.value);

        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        const newWork = await response.json();

        works.push(newWork);

        createWorks(works);
        fillModalGallery();
        showGalleryPage();
    });
}


// ===== SELECT CATÉGORIES =====

function fillCategorySelect() {
    categoryInput.innerHTML = "";

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;

        categoryInput.appendChild(option);
    });
}
