// Seleccionamos elementos que existen en todas o algunas paginas del sitio.
const themeToggle = document.getElementById("themeToggle");
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
const navBackdrop = document.getElementById("navBackdrop");
const appointmentForm = document.getElementById("appointmentForm");
const formMessage = document.getElementById("formMessage");

function readStorageValue(key, fallbackValue) {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue === null ? fallbackValue : storedValue;
    } catch (error) {
        return fallbackValue;
    }
}

function saveStorageValue(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}

function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ");
}

function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
}

function buildAppointmentData(form) {
    return {
        name: normalizeText(form.elements.name.value),
        phone: normalizeText(form.elements.phone.value),
        service: normalizeText(form.elements.service.value),
        message: normalizeText(form.elements.message.value),
        createdAt: new Date().toISOString()
    };
}

function validateAppointmentData(data) {
    if (data.name.length < 3) {
        return { isValid: false, field: "name", message: "Escribe un nombre de al menos 3 caracteres." };
    }

    if (!isValidPhone(data.phone)) {
        return { isValid: false, field: "phone", message: "Escribe un telefono valido de al menos 10 digitos." };
    }

    if (data.service === "") {
        return { isValid: false, field: "service", message: "Selecciona un servicio de interes." };
    }

    return { isValid: true, field: "", message: "Formulario valido." };
}

function getStoredAppointments(storageKey) {
    try {
        const storedAppointments = JSON.parse(readStorageValue(storageKey, "[]"));
        return Array.isArray(storedAppointments) ? storedAppointments : [];
    } catch (error) {
        return [];
    }
}

function saveAppointmentData(storageKey, appointmentData) {
    const appointments = getStoredAppointments(storageKey);
    appointments.push(appointmentData);

    return saveStorageValue(storageKey, JSON.stringify(appointments));
}

function showFormMessage(message, type) {
    if (!formMessage) {
        return message;
    }

    formMessage.textContent = message;
    formMessage.classList.remove("is-error", "is-success");
    formMessage.classList.add(type === "error" ? "is-error" : "is-success");
    return message;
}

function markInvalidField(field) {
    if (!field) {
        return false;
    }

    field.classList.add("is-invalid");
    return true;
}

function clearFieldState(field) {
    if (!field) {
        return false;
    }

    field.classList.remove("is-invalid");
    return true;
}

function updateThemeSwitch(isDarkMode) {
    if (!themeToggle) {
        return false;
    }

    themeToggle.setAttribute("aria-checked", isDarkMode ? "true" : "false");
    themeToggle.setAttribute("aria-label", isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    return isDarkMode;
}

function setNavigationState(isOpen) {
    if (!mainNav || !navToggle) {
        return false;
    }

    mainNav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    if (navBackdrop) {
        navBackdrop.hidden = !isOpen;
    }

    return isOpen;
}

const savedTheme = readStorageValue("theme", null);

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
        saveStorageValue("theme", isDarkMode ? "dark" : "light");
    });
}

if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
        const isOpen = !mainNav.classList.contains("is-open");

        setNavigationState(isOpen);
    });

    mainNav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
            setNavigationState(false);
        }
    });
}

if (navBackdrop) {
    navBackdrop.addEventListener("click", function () {
        setNavigationState(false);
    });
}

document.addEventListener("click", function (event) {
    if (!mainNav || !navToggle || !mainNav.classList.contains("is-open")) {
        return;
    }

    const clickedInsideMenu = mainNav.contains(event.target);
    const clickedMenuButton = navToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuButton) {
        setNavigationState(false);
    }
});

// Evento keydown: permite cerrar el menu desplegable con la tecla Escape.
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && mainNav && navToggle) {
        setNavigationState(false);
    }
});

// El formulario solo existe en contacto.html, por eso validamos antes de usarlo.
if (appointmentForm) {
    appointmentForm.addEventListener("input", function (event) {
        clearFieldState(event.target);

        if (event.target.id === "message") {
            const remainingCharacters = 160 - event.target.value.length;
            showFormMessage(`Puedes escribir ${Math.max(remainingCharacters, 0)} caracteres mas.`, "success");
        }
    });

    appointmentForm.addEventListener("change", function (event) {
        clearFieldState(event.target);
    });

    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const appointmentData = buildAppointmentData(appointmentForm);
        const validation = validateAppointmentData(appointmentData);

        if (!validation.isValid) {
            markInvalidField(appointmentForm.elements[validation.field]);
            showFormMessage(validation.message, "error");
            return;
        }

        const wasSaved = saveAppointmentData("appointmentRequests", appointmentData);
        const confirmationMessage = wasSaved
            ? `Gracias, ${appointmentData.name}. Recibimos tu solicitud para: ${appointmentData.service}.`
            : `Gracias, ${appointmentData.name}. Recibimos tu solicitud, pero el navegador no permitio guardarla.`;

        showFormMessage(confirmationMessage, "success");
        appointmentForm.reset();
    });
}
