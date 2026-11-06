const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0fLFkLEbdaqvUWpohbUzMt7K-1IOl4sGMIZ1kZcClmRRvbZYIVm-iJ12dIUYEjXbo/exec';

document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('loginForm');
    const btnLogout = document.getElementById('btnLogout');

    const selectStaffArea = document.getElementById('staffArea');
    const groupStaffAreaOtra = document.getElementById('groupStaffAreaOtra');
    const inputStaffAreaOtra = document.getElementById('staffAreaOtra');

    // 0. Mostrar / Ocultar el campo dinámico "Otros"
    if (selectStaffArea) {
        selectStaffArea.addEventListener('change', () => {
            if (selectStaffArea.value === 'Otros') {
                groupStaffAreaOtra.classList.remove('hidden');
                inputStaffAreaOtra.required = true;
            } else {
                groupStaffAreaOtra.classList.add('hidden');
                inputStaffAreaOtra.required = false;
                inputStaffAreaOtra.value = '';
            }
        });
    }

    // 1. Control de Acceso Médico (Login)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombres = document.getElementById('staffNombres').value;
            let area = selectStaffArea.value;

            if (area === 'Otros') {
                area = inputStaffAreaOtra.value.trim() || 'Especialista';
            }

            document.getElementById('displayStaffName').textContent = nombres;
            document.getElementById('displayStaffArea').textContent = area;
            
            const iniciales = nombres.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            document.getElementById('userAvatar').textContent = iniciales || 'MD';

            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        });
    }

    // 2. Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            appContainer.classList.add('hidden');
            loginScreen.classList.remove('hidden');
            loginForm.reset();
            if (groupStaffAreaOtra) groupStaffAreaOtra.classList.add('hidden');
        });
    }

    // 3. Control de pestañas de la plataforma
    const navButtons = document.querySelectorAll('.nav-btn:not(.btn-logout)');
    const tabPanels = document.querySelectorAll('.tab-panel');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // 4. Envío de Paciente Normal a Google Sheets
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const datos = {
                tipoFormulario: 'pacientes',
                nombres: document.getElementById('nombres').value,
                apellidos: document.getElementById('apellidos').value,
                dni: document.getElementById('dni').value,
                seguro: document.getElementById('seguro').value,
                nacimiento: document.getElementById('nacimiento').value,
                telefono: document.getElementById('telefono').value
            };

            enviarAGoogleSheets(datos, '¡Paciente registrado con éxito en Google Sheets!', patientForm);
        });
    }

    // 5. Envío de Emergencias a Google Sheets
    const emergencyForm = document.getElementById('emergencyForm');
    if (emergencyForm) {
        emergencyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const datos = {
                tipoFormulario: 'emergencias',
                paciente: document.getElementById('emergenciaPaciente').value,
                prioridad: document.getElementById('emergenciaNivel').value,
                sintomas: document.getElementById('emergenciaSintomas').value
            };

            enviarAGoogleSheets(datos, '🚨 ¡Ingreso de Emergencia registrado en Google Sheets!', emergencyForm);
        });
    }

    // 6. Envío de Comentarios a Google Sheets
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const text = document.getElementById('commentText').value;
            const author = document.getElementById('displayStaffName').textContent;
            const now = new Date().toLocaleString();

            const datos = {
                tipoFormulario: 'comentarios',
                autor: author,
                comentario: text
            };

            // Mostrar instantáneamente en pantalla local
            const newComment = document.createElement('div');
            newComment.className = 'comment-card';
            newComment.innerHTML = `
                <strong>${author}</strong>
                <p>${text}</p>
                <small>${now}</small>
            `;
            document.getElementById('commentsFeed').prepend(newComment);

            enviarAGoogleSheets(datos, '¡Comentario guardado en Google Sheets!', commentForm);
        });
    }
});

// Función auxiliar para realizar el fetch a Google Apps Script
function enviarAGoogleSheets(datos, mensajeExito, formulario) {
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(() => {
        alert(mensajeExito);
        if (formulario) formulario.reset();
    })
    .catch(error => {
        console.error('Error al enviar:', error);
        alert('Hubo un inconveniente al guardar los datos.');
    });
}
function actualizarEstadoCita(selectElement) {
    const nuevoEstado = selectElement.value;
    const row = selectElement.closest('tr');
    const badge = row.querySelector('.badge');

    badge.textContent = nuevoEstado;
    badge.className = 'badge badge-' + nuevoEstado.toLowerCase();
}

// Función para cargar y mostrar los pacientes registrados en la tabla del Directorio
function cargarDirectorioPacientes() {
    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(pacientes => {
        // Buscamos el contenedor de la tabla en el panel del directorio
        const tbody = document.querySelector('.tab-panel#directorio tbody') || document.querySelector('table tbody');
        if (!tbody) return;

        tbody.innerHTML = ''; // Limpiar la tabla antes de cargar

        if (!pacientes || pacientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">No hay registros cargados aún.</td></tr>`;
            return;
        }

        pacientes.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${p.fecha || ''}</td>
                <td>${p.nombres || ''} ${p.apellidos || ''}</td>
                <td>${p.dni || ''}</td>
                <td>${p.seguro || ''}</td>
                <td>${p.nacimiento || ''}</td>
                <td>${p.telefono || ''}</td>
            `;
            tbody.appendChild(fila);
        });
    })
    .catch(error => console.error('Error al cargar el directorio:', error));
}

// Ejecutar la carga automáticamente cuando se haga clic en la pestaña del directorio
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn:not(.btn-logout)');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab === 'directorio') {
                cargarDirectorioPacientes();
            }
        });
    });
});