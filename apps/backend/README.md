# Lambda Physics - Backend API

Motor de datos de **Lambda Physics**. Esta API REST gestiona el sistema de _Speedrun_, almacenando los tiempos de los jugadores, generando clasificaciones globales y calculando estadísticas en tiempo real.

Construido con **Fastify**, **Prisma** (PostgreSQL) y **TypeScript**.

---

## ️ Mapa de Endpoints

La API cuenta con 5 rutas principales. Todas las respuestas se devuelven en formato JSON.

| Método   | Ruta                               | Descripción                                                                            |
| :------- | :--------------------------------- | :------------------------------------------------------------------------------------- |
| **GET**  | `/api/ranking`                     | Devuelve el top de jugadores ordenados por su mejor tiempo (menor a mayor).            |
| **GET**  | `/api/stats`                       | Devuelve estadísticas globales (total de partidas, media de tiempo y récord absoluto). |
| **GET**  | `/api/jugadores/:nombre/historial` | Devuelve el perfil de un jugador específico y todas sus partidas jugadas.              |
| **POST** | `/api/partidas`                    | Registra una nueva partida desde el juego (C++).                                       |
| **POST** | `/api/jugadores`                   | Registra manualmente a un jugador (opcional, `/api/partidas` lo hace automáticamente). |

---

## Cómo enviar datos (Para el Mod en C++)

Para guardar una partida cuando un jugador termina el nivel, hay que hacer una petición `POST` a `/api/partidas` con el siguiente formato JSON:

````json
{
  "nombre": "GordonFreeman",
  "tiempo": 128,
  "muertes": 0
}

## El tiempo debe enviarse en segundos

## Registro de Pruebas (Testing)

A continuación se documentan las pruebas de integración realizadas sobre la API para validar las respuestas del servidor y la estructura de los datos (JSON).

*(Nota: En los ejemplos se utiliza `<URL_DEL_SERVIDOR>` para referirse a la dirección donde esté desplegado el backend en cada momento, por ejemplo `localhost:3000` o un dominio en producción).*

### Prueba 1: Consulta de Estadísticas Globales
- **Endpoint:** GET http://<URL_DEL_SERVIDOR>/api/stats
- **Objetivo:** Verificar el cálculo automático de la media de tiempos y la extracción del jugador más rápido.
- **Respuesta validada:**
```json
{
  "totalPartidas": 1,
  "mediaTiempo": 128,
  "jugadorMasRapido": "Albert",
  "mejorTiempo": 128
}

### Prueba 2: Tabla de Clasificación (Ranking Speedrun)
- **Endpoint:** GET http://<URL_DEL_SERVIDOR>/api/ranking`
- **Objetivo:** Comprobar que el servidor devuelve a los jugadores ordenados por su mejor tiempo de forma ascendente.
- **Respuesta validada:**
```json
[
    {
        "jugador": "Albert",
        "tiempo": 128,
        "muertes": 0,
        "fecha": "2026-02-25T07:48:12.617Z"
    }
]

### Prueba 3: Registro de una Nueva Partida
- **Endpoint:** POST http://<URL_DEL_SERVIDOR>/api/partidas
- **Body enviado** JSON: {"nombre": "Albert", "tiempo": 128, "muertes": 0}
- **Objetivo:** Validar que el servidor guarda los datos del intento e identifica (o crea automáticamente) al jugador.
- **Respuesta validada:**
```json
{
    "id": 1,
    "jugadorId": "2696561d-c709-4367-8e0e-0c3581d8b867",
    "tiempo": 128,
    "muertes": 0,
    "createdAt": "2026-02-25T07:48:12.617Z"
}

### Prueba 4: Historial Individual de un Jugador
- **Endpoint:** GET http://<URL_DEL_SERVIDOR>/api/jugadores/Albert/historial
- **Objetivo:** Asegurar que se recupera el perfil completo del alumno y la lista de todos sus intentos.
- **Respuesta validada:**
```json
{
    "nombre": "Albert",
    "totalPartidas": 1,
    "partidas": [
        {
            "tiempo": 128,
            "muertes": 0,
            "createdAt": "2026-02-25T07:48:12.617Z"
        }
    ]
}

### Prueba 5: Registro Manual de un Jugador (Opcional)
- **Endpoint:** POST http://<URL_DEL_SERVIDOR>/api/jugadores
- **Body enviado** JSON: {"nombre": "Pepe"}
- **Objetivo:** Comprobar la creación directa de perfiles sin necesidad de enviar una partida simultánea.
- **Respuesta validada:**
```json
{
    "id": "3cff1e8f-afb0-4e22-95a1-8ed00e2d0150",
    "nombre": "Pepe"
}
````

