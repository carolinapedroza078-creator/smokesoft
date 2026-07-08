/**
 * Modulo de Gestion de Compras (cliente + productos).
 */
var ComprasModule = (function () {
  var IVA_RATE = 0.19;
  var editingId = null;
  var lineItems = [];

  function formatCurrency(amount) {
    return '$' + Number(amount).toLocaleString('es-CO');
  }

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  function getClientes() {
    return Storage.getAll('clientes');
  }

  function getProductos() {
    return Storage.getAll('productos');
  }

  function getCompras() {
    return Storage.getAll('compras');
  }

  function findProducto(id) {
    return getProductos().find(function (p) { return p.id === id; }) || null;
  }

  function findCliente(id) {
    return getClientes().find(function (c) { return c.id === id; }) || null;
  }

  function calcularTotales(items) {
    var subtotal = items.reduce(function (sum, item) {
      return sum + item.subtotal;
    }, 0);
    var iva = Math.round(subtotal * IVA_RATE);
    return { subtotal: subtotal, iva: iva, total: subtotal + iva };
  }

  function crearLineaVacia() {
    return { productoId: '', cantidad: 1, precioUnitario: 0, subtotal: 0 };
  }

  function actualizarLinea(linea) {
    var producto = findProducto(Number(linea.productoId));
    if (producto) {
      linea.precioUnitario = producto.precio;
      linea.productoNombre = producto.nombre;
    }
    linea.subtotal = linea.cantidad * linea.precioUnitario;
    return linea;
  }

  function renderModulo() {
    return (
      '<div class="modulo-compras">' +
        '<h2 class="titulo-modulo">Gestión de Compras</h2>' +
        '<div class="layout-modulo">' +
          '<div class="tarjeta-modulo tarjeta-formulario">' +
            '<h3 id="tituloFormCompra">Nueva Compra</h3>' +
            '<form id="formularioCompra">' +
              '<div class="fila-campos">' +
                '<div class="grupo-campo">' +
                  '<label for="selectCliente">Cliente</label>' +
                  '<select id="selectCliente" required></select>' +
                '</div>' +
                '<div class="grupo-campo">' +
                  '<label for="inputFecha">Fecha</label>' +
                  '<input type="date" id="inputFecha" required>' +
                '</div>' +
              '</div>' +
              '<div class="contenedor-tabla-items">' +
                '<table class="tabla-items">' +
                  '<thead><tr>' +
                    '<th>Producto</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th><th></th>' +
                  '</tr></thead>' +
                  '<tbody id="cuerpoItems"></tbody>' +
                '</table>' +
              '</div>' +
              '<button type="button" class="boton-agregar-item" id="btnAgregarItem">+ Agregar Producto</button>' +
              '<div class="grupo-campo">' +
                '<label for="inputNotas">Notas</label>' +
                '<textarea id="inputNotas" rows="2" placeholder="Observaciones..."></textarea>' +
              '</div>' +
              '<div class="resumen-compra">' +
                '<div class="fila-resumen"><span>Subtotal:</span><span id="resumenSubtotal">$0</span></div>' +
                '<div class="fila-resumen"><span>IVA (19%):</span><span id="resumenIva">$0</span></div>' +
                '<div class="fila-resumen total"><span>Total:</span><span id="resumenTotal">$0</span></div>' +
              '</div>' +
              '<div class="botones-formulario">' +
                '<button type="button" class="boton-limpiar" id="btnLimpiarCompra">Limpiar</button>' +
                '<button type="submit" class="boton-guardar">Guardar Compra</button>' +
              '</div>' +
            '</form>' +
          '</div>' +
          '<div class="tarjeta-modulo tarjeta-lista">' +
            '<div class="encabezado-lista">' +
              '<h3>Historial de Compras</h3>' +
            '</div>' +
            '<div class="contenedor-busqueda">' +
              '<input type="text" id="busquedaCompras" placeholder="Buscar por cliente...">' +
            '</div>' +
            '<div class="contenedor-tabla">' +
              '<table class="tabla-modulo">' +
                '<thead><tr>' +
                  '<th>ID</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Acciones</th>' +
                '</tr></thead>' +
                '<tbody id="cuerpoHistorial"></tbody>' +
              '</table>' +
            '</div>' +
            '<p class="texto-paginacion" id="textoPaginacionCompras"></p>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderOpcionesClientes(selectedId) {
    var options = '<option value="">Seleccionar cliente...</option>';
    getClientes().forEach(function (cliente) {
      var selected = cliente.id === selectedId ? ' selected' : '';
      options += '<option value="' + cliente.id + '"' + selected + '>' + cliente.nombre + '</option>';
    });
    return options;
  }

  function renderOpcionesProductos(selectedId) {
    var options = '<option value="">Producto...</option>';
    getProductos().forEach(function (producto) {
      var selected = producto.id === Number(selectedId) ? ' selected' : '';
      options += '<option value="' + producto.id + '"' + selected + '>' + producto.nombre + '</option>';
    });
    return options;
  }

  function renderLineItems() {
    var tbody = document.getElementById('cuerpoItems');
    if (!lineItems.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="celda-vacia">Agrega productos a la compra</td></tr>';
      return;
    }

    tbody.innerHTML = lineItems.map(function (item, index) {
      return (
        '<tr data-index="' + index + '">' +
          '<td><select class="select-producto" data-index="' + index + '">' +
            renderOpcionesProductos(item.productoId) +
          '</select></td>' +
          '<td><input type="number" class="input-cantidad" data-index="' + index + '" value="' + item.cantidad + '" min="1"></td>' +
          '<td class="celda-precio">' + formatCurrency(item.precioUnitario) + '</td>' +
          '<td class="celda-subtotal">' + formatCurrency(item.subtotal) + '</td>' +
          '<td><button type="button" class="boton-accion boton-eliminar btn-quitar-item" data-index="' + index + '">✕</button></td>' +
        '</tr>'
      );
    }).join('');
  }

  function actualizarResumen() {
    var totales = calcularTotales(lineItems.filter(function (i) { return i.productoId; }));
    document.getElementById('resumenSubtotal').textContent = formatCurrency(totales.subtotal);
    document.getElementById('resumenIva').textContent = formatCurrency(totales.iva);
    document.getElementById('resumenTotal').textContent = formatCurrency(totales.total);
  }

  function renderHistorial(query) {
    var compras = getCompras().slice().reverse();
    if (query) {
      var term = query.toLowerCase();
      compras = compras.filter(function (c) {
        return c.clienteNombre.toLowerCase().includes(term);
      });
    }

    var tbody = document.getElementById('cuerpoHistorial');
    if (!compras.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="celda-vacia">No hay compras registradas</td></tr>';
    } else {
      tbody.innerHTML = compras.map(function (compra) {
        return (
          '<tr>' +
            '<td>#' + String(compra.id).padStart(3, '0') + '</td>' +
            '<td>' + compra.clienteNombre + '</td>' +
            '<td>' + compra.fecha + '</td>' +
            '<td>' + formatCurrency(compra.total) + '</td>' +
            '<td class="celda-acciones">' +
              '<button type="button" class="boton-accion boton-ver btn-ver-compra" data-id="' + compra.id + '" title="Ver">👁</button>' +
              '<button type="button" class="boton-accion boton-editar btn-editar-compra" data-id="' + compra.id + '" title="Editar">✎</button>' +
              '<button type="button" class="boton-accion boton-eliminar btn-eliminar-compra" data-id="' + compra.id + '" title="Eliminar">🗑</button>' +
            '</td>' +
          '</tr>'
        );
      }).join('');
    }

    var total = getCompras().length;
    document.getElementById('textoPaginacionCompras').textContent =
      'Mostrando ' + compras.length + ' de ' + total + ' compras';
  }

  function ajustarStock(items, operacion) {
    items.forEach(function (item) {
      var producto = findProducto(item.productoId);
      if (!producto) return;
      var delta = operacion === 'restar' ? -item.cantidad : item.cantidad;
      Storage.update('productos', producto.id, {
        existencias: Math.max(0, producto.existencias + delta)
      });
    });
  }

  function obtenerItemsValidos() {
    return lineItems
      .filter(function (item) { return item.productoId && item.cantidad > 0; })
      .map(function (item) {
        var producto = findProducto(Number(item.productoId));
        return {
          productoId: Number(item.productoId),
          productoNombre: producto ? producto.nombre : '',
          cantidad: Number(item.cantidad),
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal
        };
      });
  }

  function validarCompra(items) {
    if (!document.getElementById('selectCliente').value) {
      alert('Selecciona un cliente.');
      return false;
    }
    if (!items.length) {
      alert('Agrega al menos un producto.');
      return false;
    }
    for (var i = 0; i < items.length; i++) {
      var producto = findProducto(items[i].productoId);
      if (!producto) {
        alert('Producto no encontrado.');
        return false;
      }
      var stockDisponible = producto.existencias;
      if (editingId) {
        var anterior = Storage.findById('compras', editingId);
        if (anterior) {
          anterior.items.forEach(function (oldItem) {
            if (oldItem.productoId === items[i].productoId) {
              stockDisponible += oldItem.cantidad;
            }
          });
        }
      }
      if (stockDisponible < items[i].cantidad) {
        alert('Stock insuficiente para: ' + producto.nombre);
        return false;
      }
    }
    return true;
  }

  function limpiarFormulario() {
    editingId = null;
    lineItems = [crearLineaVacia()];
    document.getElementById('tituloFormCompra').textContent = 'Nueva Compra';
    document.getElementById('formularioCompra').reset();
    document.getElementById('inputFecha').value = getTodayDate();
    document.getElementById('selectCliente').innerHTML = renderOpcionesClientes();
    renderLineItems();
    actualizarResumen();
  }

  function guardarCompra(evento) {
    evento.preventDefault();
    var items = obtenerItemsValidos();
    if (!validarCompra(items)) return;

    var clienteId = Number(document.getElementById('selectCliente').value);
    var cliente = findCliente(clienteId);
    var totales = calcularTotales(items);
    var compra = {
      clienteId: clienteId,
      clienteNombre: cliente.nombre,
      fecha: document.getElementById('inputFecha').value,
      items: items,
      notas: document.getElementById('inputNotas').value.trim(),
      subtotal: totales.subtotal,
      iva: totales.iva,
      total: totales.total
    };

    if (editingId) {
      var anterior = Storage.findById('compras', editingId);
      if (anterior) ajustarStock(anterior.items, 'sumar');
      ajustarStock(items, 'restar');
      Storage.update('compras', editingId, compra);
    } else {
      ajustarStock(items, 'restar');
      Storage.create('compras', compra);
    }

    limpiarFormulario();
    renderHistorial('');
    if (typeof ComprasModule.onChange === 'function') ComprasModule.onChange();
  }

  function cargarCompra(id) {
    var compra = Storage.findById('compras', id);
    if (!compra) return;

    editingId = id;
    document.getElementById('tituloFormCompra').textContent = 'Editar Compra #' + String(id).padStart(3, '0');
    document.getElementById('selectCliente').innerHTML = renderOpcionesClientes(compra.clienteId);
    document.getElementById('inputFecha').value = compra.fecha;
    document.getElementById('inputNotas').value = compra.notas || '';
    lineItems = compra.items.map(function (item) {
      return {
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal
      };
    });
    renderLineItems();
    actualizarResumen();
  }

  function verCompra(id) {
    var compra = Storage.findById('compras', id);
    if (!compra) return;

    var detalle = compra.items.map(function (item) {
      return '  • ' + item.productoNombre + ' x' + item.cantidad + ' = ' + formatCurrency(item.subtotal);
    }).join('\n');

    alert(
      'Compra #' + String(compra.id).padStart(3, '0') + '\n' +
      'Cliente: ' + compra.clienteNombre + '\n' +
      'Fecha: ' + compra.fecha + '\n\n' +
      'Productos:\n' + detalle + '\n\n' +
      'Subtotal: ' + formatCurrency(compra.subtotal) + '\n' +
      'IVA: ' + formatCurrency(compra.iva) + '\n' +
      'Total: ' + formatCurrency(compra.total) +
      (compra.notas ? '\n\nNotas: ' + compra.notas : '')
    );
  }

  function eliminarCompra(id) {
    var compra = Storage.findById('compras', id);
    if (!compra) return;
    if (!confirm('¿Eliminar compra #' + String(id).padStart(3, '0') + ' de ' + compra.clienteNombre + '?')) return;

    ajustarStock(compra.items, 'sumar');
    Storage.remove('compras', id);
    if (editingId === id) limpiarFormulario();
    renderHistorial(document.getElementById('busquedaCompras').value);
    if (typeof ComprasModule.onChange === 'function') ComprasModule.onChange();
  }

  function manejarCambioItem(index, campo, valor) {
    lineItems[index][campo] = campo === 'productoId' ? Number(valor) : Number(valor);
    lineItems[index] = actualizarLinea(lineItems[index]);
    renderLineItems();
    actualizarResumen();
  }

  function bindEvents(container) {
    document.getElementById('selectCliente').innerHTML = renderOpcionesClientes();
    document.getElementById('inputFecha').value = getTodayDate();
    lineItems = [crearLineaVacia()];
    renderLineItems();
    renderHistorial('');

    document.getElementById('formularioCompra').addEventListener('submit', guardarCompra);
    document.getElementById('btnLimpiarCompra').addEventListener('click', limpiarFormulario);
    document.getElementById('btnAgregarItem').addEventListener('click', function () {
      lineItems.push(crearLineaVacia());
      renderLineItems();
    });

    document.getElementById('cuerpoItems').addEventListener('change', function (e) {
      var index = Number(e.target.dataset.index);
      if (e.target.classList.contains('select-producto')) {
        manejarCambioItem(index, 'productoId', e.target.value);
      }
    });

    document.getElementById('cuerpoItems').addEventListener('input', function (e) {
      var index = Number(e.target.dataset.index);
      if (e.target.classList.contains('input-cantidad')) {
        manejarCambioItem(index, 'cantidad', e.target.value);
      }
    });

    document.getElementById('cuerpoItems').addEventListener('click', function (e) {
      if (e.target.classList.contains('btn-quitar-item')) {
        var index = Number(e.target.dataset.index);
        lineItems.splice(index, 1);
        if (!lineItems.length) lineItems.push(crearLineaVacia());
        renderLineItems();
        actualizarResumen();
      }
    });

    document.getElementById('busquedaCompras').addEventListener('input', function (e) {
      renderHistorial(e.target.value);
    });

    document.getElementById('cuerpoHistorial').addEventListener('click', function (e) {
      var btn = e.target.closest('.boton-accion');
      if (!btn) return;
      var id = Number(btn.dataset.id);
      if (btn.classList.contains('btn-ver-compra')) verCompra(id);
      if (btn.classList.contains('btn-editar-compra')) cargarCompra(id);
      if (btn.classList.contains('btn-eliminar-compra')) eliminarCompra(id);
    });
  }

  function getStats() {
    var compras = getCompras();
    var ingresos = compras.reduce(function (sum, c) { return sum + c.total; }, 0);
    return { total: compras.length, ingresos: ingresos };
  }

  function getResumenPorCliente() {
    var resumen = {};
    getCompras().forEach(function (compra) {
      if (!resumen[compra.clienteId]) {
        resumen[compra.clienteId] = {
          clienteId: compra.clienteId,
          clienteNombre: compra.clienteNombre,
          totalCompras: 0,
          totalGastado: 0,
          productos: {}
        };
      }
      var entry = resumen[compra.clienteId];
      entry.totalCompras += 1;
      entry.totalGastado += compra.total;
      compra.items.forEach(function (item) {
        if (!entry.productos[item.productoId]) {
          entry.productos[item.productoId] = {
            nombre: item.productoNombre,
            cantidad: 0
          };
        }
        entry.productos[item.productoId].cantidad += item.cantidad;
      });
    });
    return Object.values(resumen);
  }

  function getRecientes(limite) {
    return getCompras().slice().reverse().slice(0, limite || 5);
  }

  return {
    onChange: null,
    render: renderModulo,
    init: bindEvents,
    getStats: getStats,
    getResumenPorCliente: getResumenPorCliente,
    getRecientes: getRecientes
  };
})();
