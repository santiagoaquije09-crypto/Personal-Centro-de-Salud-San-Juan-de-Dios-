// ==========================================
// CONFIGURACIÓN DE LA URL DE GOOGLE APPS SCRIPT
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsvnVQHz31bBGvt4K4RAXRGSb8tJj-yX6zmcYvQjWEKqWKisyLtt6F2M02VxUwLJXs/exec";


// ==========================================
// 1. ENVÍO EXCLUSIVO DEL FORMULARIO DE PACIENTES
// ==========================================
document.addEventListener('click', (e) => {
    // Detectar únicamente cuando se hace clic en el botón de guardar pacientes
    const botonGuardar = e.target.closest('button, input[type="submit"]');
    if (!botonGuardar) return;

    const textoBoton = botonGuardar.innerText || botonGuardar.value || '';
    
    // Si el botón pertenece al formulario de registro de pacientes
    if (textoBoton.includes('Guardar e Ingresar a Google Sheets') || textoBoton.includes('Registrar')) {
        const form = botonGuardar.closest('form');
        if (!form) return;

        // Doble seguridad: si estamos en el login, ignorar por completo
        if (form.querySelector('input[type="password"]') || form.innerText.includes('Contraseña')) {
            return;
        }

        e.preventDefault();

        // Recolectar datos de los campos de texto
        const inputs = form.querySelectorAll('input, select');
        const datos = {
            tipoFormulario: 'pacientes',
            nombres: inputs[0]?.value || '',
            apellidos: inputs[1]?.value || '',
            dni: inputs[2]?.value || '',
            seguro: form.querySelector('select')?.value || 'SIS',
            nacimiento: form.querySelector('input[type="date"]')?.value || '',
            telefono: form.querySelector('input[type="tel"], input[placeholder*="9"], input:nth-of-type(5)')?.value || ''
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
            form.reset();
        })
        .catch(error => {
            console.error('Error al enviar:', error);
            alert('Hubo un error al registrar el paciente.');
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

// Refrescar el directorio al hacer clic en su pestaña
document.addEventListener('click', (e) => {
    const texto = e.target.innerText || '';
    if (texto.includes('Directorio de Pacientes') || e.target.closest('[data-tab="directorio"]')) {
        setTimeout(cargarDirectorioPacientes, 300);
    }
});