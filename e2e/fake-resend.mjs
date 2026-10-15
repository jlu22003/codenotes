// Stand-in for api.resend.com during e2e runs. The site reaches it through
// RESEND_BASE_URL; tests steer it with /__next and inspect it with /__sent.
import http from 'node:http'

const PORT = Number(process.env.E2E_RESEND_PORT ?? 3201)
const queue = []
const sent = []

function reply(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

http
  .createServer(async (req, res) => {
    let raw = ''
    for await (const chunk of req) raw += chunk
    const url = new URL(req.url, `http://localhost:${PORT}`)

    if (req.method === 'POST' && url.pathname === '/emails') {
      let email
      try {
        email = JSON.parse(raw)
        if (typeof email.subject !== 'string') throw new Error('missing subject')
      } catch {
        return reply(res, 400, { error: 'expected a JSON body with a string subject' })
      }
      sent.push(email)
      const index = queue.findIndex((queued) => email.subject.includes(queued.match))
      const next = index === -1 ? { status: 200, body: { id: 'fake-email-id' } } : queue.splice(index, 1)[0]
      return reply(res, next.status, next.body)
    }
    if (req.method === 'POST' && url.pathname === '/__next') {
      queue.push(JSON.parse(raw))
      return reply(res, 200, {})
    }
    if (req.method === 'GET' && url.pathname === '/__sent') {
      const match = url.searchParams.get('match') ?? ''
      return reply(res, 200, sent.filter((email) => email.subject.includes(match)))
    }
    if (req.method === 'GET' && url.pathname === '/') return reply(res, 200, { ok: true })
    reply(res, 404, { error: 'not found' })
  })
  .listen(PORT, () => console.log(`fake resend listening on ${PORT}`))
