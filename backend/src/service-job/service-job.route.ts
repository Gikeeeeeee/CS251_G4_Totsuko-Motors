import { Router } from 'express'
import { updateServiceJob } from './service-job.controller'

const router = Router()

router.put('/:id', updateServiceJob)

export default router
