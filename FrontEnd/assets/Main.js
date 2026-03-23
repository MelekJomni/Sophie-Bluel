document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("login-link");
    const editionBanner = document.getElementById("edition-banner");
    const editButton = document.getElementById("btn-edit");
    const gallery = document.querySelector(".gallery");
    const filters = document.querySelector(".filters");

    const modal = document.getElementById("modal");
    const modalOverlay = document.querySelector(".modal-overlay");
    const modalClose = document.querySelector(".modal-close");
    const modalBack = document.querySelector(".modal-back");
    const galleryPage = document.querySelector(".gallery-page");
    const formPage = document.querySelector(".form-page");
    const modalGallery = document.querySelector(".modal-gallery");
    const btnAddPhoto = document.querySelector(".modal-btn-add");

    const modalForm = document.getElementById("modal-form");
    const fileInput = document.getElementById("file-input");
    const preview = document.getElementById("preview");
    const titleInput = document.getElementById("title-input");
    const categoryInput = document.getElementById("category-input");
    const submitButton = document.querySelector('#modal-form button.btn-validate');
    const uploadPlaceholder = document.getElementById("upload-placeholder");

    // MODE CONNECTÉ / VISITEUR
    if (token) {
        if (editionBanner) editionBanner.classList.remove("hidden");
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.style.cursor = "pointer";
            loginLink.addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.reload();
            });
        }
        if (filters) filters.classList.add("hidden");
        if (editButton) editButton.classList.remove("hidden");
    } else {
        if (editionBanner) editionBanner.classList.add("hidden");
        if (editButton) editButton.classList.add("hidden");
        if (filters) filters.classList.remove("hidden");

        if (loginLink) {
            loginLink.addEventListener("click", () => {
                window.location.href = "login.html";
            });
        }
    }

    // API
    let works = [];
    let categories = [];

    async function getWorks() {
        try {
            const response = await fetch("http://localhost:5678/api/works");
            works = await response.json();
        } catch (err) {
            console.error("Erreur récupération works:", err);
        }
    }

    async function getCategories() {
        try {
            const response = await fetch("http://localhost:5678/api/categories");
            categories = await response.json();
        } catch (err) {
            console.error("Erreur récupération categories:", err);
        }
    }

    // AFFICHAGE WORKS
    function createWorks(worksArray) {
        if (!gallery) return;
        gallery.innerHTML = "";
        if (worksArray.length === 0) {
            gallery.textContent = "Aucun projet disponible.";
            return;
        }
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

    // FILTRES
    function createFilter(category) {
        if (!filters) return;
        const button = document.createElement("button");
        button.textContent = category.name;

        if (category.id === 0) button.classList.add("active");

        button.addEventListener("click", () => {
            document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            if (category.id === 0) {
                createWorks(works);
                return;
            }

            const filteredWorks = works.filter(work => work.categoryId === category.id);
            createWorks(filteredWorks);
        });

        filters.appendChild(button);
    }
    // CREATION DE TOUS LES FILTRES
    
    function createFilters(categoriesArray) {
        createFilter({ id: 0, name: "Tous" });
        categoriesArray.forEach(category => createFilter(category));
    }

    // INIT
    async function init() {
        await getWorks();
        await getCategories();
        createWorks(works);
        if (!token) 
            createFilters(categories);
    }

    init();

    // MODAL
    if (editButton) editButton.addEventListener("click", openModal);
    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
    if (btnAddPhoto) btnAddPhoto.addEventListener("click", showFormPage);
    if (modalBack) modalBack.addEventListener("click", showGalleryPage);

    function openModal() {
        if (!modal) return;
        modal.classList.remove("hidden");
        showGalleryPage();
        fillModalGallery();
        fillCategorySelect();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.add("hidden");
    }

    function showGalleryPage() {
        if (galleryPage) galleryPage.classList.remove("hidden");
        if (formPage) formPage.classList.add("hidden");
        if (modalBack) modalBack.classList.add("hidden");

        // REINITIALISE L'ETAT DU FORMULAIRE 

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

    function showFormPage() {
        if (galleryPage) galleryPage.classList.add("hidden");
        if (formPage) formPage.classList.remove("hidden");
        if (modalBack) modalBack.classList.remove("hidden");
    }

    // MODAL GALLERY
    function fillModalGallery() {
        if (!modalGallery) return;
        modalGallery.innerHTML = "";

        works.forEach(work => {
            const figure = document.createElement("figure");

            const img = document.createElement("img");
            img.src = work.imageUrl;
            img.alt = work.title;

            const btnDelete = document.createElement("button");
            btnDelete.classList.add("delete-btn");
            btnDelete.dataset.id = work.id;

            const svgImg = document.createElement("img");
            svgImg.src = "./assets/icons/trash-can-solid.svg";
            svgImg.alt = "Supprimer";

            btnDelete.appendChild(svgImg);

            btnDelete.addEventListener("click", () => deleteWork(work.id));

            figure.appendChild(img);
            figure.appendChild(btnDelete);

            modalGallery.appendChild(figure);
        });
    }

    // SUPPRIMER PROJET
    async function deleteWork(id) {
        if (!token) return;
        await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        works = works.filter(work => work.id != id);
        createWorks(works);
        fillModalGallery();
    }

    // FORMULAIRE AJOUT PHOTO
    if (fileInput) fileInput.addEventListener("change", () => {
        if (!fileInput.files[0]) return;
        if (preview) preview.src = URL.createObjectURL(fileInput.files[0]);
        if (preview) preview.classList.remove("hidden");
        if (uploadPlaceholder) uploadPlaceholder.classList.add("hidden");
        allowSubmit();
    });

    function allowSubmit() {
        const isValidFileInput = fileInput && fileInput.files.length > 0;
        const isValidTitleInput = titleInput && titleInput.value.trim().length > 0;
        const isValidCategoryInput = categoryInput && categoryInput.value !== "";

        if (submitButton) {
            if (isValidFileInput && isValidTitleInput && isValidCategoryInput) {
                submitButton.disabled = false;
                submitButton.classList.add("valid");
            } else {
                submitButton.disabled = true;
                submitButton.classList.remove("valid");
            }
        }
    }

    if (fileInput) fileInput.addEventListener('input', allowSubmit);
    if (titleInput) titleInput.addEventListener('input', allowSubmit);
    if (categoryInput) categoryInput.addEventListener('input', allowSubmit);

    // SOUMISSION FORMULAIRE
    if (modalForm) modalForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!fileInput || !titleInput || !categoryInput) return;

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

    // CATÉGORIES SELECT
    function fillCategorySelect() {
        if (!categoryInput) return;
        categoryInput.innerHTML = "";

        const optDefault = document.createElement("option");
        optDefault.value = "";
        optDefault.textContent = "";
        optDefault.selected = true;
        optDefault.disabled = true;
        categoryInput.appendChild(optDefault);

        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            categoryInput.appendChild(opt);
        });
    }

});