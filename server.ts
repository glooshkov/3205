import fs from 'fs/promises';
import fastify from 'fastify';
import cors from '@fastify/cors';


const server = fastify({ logger: true });

server.register(cors, {
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
});

server.get('/', async (request, reply) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const data:string = await fs.readFile('./users.json', 'utf8');
    const users = JSON.parse(data);

    const email: string = (request.query as { email?: string }).email || '';
    const number: string = (request.query as { number?: string }).number || '';

    const result = users.filter((user: { email: string, number: string }) =>
      (email === user.email.toLowerCase()) ||
      (number === user.number)
    );

    if (result.length != 0) {
      reply.send({
        users: result,
        message: 'The following matches were found for your request' as string,
      });
    } else {
      reply.send({
        users: [],
        message: 'Nothing found for your request' as string,
      });
    }
  } catch (error) {
    console.error('File read failed:', error);
    reply.status(500).send('File read failed');
  }
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: 'localhost' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start().catch(err => {
  console.error('Error starting server:', err);
});