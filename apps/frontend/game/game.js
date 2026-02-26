
        async function cargarRanking() {
            try {
                const urlBackend = 'http://localhost:3000/api/ranking'; 
                
                const respuesta = await fetch(urlBackend);
                const ranking = await respuesta.json();
                
                const contenedor = document.getElementById('lista-ranking');
                contenedor.innerHTML = ''; // LIMPIEZA DE MENSAJE

                // LISTA SOLO CON LOS 20 PRIMEROS
                const top20 = ranking.slice(0, 20);

                if (top20.length === 0) {
                    contenedor.innerHTML = '<li style="justify-content: center;">Aún no hay registros de pruebas.</li>';
                    return;
                }

                // SE DIBUJA
                top20.forEach((posicion, index) => {
                    const elemento = document.createElement('li');
                    
                    const spanJugador = document.createElement('span');
                    spanJugador.textContent = `#${index + 1} | ${posicion.jugador}`;
                    
                    const spanTiempo = document.createElement('span');
                    spanTiempo.textContent = `${posicion.tiempo}s`;
                    spanTiempo.style.color = 'var(--naranja-hl)';

                    elemento.appendChild(spanJugador);
                    elemento.appendChild(spanTiempo);
                    
                    contenedor.appendChild(elemento);
                });

            } catch (error) {
                console.error("Error de conexión:", error);
                document.getElementById('lista-ranking').innerHTML = '<li style="justify-content: center; color: red;">ERROR DE CONEXIÓN CON EL SERVIDOR.</li>';
            }
        }

    function PantallaCompleta() {
        const juego = document.getElementById("miJuego");

        if (juego.requestFullscreen) {
            juego.requestFullscreen();
        } else if (juego.webkitRequestFullscreen) { 
            juego.webkitRequestFullscreen();
        } else if (juego.msRequestFullscreen) {
            juego.msRequestFullscreen();
        }
    }
        cargarRanking();