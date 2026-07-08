/**
 * Lógica principal del panel de administración.
 */
var AdminPanel = (function () {
  var CLAVE_ADMIN = '12345678';
  var moduloActivo = 'dashboard';
  var modulos = {};

  var configuraciones = {
    clientes: {
      storageKey: 'clientes',
      entityName: 'Cliente',
      entityNamePlural: 'Clientes',
      searchFields: ['nombre', 'correo', 'telefono'],
      fields: [
        { name: 'nombre', label: 'Nombre Completo', type: 'text', placeholder: 'Ej: Juan Pérez' },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'correo@ejemplo.com' },
        { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '3001234567' },
        { name: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Calle, Ciudad' }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'correo', label: 'Correo' },
        { key: 'telefono', label: 'Teléfono' }
      ]
    },
    proveedores: {
      storageKey: 'proveedores',
      entityName: 'Proveedor',
      entityNamePlural: 'Proveedores',
      searchFields: ['nombre', 'correo', 'telefono'],
      fields: [
        { name: 'nombre', label: 'Nombre del Proveedor', type: 'text', placeholder: 'Ej: Distribuidora La Fuma' },
        { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '3001234567' },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'contacto@proveedor.com' },
        { name: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Zona, Ciudad' }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Proveedor' },
        { key: 'correo', label: 'Correo' },
        { key: 'telefono', label: 'Teléfono' }
      ]
    },
    usuarios: {
      storageKey: 'usuarios',
      entityName: 'Usuario',
      entityNamePlural: 'Usuarios',
      searchFields: ['nombre', 'usuario', 'correo', 'rol'],
      fields: [
        { name: 'nombre', label: 'Nombre Completo', type: 'text', placeholder: 'Ej: María Vendedora' },
        { name: 'usuario', label: 'Nombre de Usuario', type: 'text', placeholder: 'usuario123' },
        { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'usuario@smokesoft.com' },
        { name: 'rol', label: 'Rol', type: 'select', options: ['Administrador', 'Vendedor', 'Inventario'] },
        { name: 'activo', label: 'Usuario activo', type: 'checkbox', required: false, default: true }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'usuario', label: 'Usuario' },
        { key: 'correo', label: 'Correo' },
        { key: 'rol', label: 'Rol' },
        { key: 'activo', label: 'Estado', format: 'boolean' }
      ]
    },
    productos: {
      storageKey: 'productos',
      entityName: 'Producto',
      entityNamePlural: 'Productos',
      searchFields: ['nombre', 'categoria'],
      fields: [
        { name: 'nombre', label: 'Nombre del Producto', type: 'text', placeholder: 'Ej: Encendedor Clipper' },
        { name: 'categoria', label: 'Categoría', type: 'select', options: ['Encendedores', 'Pipas', 'Vaporizadores', 'Papeles', 'Accesorios', 'Esencias'] },
        { name: 'precio', label: 'Precio ($)', type: 'number', placeholder: '0' },
        { name: 'existencias', label: 'Existencias', type: 'number', placeholder: '0' }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'precio', label: 'Precio', format: 'currency' },
        { key: 'existencias', label: 'Existencias' }
      ],
      onChange: function () {
        actualizarDashboard();
      }
    }
  };

  function crearModulos() {
    Object.keys(configuraciones).forEach(function (key) {
      modulos[key] = CrudFactory.create(configuraciones[key]);
    });
  }

  function renderDashboard() {
    var productos = Storage.getAll('productos');
    var clientes = Storage.getAll('clientes');
    var proveedores = Storage.getAll('proveedores');
    var usuarios = Storage.getAll('usuarios');
    var totalExistencias = productos.reduce(function (sum, p) {
      return sum + (p.existencias || 0);
    }, 0);

    return (
      '<div class="modulo-dashboard">' +
        '<h2 class="titulo-modulo">Dashboard</h2>' +
        '<div class="resumen-datos">' +
          '<div class="caja-dato"><h3>Productos</h3><p id="statProductos">' + productos.length + '</p></div>' +
          '<div class="caja-dato"><h3>Existencias</h3><p id="statExistencias">' + totalExistencias + '</p></div>' +
          '<div class="caja-dato"><h3>Clientes</h3><p id="statClientes">' + clientes.length + '</p></div>' +
          '<div class="caja-dato"><h3>Proveedores</h3><p id="statProveedores">' + proveedores.length + '</p></div>' +
          '<div class="caja-dato"><h3>Usuarios</h3><p id="statUsuarios">' + usuarios.length + '</p></div>' +
        '</div>' +
        '<div class="tarjeta-modulo tarjeta-bienvenida">' +
          '<h3>Bienvenido al Panel de Administración</h3>' +
          '<p>Selecciona un módulo del menú lateral para gestionar clientes, proveedores, usuarios y productos.</p>' +
        '</div>' +
      '</div>'
    );
  }

  function actualizarDashboard() {
    if (moduloActivo !== 'dashboard') return;
    var contenedor = document.getElementById('contenidoModulo');
    contenedor.innerHTML = renderDashboard();
  }

  function mostrarModulo(nombre) {
    moduloActivo = nombre;
    var contenedor = document.getElementById('contenidoModulo');
    var itemsMenu = document.querySelectorAll('.menu-lateral .item-menu');

    itemsMenu.forEach(function (item) {
      item.classList.toggle('activo', item.dataset.modulo === nombre);
    });

    if (nombre === 'dashboard') {
      contenedor.innerHTML = renderDashboard();
      return;
    }

    var modulo = modulos[nombre];
    if (!modulo) return;

    contenedor.innerHTML = modulo.render();
    modulo.init(contenedor.querySelector('.modulo-crud'));
  }

  function toggleSidebar() {
    document.querySelector('.layout-admin').classList.toggle('sidebar-cerrado');
  }

  function mostrarPanel() {
    document.body.classList.add('modo-admin');
    document.getElementById('seccionInicioSesion').style.display = 'none';
    document.getElementById('panelAdministracion').style.display = 'flex';
    document.querySelector('.encabezado-publico').style.display = 'none';
    mostrarModulo('dashboard');
  }

  function cerrarSesion() {
    sessionStorage.removeItem('administradorActivo');
    document.body.classList.remove('modo-admin');
    document.getElementById('seccionInicioSesion').style.display = 'flex';
    document.getElementById('panelAdministracion').style.display = 'none';
    document.querySelector('.encabezado-publico').style.display = 'flex';
    document.getElementById('campoContrasena').value = '';
    document.getElementById('textoError').textContent = '';
  }

  function manejarLogin(evento) {
    evento.preventDefault();
    var contrasena = document.getElementById('campoContrasena').value;
    var error = document.getElementById('textoError');

    if (contrasena === CLAVE_ADMIN) {
      sessionStorage.setItem('administradorActivo', 'si');
      error.textContent = '';
      mostrarPanel();
    } else {
      error.textContent = 'Contraseña incorrecta. Intenta de nuevo.';
    }
  }

  function bindNavigation() {
    document.querySelectorAll('.item-menu[data-modulo]').forEach(function (item) {
      item.addEventListener('click', function () {
        mostrarModulo(item.dataset.modulo);
      });
    });

    document.getElementById('btnToggleSidebar').addEventListener('click', toggleSidebar);
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('formularioInicioSesion').addEventListener('submit', manejarLogin);
  }

  function init() {
    inicializarDatosMock();
    crearModulos();
    bindNavigation();

    if (sessionStorage.getItem('administradorActivo') === 'si') {
      mostrarPanel();
    }
  }

  return { init: init, cerrarSesion: cerrarSesion };
})();

document.addEventListener('DOMContentLoaded', AdminPanel.init);
