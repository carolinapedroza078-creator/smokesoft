/**
 * Capa de persistencia con localStorage.
 */
var Storage = (function () {
  var PREFIX = 'smokesoft_';

  function getKey(key) {
    return PREFIX + key;
  }

  function read(key) {
    try {
      var raw = localStorage.getItem(getKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error al leer datos:', error);
      return null;
    }
  }

  function write(key, data) {
    localStorage.setItem(getKey(key), JSON.stringify(data));
  }

  function init(key, defaultData) {
    if (!read(key)) {
      write(key, defaultData);
    }
    return read(key);
  }

  function getAll(key) {
    return init(key, []);
  }

  function saveAll(key, items) {
    write(key, items);
    return items;
  }

  function getNextId(items) {
    if (!items.length) return 1;
    var maxId = items.reduce(function (max, item) {
      return item.id > max ? item.id : max;
    }, 0);
    return maxId + 1;
  }

  function create(key, item) {
    var items = getAll(key);
    item.id = getNextId(items);
    items.push(item);
    saveAll(key, items);
    return item;
  }

  function update(key, id, updates) {
    var items = getAll(key);
    var index = items.findIndex(function (item) {
      return item.id === id;
    });
    if (index === -1) return null;
    items[index] = Object.assign({}, items[index], updates, { id: id });
    saveAll(key, items);
    return items[index];
  }

  function remove(key, id) {
    var items = getAll(key).filter(function (item) {
      return item.id !== id;
    });
    saveAll(key, items);
    return items;
  }

  function findById(key, id) {
    return getAll(key).find(function (item) {
      return item.id === id;
    }) || null;
  }

  function search(key, query, fields) {
    var term = query.trim().toLowerCase();
    if (!term) return getAll(key);
    return getAll(key).filter(function (item) {
      return fields.some(function (field) {
        return String(item[field] || '').toLowerCase().includes(term);
      });
    });
  }

  return {
    init: init,
    getAll: getAll,
    create: create,
    update: update,
    remove: remove,
    findById: findById,
    search: search
  };
})();
