#  Lambda Physics - Backend API

Bienvenido al motor de datos de **Lambda Physics**. Esta API REST gestiona el sistema de *Speedrun*, almacenando los tiempos de los jugadores, generando clasificaciones globales y calculando estadísticas en tiempo real.

Construido con **Fastify**, **Prisma** (PostgreSQL) y **TypeScript**.

---

## ️ Mapa de Endpoints

La API cuenta con 5 rutas principales. Todas las respuestas se devuelven en formato JSON.

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/ranking` | Devuelve el top de jugadores ordenados por su mejor tiempo (menor a mayor). |
| **GET** | `/api/stats` | Devuelve estadísticas globales (total de partidas, media de tiempo y récord absoluto). |
| **GET** | `/api/jugadores/:nombre/historial` | Devuelve el perfil de un jugador específico y todas sus partidas jugadas. |
| **POST** | `/api/partidas` | Registra una nueva partida desde el juego (C++). |
| **POST** | `/api/jugadores` | Registra manualmente a un jugador (opcional, `/api/partidas` lo hace automáticamente). |

---

## Cómo enviar datos (Para el Mod en C++)

Para guardar una partida cuando un jugador termina el nivel, hay que hacer una petición `POST` a `/api/partidas` con el siguiente formato JSON:

```json
{
  "nombre": "GordonFreeman",
  "tiempo": 128, 
  "muertes": 0
}

## El tiempo debe enviarse en segundos
