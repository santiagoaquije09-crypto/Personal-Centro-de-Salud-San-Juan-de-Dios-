// ==========================================
// CONFIGURACIÓN DE LA URL DE GOOGLE APPS SCRIPT
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsvnVQHz31bBGvt4K4RAXRGSb8tJj-yX6zmcYvQjWEKqWKisyLtt6F2M02VxUwLJXs/exec";


// ==========================================
// 1. ENVÍO DE DATOS DEL FORMULARIO DE PACIENTES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Buscamos específicamente el formulario de pacientes (asegúrate de agregarle id="form-paciente" en tu HTML)
    const formPaciente = document.querySelector('#form-paciente') || document.querySelector('form');

    if (formPaciente) {
        formPaciente.addEventListener('submit', (e) => {
            // Si estamos en la pantalla de login (por seguridad), evitamos que dispare esto
            const esLogin = formPaciente.querySelector('input[type="password"]') || formPaciente.innerText.includes('Contraseña');
            if (esLogin) return; 

            e.preventDefault();

            // Recolectar datos del formulario de paciente
            const datos = {
                tipoFormulario: 'pacientes',
                nombres: formPaciente.querySelector('input:nth-of-type(1)')?.value || formPaciente.elements[0]?.value || '',
                apellidos: formPaciente.querySelector('input:nth-of-type(2)')?.value || formPaciente.elements[1]?.value || '',
                dni: formPaciente.querySelector('input:nth-of-type(3)')?.value || formPaciente.elements[2]?.value || '',
                seguro: formPaciente.querySelector('select')?.value || 'SIS',
                nacimiento: formPaciente.querySelector('input[type="date"]')?.value || '',
                telefono: formPaciente.querySelector('input[type="tel"], input[placeholder*="9"]')?.value || ''
            };

            // Enviar a Google Sheets mediante POST
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
                formPaciente.reset();
            })
            .catch(error => {
                console.error('Error al enviar:', error);
                alert('Hubo un error al registrar el paciente.');
            });
        });
    }
});


// ==========================================
// 2. LECTURA Y CARGA DEL DIRECTORIO DE PACIENTES
// ==========================================
function cargarDirectorioPacientes() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #007bff;">Cargando pacientes desde Google Sheets...</td></tr>`;

    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(pacientes => {
        tbody.innerHTML = ''; 

        if (!pacientes || pacientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">No hay registros cargados aún.</td></tr>`;
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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error al cargar los datos. Revisa la consola.</td></tr>`;
    });
}

// Escuchar clics en la navegación para refrescar el directorio automáticamente
document.addEventListener('click', (e) => {
    const texto = e.target.innerText || '';
    if (texto.includes('Directorio de Pacientes') || e.target.closest('[data-tab="directorio"]')) {
        setTimeout(cargarDirectorioPacientes, 300);
    }
});