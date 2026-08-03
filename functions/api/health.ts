import { Env } from '../env';

export const onRequest: PagesFunction<Env> = async (context) => {
  return new Response(JSON.stringify({ status: 'ok', message: 'HICM API is running' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
