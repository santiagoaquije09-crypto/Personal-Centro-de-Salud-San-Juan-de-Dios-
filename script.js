// Referencias principales
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const alertError = document.getElementById('alertError');
const searchInput = document.getElementById('searchInput');

// Elementos de usuario
const userDniDisplay = document.getElementById('userDniDisplay');
const userRoleDisplay = document.getElementById('userRoleDisplay');

// Elementos de Navegación por Módulos
const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
const sections = document.querySelectorAll('.app-section');
const sectionTitle = document.getElementById('sectionTitle');
const sectionSubtitle = document.getElementById('sectionSubtitle');

// Diccionario de Títulos de Sección
const titlesMap = {
  'sec-panel': { title: 'Gestión de Atención Asistencial', subtitle: 'Módulo de Control y Seguimiento de Pacientes' },
  'sec-admision': { title: 'Admisión de Pacientes / SIS', subtitle: 'Registro de nuevos ingresos e inscripción de seguros' },
  'sec-historias': { title: 'Historias Clínicas Digitales', subtitle: 'Consulta y actualización del expediente médico' },
  'sec-kardex': { title: 'Control Kardex de Enfermería', subtitle: 'Registro y administración de medicamentos por paciente' },
  'sec-recetas': { title: 'Emisión de Recetas y Órdenes', subtitle: 'Generación de órdenes médicas y tratamientos' },
  'sec-turnos': { title: 'Programación y Rol de Turnos', subtitle: 'Asignación de horarios y servicios del personal' }
};

// Evento Login
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const dni = document.getElementById('dni').value.trim();
  const roleSelect = document.getElementById('role');
  const roleText = roleSelect.options[roleSelect.selectedIndex].text;

  if (dni.length < 8) {
    alertError.style.display = 'flex';
    return;
  }

  alertError.style.display = 'none';
  btnLogin.querySelector('.btn-text').style.display = 'none';
  btnLogin.querySelector('.fa-arrow-right-to-bracket').style.display = 'none';
  btnLogin.querySelector('.spinner').style.display = 'block';

  setTimeout(() => {
    btnLogin.querySelector('.btn-text').style.display = 'inline';
    btnLogin.querySelector('.fa-arrow-right-to-bracket').style.display = 'inline';
    btnLogin.querySelector('.spinner').style.display = 'none';

    userDniDisplay.textContent = `DNI ${dni}`;
    userRoleDisplay.textContent = roleText;

    loginView.style.display = 'none';
    dashboardView.style.display = 'flex';
  }, 800);
});

// Evento Cerrar Sesión
btnLogout.addEventListener('click', function (e) {
  e.preventDefault();
  dashboardView.style.display = 'none';
  loginView.style.display = 'flex';
});

// CAMBIO DINÁMICO DE SECCIONES EN EL MENÚ LATERAL
menuItems.forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();

    // Marcar opción activa en menú
    menuItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');

    // Cambiar la vista visible
    const targetSection = this.getAttribute('data-section');
    sections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(targetSection).classList.add('active');

    // Actualizar encabezados
    if (titlesMap[targetSection]) {
      sectionTitle.textContent = titlesMap[targetSection].title;
      sectionSubtitle.textContent = titlesMap[targetSection].subtitle;
    }
  });
});

// Buscador en tabla de pacientes
if (searchInput) {
  searchInput.addEventListener('keyup', function () {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#patientsTable tbody tr');
    rows.forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
}