async function cargarRanking() {
  try {
    const url = "/api/ranking?limit=20";
    
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    if (!Array.isArray(datos)) {
      throw new Error("Formato inválido: /api/ranking no devuelve array.");
    }

    const ranking = datos;

    const contenedor = document.getElementById("lista-ranking");
    contenedor.innerHTML = "";

    const top20 = ranking.slice(0, 20);

    if (top20.length === 0) {
      contenedor.innerHTML =
        '<li style="justify-content: center;">Aún no hay registros de pruebas.</li>';
      return;
    }

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
    const detalle =
      error instanceof Error ? error.message : "Error desconocido.";
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

let startTime = null;

window.addEventListener("message", async (event) => {
  if (event.origin !== "https://davidserverubuntu2.duckdns.org") return;

  const data = event.data;

  if (data.type === "SPEEDRUN_START") {
    startTime = Date.now();
  }

  if (data.type === "SPEEDRUN_END" && startTime) {
    const timeMs = Date.now() - startTime;
    const tiempoSegundos = Math.round(timeMs / 1000);
    startTime = null;
    
    const nombreJugador = prompt("¡Nivel completado! Ingresa tu nombre:") ?? "Anonimo";

    try {
      await fetch("/api/jugadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreJugador })
      });

      await fetch("/api/partidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: nombreJugador, 
          tiempo: tiempoSegundos, 
          muertes: 0 
        })
      });

      cargarRanking();
      alert(`¡Tiempo registrado! ${tiempoSegundos} segundos.`);
    } catch (err) {
      console.error("Error al guardar la partida:", err);
    }
  }
});

cargarRanking();