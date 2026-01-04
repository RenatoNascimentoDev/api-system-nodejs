import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { getRoomsController } from '../controllers/get-rooms-controller.ts'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', getRoomsController)
}
