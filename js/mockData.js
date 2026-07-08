/**
 * Datos iniciales para poblar localStorage.
 */
var MockData = {
  clientes: [
    { id: 1, nombre: 'Juan Pérez', correo: 'juanperez@gmail.com', telefono: '3001234567', direccion: 'Calle 10 # 20-30' },
    { id: 2, nombre: 'María García', correo: 'mariagarcia@gmail.com', telefono: '3009876543', direccion: 'Carrera 5 # 15-40' },
    { id: 3, nombre: 'Carlos López', correo: 'carloslopez@gmail.com', telefono: '3015551234', direccion: 'Av. Principal # 8-12' },
    { id: 4, nombre: 'Ana Rodríguez', correo: 'anarodriguez@gmail.com', telefono: '3024445566', direccion: 'Calle 45 # 12-8' },
    { id: 5, nombre: 'Roberto Díaz', correo: 'robertodiaz@gmail.com', telefono: '3037778899', direccion: 'Carrera 20 # 30-15' }
  ],

  proveedores: [
    { id: 1, nombre: 'Distribuidora La Fuma', correo: 'contacto@lafuma.com', telefono: '3001234567', direccion: 'Zona Industrial 45' },
    { id: 2, nombre: 'Insumos Premium S.A.S', correo: 'ventas@premium.com', telefono: '6015551234', direccion: 'Carrera 30 # 45-20' },
    { id: 3, nombre: 'Importadora Smoke Co.', correo: 'info@smokeco.com', telefono: '6048889900', direccion: 'Bodega 12, Mz 4' }
  ],

  usuarios: [
    { id: 1, nombre: 'Administrador', usuario: 'admin', correo: 'admin@smokesoft.com', rol: 'Administrador', activo: true },
    { id: 2, nombre: 'María Vendedora', usuario: 'maria', correo: 'maria@smokesoft.com', rol: 'Vendedor', activo: true },
    { id: 3, nombre: 'Carlos Inventario', usuario: 'carlos', correo: 'carlos@smokesoft.com', rol: 'Inventario', activo: true }
  ],

  productos: [
    { id: 1, nombre: 'Encendedor Clipper', categoria: 'Encendedores', precio: 7800, existencias: 45 },
    { id: 2, nombre: 'Pipa Bate Gold', categoria: 'Pipas', precio: 12000, existencias: 23 },
    { id: 3, nombre: 'Pipa Mini Gold', categoria: 'Pipas', precio: 8000, existencias: 67 },
    { id: 4, nombre: 'Vaper Desechable', categoria: 'Vaporizadores', precio: 40000, existencias: 89 },
    { id: 5, nombre: 'Papel RAW King Size', categoria: 'Papeles', precio: 10000, existencias: 156 },
    { id: 6, nombre: 'Moledor KRUSH KUBE', categoria: 'Accesorios', precio: 120000, existencias: 12 },
    { id: 7, nombre: 'Bong GRAV Labs', categoria: 'Pipas', precio: 350000, existencias: 8 },
    { id: 8, nombre: 'Esencia Nasty Juice', categoria: 'Esencias', precio: 75000, existencias: 34 },
    { id: 9, nombre: 'Filtro Slim', categoria: 'Accesorios', precio: 3500, existencias: 200 },
    { id: 10, nombre: 'Grinder Metálico', categoria: 'Accesorios', precio: 45000, existencias: 18 }
  ]
};

function inicializarDatosMock() {
  Object.keys(MockData).forEach(function (key) {
    Storage.init(key, MockData[key]);
  });
}
