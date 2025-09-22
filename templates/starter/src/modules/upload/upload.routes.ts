import Bun from 'bun'
import { Hono } from 'hono'

export const uploadRoutes = new Hono()

// upload route example
uploadRoutes.post('/', async (ctx) => {
  // TODO: should have authentication

  // [Option 1]: Using form
  // const form = await ctx.req.formData()
  // const file = form.get('file')

  // [Option 2]: Using body
  const body = await ctx.req.parseBody()
  const file = body.file as File

  const name = `${Date.now()}-${file.name}`
  const path = `upload/${name}`

  await Bun.write(path, file)

  return ctx.json({
    success: true,
    data: {
      filename: name,
      url: path,
    },
  })
})
