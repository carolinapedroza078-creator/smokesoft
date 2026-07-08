/**
 * Factory para crear módulos CRUD reutilizables.
 */
var CrudFactory = (function () {
  var editingId = null;

  function formatCellValue(column, item) {
    var value = item[column.key];
    if (column.format === 'currency') {
      return '$' + Number(value).toLocaleString('es-CO');
    }
    if (column.format === 'boolean') {
      return value ? 'Activo' : 'Inactivo';
    }
    return value != null ? value : '';
  }

  function buildFormField(field) {
    var html = '<div class="grupo-campo">';
    html += '<label for="' + field.name + '">' + field.label + '</label>';

    if (field.type === 'select') {
      html += '<select id="' + field.name + '" name="' + field.name + '">';
      field.options.forEach(function (opt) {
        html += '<option value="' + opt + '">' + opt + '</option>';
      });
      html += '</select>';
    } else if (field.type === 'checkbox') {
      html += '<input type="checkbox" id="' + field.name + '" name="' + field.name + '"';
      if (field.default) html += ' checked';
      html += '>';
    } else {
      html += '<input type="' + field.type + '" id="' + field.name + '" name="' + field.name + '"';
      if (field.placeholder) html += ' placeholder="' + field.placeholder + '"';
      if (field.required !== false) html += ' required';
      html += '>';
    }

    html += '</div>';
    return html;
  }

  function renderForm(config) {
    var fieldsHtml = config.fields.map(buildFormField).join('');
    return (
      '<div class="tarjeta-modulo tarjeta-formulario">' +
        '<h3 id="tituloFormulario">Registrar ' + config.entityName + '</h3>' +
        '<form id="formularioCrud">' + fieldsHtml +
          '<div class="botones-formulario">' +
            '<button type="button" class="boton-limpiar" id="btnLimpiar">Limpiar</button>' +
            '<button type="submit" class="boton-guardar">Guardar</button>' +
          '</div>' +
        '</form>' +
      '</div>'
    );
  }

  function renderTable(config) {
    var headers = config.columns.map(function (col) {
      return '<th>' + col.label + '</th>';
    }).join('');
    headers += '<th>Acciones</th>';

    return (
      '<div class="tarjeta-modulo tarjeta-lista">' +
        '<div class="encabezado-lista">' +
          '<h3>Lista de ' + config.entityNamePlural + '</h3>' +
          '<button type="button" class="boton-nuevo" id="btnNuevo">+ Nuevo ' + config.entityName + '</button>' +
        '</div>' +
        '<div class="contenedor-busqueda">' +
          '<input type="text" id="campoBusqueda" placeholder="Buscar ' + config.entityNamePlural.toLowerCase() + '...">' +
        '</div>' +
        '<div class="contenedor-tabla">' +
          '<table class="tabla-modulo">' +
            '<thead><tr>' + headers + '</tr></thead>' +
            '<tbody id="cuerpoTabla"></tbody>' +
          '</table>' +
        '</div>' +
        '<p class="texto-paginacion" id="textoPaginacion"></p>' +
      '</div>'
    );
  }

  function renderModule(config) {
    return (
      '<div class="modulo-crud" data-modulo="' + config.storageKey + '">' +
        '<h2 class="titulo-modulo">Gestión de ' + config.entityNamePlural + '</h2>' +
        '<div class="layout-modulo">' +
          renderForm(config) +
          renderTable(config) +
        '</div>' +
      '</div>'
    );
  }

  function getFormData(config) {
    var data = {};
    config.fields.forEach(function (field) {
      var input = document.getElementById(field.name);
      if (field.type === 'checkbox') {
        data[field.name] = input.checked;
      } else if (field.type === 'number') {
        data[field.name] = Number(input.value);
      } else {
        data[field.name] = input.value.trim();
      }
    });
    return data;
  }

  function setFormData(config, item) {
    config.fields.forEach(function (field) {
      var input = document.getElementById(field.name);
      if (field.type === 'checkbox') {
        input.checked = Boolean(item[field.name]);
      } else {
        input.value = item[field.name] != null ? item[field.name] : '';
      }
    });
  }

  function clearForm(config) {
    editingId = null;
    document.getElementById('formularioCrud').reset();
    document.getElementById('tituloFormulario').textContent = 'Registrar ' + config.entityName;
  }

  function renderTableRows(config, items) {
    var tbody = document.getElementById('cuerpoTabla');
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="' + (config.columns.length + 1) + '" class="celda-vacia">No hay registros</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(function (item) {
      var cells = config.columns.map(function (col) {
        return '<td>' + formatCellValue(col, item) + '</td>';
      }).join('');

      return (
        '<tr data-id="' + item.id + '">' + cells +
          '<td class="celda-acciones">' +
            '<button type="button" class="boton-accion boton-editar" data-id="' + item.id + '" title="Editar">✎</button>' +
            '<button type="button" class="boton-accion boton-eliminar" data-id="' + item.id + '" title="Eliminar">🗑</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function updatePagination(config, count) {
    var texto = document.getElementById('textoPaginacion');
    if (!texto) return;
    var total = Storage.getAll(config.storageKey).length;
    texto.textContent = 'Mostrando ' + count + ' de ' + total + ' ' + config.entityNamePlural.toLowerCase();
  }

  function refreshTable(config, query) {
    var searchFields = config.searchFields || config.columns.map(function (c) { return c.key; });
    var items = query ? Storage.search(config.storageKey, query, searchFields) : Storage.getAll(config.storageKey);
    renderTableRows(config, items);
    updatePagination(config, items.length);
  }

  function bindEvents(config, container) {
    var form = container.querySelector('#formularioCrud');
    var searchInput = container.querySelector('#campoBusqueda');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = getFormData(config);
      if (editingId) {
        Storage.update(config.storageKey, editingId, data);
      } else {
        Storage.create(config.storageKey, data);
      }
      clearForm(config);
      refreshTable(config, searchInput.value);
      if (typeof config.onChange === 'function') config.onChange();
    });

    container.querySelector('#btnLimpiar').addEventListener('click', function () {
      clearForm(config);
    });

    container.querySelector('#btnNuevo').addEventListener('click', function () {
      clearForm(config);
      container.querySelector('#formularioCrud').scrollIntoView({ behavior: 'smooth' });
    });

    searchInput.addEventListener('input', function () {
      refreshTable(config, searchInput.value);
    });

    container.querySelector('#cuerpoTabla').addEventListener('click', function (e) {
      var btn = e.target.closest('.boton-accion');
      if (!btn) return;
      var id = Number(btn.dataset.id);

      if (btn.classList.contains('boton-editar')) {
        var item = Storage.findById(config.storageKey, id);
        if (item) {
          editingId = id;
          setFormData(config, item);
          document.getElementById('tituloFormulario').textContent = 'Editar ' + config.entityName;
        }
      }

      if (btn.classList.contains('boton-eliminar')) {
        var nombre = Storage.findById(config.storageKey, id);
        var label = nombre ? (nombre.nombre || nombre.usuario || 'este registro') : 'este registro';
        if (confirm('¿Eliminar ' + label + '?')) {
          Storage.remove(config.storageKey, id);
          if (editingId === id) clearForm(config);
          refreshTable(config, searchInput.value);
          if (typeof config.onChange === 'function') config.onChange();
        }
      }
    });
  }

  function create(config) {
    return {
      config: config,
      render: function () {
        return renderModule(config);
      },
      init: function (container) {
        editingId = null;
        refreshTable(config);
        bindEvents(config, container);
      }
    };
  }

  return { create: create };
})();
