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

const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const rateWindowMs = Number(process.env.RATE_WINDOW_MS ?? 60_000);
const rateMaxRequests = Number(process.env.RATE_MAX_REQUESTS ?? 120);
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

const MAX_LIMIT = 100;

function cleanNombre(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const nombre = input.trim();
  if (nombre.length < 1 || nombre.length > 32) return null;
  if (!/^[\w\- .]+$/u.test(nombre)) return null;
  return nombre;
}

function parseIntegerInRange(input: unknown, min: number, max: number): number | null {
  const value = Number(input);
  if (!Number.isInteger(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

// CORS configurable con variable CORS_ORIGINS (CSV). Sin variable, permite todos (modo dev).
fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0) return cb(null, true);
    cb(null, allowedOrigins.includes(origin));
  },
});

// Rate-limit simple por IP + ruta para reducir spam en endpoints públicos.
fastify.addHook('onRequest', async (request, reply) => {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return;
  }

  const key = `${request.ip}:${method}:${request.url.split('?')[0]}`;
  const now = Date.now();
  const current = requestBuckets.get(key);

  if (!current || now >= current.resetAt) {
    requestBuckets.set(key, { count: 1, resetAt: now + rateWindowMs });
    return;
  }

  if (current.count >= rateMaxRequests) {
    return reply.status(429).send({ error: 'Too many requests' });
  }

  current.count += 1;
});

// --------------------------------------------------------
//  ENDPOINTS DE GUARDADO
// --------------------------------------------------------

// 1. POST /api/jugadores -> Recibe el cl_name de Xash3D
fastify.post('/api/jugadores', async (request, reply) => {
  const body = request.body as { nombre?: unknown };
  const nombre = cleanNombre(body?.nombre);
  if (!nombre) {
    return reply.status(400).send({ error: 'Nombre inválido' });
  }

  const jugador = await prisma.jugador.upsert({
    where: { nombre },
    update: {},
    create: { nombre },
  });
  
  return jugador;
});

// 2. POST /api/partidas -> Guarda los stats al terminar el nivel
fastify.post('/api/partidas', async (request, reply) => {
  const body = request.body as { nombre?: unknown; tiempo?: unknown; muertes?: unknown };
  const nombre = cleanNombre(body?.nombre);
  const tiempo = parseIntegerInRange(body?.tiempo, 0, 86_400);
  const muertes = parseIntegerInRange(body?.muertes ?? 0, 0, 10_000);

  if (!nombre || tiempo === null || muertes === null) {
    return reply.status(400).send({ error: 'Payload inválido' });
  }

  const jugador = await prisma.jugador.findUnique({
    where: { nombre },
  });

  if (!jugador) {
    return reply.status(404).send({ error: "Jugador no encontrado. Créalo primero." });
  }

  const partida = await prisma.partida.create({
    data: {
      jugadorId: jugador.id,
      tiempo,
      muertes,
    },
  });

  return partida;
});

// --------------------------------------------------------
//  EL RANKING PARA EL FRONTEND
// --------------------------------------------------------

// 3. GET /api/ranking -> Devuelve el Top 10 ordenado por tiempo (Speedrun)
fastify.get('/api/ranking', async (request, reply) => {
  const requestedLimit = parseIntegerInRange((request.query as { limit?: unknown })?.limit ?? 10, 1, MAX_LIMIT);
  const limit = requestedLimit ?? 10;

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
  const rawNombre = (request.params as { nombre?: unknown })?.nombre;
  const nombre = cleanNombre(rawNombre);
  if (!nombre) {
    return reply.status(400).send({ error: 'Nombre inválido' });
  }

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
