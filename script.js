// ==========================================
// CONFIGURACIÓN DE LA URL DE GOOGLE APPS SCRIPT
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsvnVQHz31bBGvt4K4RAXRGSb8tJj-yX6zmcYvQjWEKqWKisyLtt6F2M02VxUwLJXs/exec";


// ==========================================
// 1. GESTIÓN DEL INICIO DE SESIÓN (LOGIN)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    const displayStaffName = document.getElementById('displayStaffName');
    const displayStaffArea = document.getElementById('displayStaffArea');
    const userAvatar = document.getElementById('userAvatar');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombres = document.getElementById('staffNombres').value;
            const area = document.getElementById('staffArea').value;

            // Mostrar nombre y área en la barra lateral
            if (displayStaffName) displayStaffName.textContent = nombres;
            if (displayStaffArea) displayStaffArea.textContent = area;
            
            // Generar iniciales para el avatar
            if (userAvatar) {
                const partes = nombres.trim().split(' ');
                const iniciales = partes.length > 1 ? partes[0][0] + partes[1][0] : partes[0].substring(0, 2);
                userAvatar.textContent = iniciales.toUpperCase();
            }

            // Ocultar login y mostrar el sistema principal
            if (loginScreen) loginScreen.classList.add('hidden');
            if (appContainer) appContainer.classList.remove('hidden');
        });
    }

    // Botón Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (loginScreen) loginScreen.classList.remove('hidden');
            if (appContainer) appContainer.classList.add('hidden');
            if (loginForm) loginForm.reset();
        });
    }

    // Control de pestañas del menú lateral
    const navButtons = document.querySelectorAll('.nav-btn[data-tab]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Quitar clase active a botones y paneles
            navButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

            // Activar botón y panel correspondiente
            btn.classList.add('active');
            const panelActivo = document.getElementById(targetTab);
            if (panelActivo) panelActivo.classList.add('active');

            // Si entra a la pestaña del directorio, cargar datos automáticamente
            if (targetTab === 'tab-pacientes') {
                cargarDirectorioPacientes();
            }
        });
    });
});


// ==========================================
// 2. ENVÍO EXCLUSIVO DEL FORMULARIO DE PACIENTES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const patientForm = document.getElementById('patientForm');

    if (patientForm) {
        patientForm.addEventListener('submit', (e) => {
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

            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            })
            .then(() => {
                alert('¡Paciente registrado con éxito en Google Sheets!');
                patientForm.reset();
            })
            .catch(error => {
                console.error('Error al enviar:', error);
                alert('Hubo un error al registrar el paciente.');
            });
        });
    }
});


// ==========================================
// 3. LECTURA Y CARGA DEL DIRECTORIO DE PACIENTES
// ==========================================
function cargarDirectorioPacientes() {
    const tbody = document.getElementById('patientTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: #007bff;">Cargando pacientes desde Google Sheets...</td></tr>`;

    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(pacientes => {
        tbody.innerHTML = ''; 

        if (!pacientes || pacientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay registros cargados aún.</td></tr>`;
            return;
        }

        pacientes.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${p.fecha || '-'}</td>
                <td>${p.nombres || ''} ${p.apellidos || ''}</td>
                <td>${p.dni || '-'}</td>
                <td>${p.seguro || '-'}</td>
                <td>${p.nacimiento || '-'}</td>
                <td>${p.telefono || '-'}</td>
            `;
            tbody.appendChild(fila);
        });
    })
    .catch(error => {
        console.error('Error al cargar el directorio:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: red;">Error al cargar los datos. Revisa la consola.</td></tr>`;
    });
}