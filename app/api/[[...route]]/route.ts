import { getToken, sendBulkSMS } from '@/lib/sms'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import prisma from '@/lib/prisma.db'
import { message } from '@/lib/message'

const app = new Hono().basePath('/api')

app.get('/', async (c) => {
  return c.json({ message: 'Welcome to my SMS API 🚀' })
})

app.post('/send', async (c) => {
  try {
    const { page } = c.req.query() as { page: string }

    if (!page || parseInt(page) < 1)
      throw {
        message: 'page is required',
        status: 400,
      }

    const pageSize = 5
    const skip = (parseInt(page) - 1) * pageSize

    const query = { where: { status: 'Pending' } }

    const [result, total] = await Promise.all([
      await prisma.customer.findMany({
        ...query,
        take: pageSize,
        skip,
      }),

      await prisma.customer.count(query),
    ])

    const pages = Math.ceil(total / pageSize)

    const { data } = await getToken()

    const { data: sentResult } = await sendBulkSMS({
      token: data.access_token,
      // data: result?.map((item) => ({
      //   mobile: item.mobile,
      //   message,
      // })),
      data: [{ mobile: 615301507, message: message, refId: '123456' }],
    })

    if (sentResult.ResponseMessage === 'Failed.') {
      throw {
        message: sentResult.Data.Description,
      }
    }

    // await prisma.customer.updateMany({
    //   where: { id: { in: result.map((item) => item.id) } },
    //   data: { status: 'Sent' },
    // })

    return c.json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page: parseInt(page),
      pages,
      total,
      response: sentResult,
      data: result,
    })
  } catch (error: any) {
    const e = {
      message: error?.response?.data?.error || error?.message,
      description:
        error?.response?.data?.error_description || 'Something went wrong',
    }
    return c.json({ error: e }, error?.status || 500)
  }
})

app.post('/webhook', async (c) => {
  try {
    const body = await c.req.json()

    console.log(body)

    return c.json(body)

    // const parsedBody: {
    //   messageId: string
    //   refId: string
    //   mobile: number
    //   dlrStatus: '2' | '3' | '5'
    //   dlrTime: string
    // } = {
    //   messageId: body?.MessageID,
    //   refId: body?.RefID,
    //   mobile: body?.Destination,
    //   dlrStatus: body?.DLRStatus,
    //   dlrTime: body?.DLRTime,
    // }

    // const status = {
    //   '2': 'Delivered',
    //   '3': 'Expired',
    //   '5': 'Undelivered',
    // }

    // console.log({
    //   body,
    //   parsed: { ...parsedBody, status: status[parsedBody.dlrStatus] },
    // })

    // return c.json({
    //   ...parsedBody,
    //   status: status[parsedBody.dlrStatus],
    // })
  } catch (error: any) {
    const e = {
      message: error?.response?.data?.error || error?.message,
      description:
        error?.response?.data?.error_description || 'Something went wrong',
    }
    return c.json({ error: e }, error?.status || 500)
  }
})

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

export const GET = handle(app)
export const POST = handle(app)
