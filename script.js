const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZHgN9g8N12WhGGdzFiMKMFZDwxQvztB5BA3VbAk5buPsspAIJmmhr9mr5ZjlKPFsy/exec';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form') || document.getElementById('loginForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const datos = {
                dni: document.getElementById('dni') ? document.getElementById('dni').value : 'N/A',
                nombre: document.getElementById('nombre') ? document.getElementById('nombre').value : 'Usuario',
                mensaje: document.getElementById('mensaje') ? document.getElementById('mensaje').value : 'Registro desde la web'
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
                alert('¡Datos enviados correctamente a Google Sheets!');
                form.reset();
            })
            .catch(error => {
                console.error('Error al enviar:', error);
                alert('Hubo un error al enviar los datos.');
            });
        });
    }
});