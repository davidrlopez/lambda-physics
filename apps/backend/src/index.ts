import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

//Abrir las puertas al Frontend (CORS)
fastify.register(cors, {
  origin: '*', 
});

// --------------------------------------------------------
//  ENDPOINTS DE GUARDADO
// --------------------------------------------------------

// 1. POST /api/jugadores -> Recibe el cl_name de Xash3D
fastify.post('/api/jugadores', async (request, reply) => {
  const { nombre } = request.body as { nombre: string };
  
  const jugador = await prisma.jugador.upsert({
    where: { nombre },
    update: {},
    create: { nombre },
  });
  
  return jugador;
});

// 2. POST /api/partidas -> Guarda los stats al terminar el nivel
fastify.post('/api/partidas', async (request, reply) => {
  const { nombre, tiempo, muertes } = request.body as any;
  
  const jugador = await prisma.jugador.findUnique({
    where: { nombre }
  });

  if (!jugador) {
    return reply.status(404).send({ error: "Jugador no encontrado. Créalo primero." });
  }

  const partida = await prisma.partida.create({
    data: {
      jugadorId: jugador.id,
      tiempo,
      muertes: muertes || 0
    }
  });

  return partida;
});

// --------------------------------------------------------
//  EL RANKING PARA EL FRONTEND
// --------------------------------------------------------

// 3. GET /api/ranking -> Devuelve el Top 10 ordenado por tiempo (Speedrun)
fastify.get('/api/ranking', async (request, reply) => {
  const limit = Number((request.query as any).limit) || 10;

  const topPartidas = await prisma.partida.findMany({
    take: limit,
    orderBy: {
      tiempo: 'asc' // El menor tiempo va primero
    },
    include: {
      jugador: {
        select: { nombre: true } 
      }
    }
  });

  return topPartidas.map(p => ({
    jugador: p.jugador.nombre,
    tiempo: p.tiempo,
    muertes: p.muertes,
    fecha: p.createdAt
  }));
});

// Arrancar el servidor
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
