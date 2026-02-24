import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

declare const process: {
  env: {
    PORT?: string;
    [key: string]: string | undefined;
  };
  exit(code?: number): never;
};

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
// --------------------------------------------------------
// TAREAS DEL MIÉRCOLES: ESTADÍSTICAS E HISTORIAL
// --------------------------------------------------------

// 4. GET /api/stats -> El "Cerebro" de la API
fastify.get('/api/stats', async (request, reply) => {
  // Sacamos el total de partidas y la media de tiempo de un golpe
  const agregados = await prisma.partida.aggregate({
    _count: { id: true },
    _avg: { tiempo: true },
  });

  // Buscamos al "Rey de la pista" (el tiempo más bajo registrado)
  const recordAbsoluto = await prisma.partida.findFirst({
    orderBy: { tiempo: 'asc' },
    include: { jugador: { select: { nombre: true } } }
  });

  return {
    totalPartidas: agregados._count.id,
    mediaTiempo: agregados._avg.tiempo ? Math.round(agregados._avg.tiempo) : 0,
    jugadorMasRapido: recordAbsoluto ? recordAbsoluto.jugador.nombre : "Nadie aún",
    mejorTiempo: recordAbsoluto ? recordAbsoluto.tiempo : 0
  };
});

// 5. GET /api/jugadores/:nombre/historial -> La ficha del jugador
fastify.get('/api/jugadores/:nombre/historial', async (request, reply) => {
  const { nombre } = request.params as { nombre: string };

  const historial = await prisma.jugador.findUnique({
    where: { nombre },
    include: {
      partidas: {
        orderBy: { createdAt: 'desc' }, // De la más reciente a la más antigua
        select: {
          tiempo: true,
          muertes: true,
          createdAt: true
        }
      }
    }
  });

  if (!historial) {
    return reply.status(404).send({ error: "Jugador no encontrado" });
  }

  return {
    nombre: historial.nombre,
    totalPartidas: historial.partidas.length,
    partidas: historial.partidas
  };
});
// Arrancar el servidor
const start = async () => {
  try {
    // Si la nube nos da un puerto, lo usamos; si no, el 3000
    const port = Number(process.env.PORT) || 3000;
    
    await fastify.listen({ 
      port: port, 
      host: '0.0.0.0' // Importante para que Fly.io pueda entrar
    });
    
    console.log(`🚀 API de Arquímedes rodando en el puerto ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
