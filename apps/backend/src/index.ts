import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// 🔓 Abrir las puertas al Frontend (CORS) - Tarea del Martes
fastify.register(cors, {
  origin: '*', 
});

// --------------------------------------------------------
// 📝 TAREAS DEL LUNES: ENDPOINTS DE GUARDADO
// --------------------------------------------------------

// 1. POST /api/jugadores -> Recibe el cl_name de Xash3D
fastify.post('/api/jugadores', async (request, reply) => {
  const { nombre } = request.body as { nombre: string };
  
  // upsert: Si el jugador ya existe, lo devuelve. Si no, lo crea.
  const jugador = await prisma.jugador.upsert({
    where: { nombre },
    update: {},
    create: { nombre },
  });
  
  return jugador;
});

// 2. POST /api/partidas -> Guarda los stats al terminar el nivel
fastify.post('/api/partidas', async (request, reply) => {
  const { nombre, tiempo, puntos, muertes } = request.body as any;
  
  // Primero buscamos al jugador por su nombre
  const jugador = await prisma.jugador.findUnique({
    where: { nombre }
  });

  if (!jugador) {
    return reply.status(404).send({ error: "Jugador no encontrado. Créalo primero." });
  }

  // Guardamos la partida asociada a su ID
  const partida = await prisma.partida.create({
    data: {
      jugadorId: jugador.id,
      tiempo,
      puntos,
      muertes: muertes || 0
    }
  });

  return partida;
});

// --------------------------------------------------------
// 🏆 TAREA DEL MARTES: EL RANKING PARA EL FRONTEND
// --------------------------------------------------------

// 3. GET /api/ranking -> Devuelve el Top 10 ordenado por puntos
fastify.get('/api/ranking', async (request, reply) => {
  // Pillamos el límite de la URL (ej: ?limit=10), si no hay, por defecto 10
  const limit = Number((request.query as any).limit) || 10;

  const topPartidas = await prisma.partida.findMany({
    take: limit,
    orderBy: {
      puntos: 'desc' // Ordenar de mayor a menor puntuación
    },
    include: {
      jugador: {
        select: { nombre: true } // Traer el nombre del jugador, no solo su ID
      }
    }
  });

  // Limpiamos la respuesta para que a Adrián le llegue un JSON bonito
  return topPartidas.map(p => ({
    jugador: p.jugador.nombre,
    puntos: p.puntos,
    tiempo: p.tiempo,
    muertes: p.muertes,
    fecha: p.createdAt
  }));
});

// Arrancar el camarero
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 API de Arquímedes corriendo en http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
