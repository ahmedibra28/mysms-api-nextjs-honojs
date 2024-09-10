import { getToken, sendBulkSMS } from '@/lib/sms'
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import prisma from '@/lib/prisma.db'
import { message } from '@/lib/message'
import { WebhookProp } from '@/types'

const app = new Hono().basePath('/api/v1')

app.get('/', async (c) => {
  return c.json({ message: 'Welcome to my SMS API 🚀' })
})

app.post('/send', async (c) => {
  try {
    const { page, limit } = c.req.query() as { page: string; limit: string }

    if (!page || parseInt(page) < 1)
      throw {
        message: 'page is required',
        status: 400,
      }

    if (!limit || parseInt(limit) < 1)
      throw {
        message: 'limit is required',
        status: 400,
      }

    const pageSize = parseInt(limit)
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

    if (total < 1)
      throw {
        message: 'There are no pending numbers',
      }

    const { data } = await getToken()

    const { data: sentResult } = await sendBulkSMS({
      token: data.access_token,
      data: result?.map((item) => ({
        mobile: item.mobile,
        message,
      })),
    })

    if (sentResult.ResponseMessage === 'Failed.') {
      throw {
        message: sentResult.Data.Description,
      }
    }

    await prisma.customer.updateMany({
      where: { mobile: { in: result.map((item) => item.mobile) } },
      data: { status: 'Sent' },
    })

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
    const body = (await c.req.json()) as WebhookProp

    const status = {
      '2': 'Delivered',
      '3': 'Expired',
      '5': 'Undelivered',
    }

    const parsedBody = {
      id: body?.MessageID,
      mobile: body?.Destination,
      deliveredAt: new Date(body.DeliveredOn),
      deliveryStatus: status[body.StatusId],
    }

    console.log(parsedBody)

    const mobile = parsedBody?.mobile?.startsWith('252')
      ? parsedBody.mobile.slice(3)
      : parsedBody?.mobile

    if (mobile) {
      await prisma.customer.update({
        where: { mobile: parseInt(mobile) },
        data: { status: parsedBody.deliveryStatus },
      })
    }
    return c.json(parsedBody)
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
