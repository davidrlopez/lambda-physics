async function cargarRanking() {
  try {
    const urls = [
      "https://davidserverubuntu.duckdns.org/api/ranking?limit=20",
      "https://davidserverubuntu.duckdns.org:4000/api/ranking?limit=20",
      "http://davidserverubuntu.duckdns.org:4000/api/ranking?limit=20",
    ];

    let datos = null;
    let ultimoError = null;

    for (const url of urls) {
      if (window.location.protocol === "https:" && url.startsWith("http://")) {
        continue;
      }

      try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
          throw new Error(`HTTP ${respuesta.status}`);
        }

        const candidato = await respuesta.json();
        if (!Array.isArray(candidato)) {
          throw new Error("Formato inválido: /api/ranking no devuelve array.");
        }

        datos = candidato;
        break;
      } catch (error) {
        ultimoError = error;
      }
    }

    if (!Array.isArray(datos)) {
      const detalle =
        ultimoError instanceof Error
          ? ultimoError.message
          : "No se pudo conectar con ningún endpoint de ranking.";
      throw new Error(detalle);
    }
    const ranking = datos;

    const contenedor = document.getElementById("lista-ranking");
    contenedor.innerHTML = ""; // LIMPIEZA DE MENSAJE

    // LISTA SOLO CON LOS 20 PRIMEROS
    const top20 = ranking.slice(0, 20);

    if (top20.length === 0) {
      contenedor.innerHTML =
        '<li style="justify-content: center;">Aún no hay registros de pruebas.</li>';
      return;
    }

    // SE DIBUJA
    top20.forEach((posicion, index) => {
      const elemento = document.createElement("li");

      const spanJugador = document.createElement("span");
      spanJugador.textContent = `#${index + 1} | ${posicion.jugador}`;

      const spanTiempo = document.createElement("span");
      spanTiempo.textContent = `${posicion.tiempo}s`;
      spanTiempo.style.color = "var(--naranja-hl)";

      elemento.appendChild(spanJugador);
      elemento.appendChild(spanTiempo);

      contenedor.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error de conexión:", error);
    const detalle = error instanceof Error ? error.message : "Error desconocido.";
    document.getElementById("lista-ranking").innerHTML =
      `<li style="justify-content: center; color: red;">ERROR AL CARGAR RANKING: ${detalle}</li>`;
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
