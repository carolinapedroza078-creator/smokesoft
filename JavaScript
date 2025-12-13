document.addEventListener('DOMContentLoaded', () => {
    const menuOculto = document.getElementById('menuOculto');
    const authLink = document.getElementById('authLink');
    const estaLogeado = localStorage.getItem('usuarioLogeado') === 'true'; // Verifica si hay una sesión activa
    
    // Función para actualizar la UI según el estado de la sesión
    function actualizarMenu(logeado) {
        if (logeado) {
            // Usuario logeado: Mostrar menú sensible y cambiar el texto del botón
            menuOculto.classList.add('sesion-iniciada');
            authLink.textContent = 'Cerrar Sesión';
            authLink.href = '#'; // Usaremos JS para manejar el cierre
            authLink.onclick = cerrarSesion;
        } else {
            // Usuario NO logeado: Ocultar menú sensible y mostrar Iniciar Sesión
            menuOculto.classList.remove('sesion-iniciada');
            authLink.textContent = 'Iniciar Sesión';
            authLink.href = 'html/registro.html'; // Redirigir a la página de inicio de sesión
            authLink.onclick = null;
        }
    }
    
    // Función para manejar el cierre de sesión
    function cerrarSesion() {
        localStorage.removeItem('usuarioLogeado');
        // Redirigir o simplemente actualizar el menú
        alert("Sesión cerrada.");
        actualizarMenu(false);
        // Opcional: window.location.href = '../index.html';
    }

    // Inicializar el menú
    actualizarMenu(estaLogeado);

    // *************************************************************
    // FUNCIÓN DE SIMULACIÓN DE INICIO DE SESIÓN (SOLO PARA PRUEBAS)
    // Agrega esta lógica a tu página de inicio de sesión real (registro.html, si la estás usando como tal)
    // Para probar: Simula un login exitoso
    const botonLoginSimulado = document.getElementById('ingresarBtn'); 
    if (botonLoginSimulado) {
        botonLoginSimulado.addEventListener('click', (e) => {
            e.preventDefault();
            // Simulación exitosa
            localStorage.setItem('usuarioLogeado', 'true');
            alert('¡Inicio de sesión exitoso!');
            window.location.href = '../index.html'; // Redirigir a la página principal
        });
    }
    // *************************************************************
});
