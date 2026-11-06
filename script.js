const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZHgN9g8N12WhGGdzFiMKMFZDwxQvztB5BA3VbAk5buPsspAIJmmhr9mr5ZjlKPFsy/exec';

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

            // Si seleccionó "Otros", tomamos la especialidad escrita en el cuadro de texto
            if (area === 'Otros') {
                area = inputStaffAreaOtra.value.trim() || 'Especialista';
            }

            // Actualizar datos del usuario en la barra lateral
            document.getElementById('displayStaffName').textContent = nombres;
            document.getElementById('displayStaffArea').textContent = area;
            
            // Generar iniciales para el avatar
            const iniciales = nombres.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            document.getElementById('userAvatar').textContent = iniciales || 'MD';

            // Mostrar el dashboard principal y ocultar login
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

    // 4. Envío de Paciente a Google Sheets
    const patientForm = document.getElementById('patientForm');
    
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const datos = {
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
                alert('Hubo un inconveniente al registrar al paciente.');
            });
        });
    }
});