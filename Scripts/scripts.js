// Seleccionamos elementos que existen en todas o algunas páginas del sitio.
const themeToggle = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
const appointmentForm = document.getElementById("appointmentForm");
const formMessage = document.getElementById("formMessage");

// Leemos el tema guardado. Si el usuario ya activó modo oscuro, se mantiene al cambiar de página.
function readSavedTheme() {
    try {
        return localStorage.getItem("theme");
    } catch (error) {
        return null;
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch (error) {
        return;
    }
}

const savedTheme = readSavedTheme();

function updateThemeSwitch(isDarkMode) {
    if (!themeToggle) {
        return;
    }

    themeToggle.setAttribute("aria-checked", isDarkMode ? "true" : "false");
    themeToggle.setAttribute("aria-label", isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

updateThemeSwitch(document.body.classList.contains("dark-mode"));

// Evento click para cambiar entre modo claro y modo oscuro.
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        const isDarkMode = document.body.classList.contains("dark-mode");

        updateThemeSwitch(isDarkMode);
        saveTheme(isDarkMode ? "dark" : "light");
    });
}

if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
        const isOpen = mainNav.classList.toggle("is-open");

        navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
}

// El formulario solo existe en contacto.html, por eso validamos antes de usarlo.
if (appointmentForm) {
    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("name");
        const serviceInput = document.getElementById("service");

        // Mensaje interactivo sencillo para confirmar la solicitud en pantalla.
        formMessage.textContent =
            `Gracias, ${nameInput.value}. Recibimos tu solicitud para: ${serviceInput.value}.`;

        appointmentForm.reset();
    });
}
