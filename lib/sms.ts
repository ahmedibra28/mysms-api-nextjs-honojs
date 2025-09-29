import { EnvProp, SMSResponse, TokenProp } from '@/types'
import axios, { AxiosResponse } from 'axios'

const { BASE_URL, GRANT_TYPE, USERNAME, PASSWORD } =
  process.env as unknown as EnvProp

export const getToken = async (): Promise<AxiosResponse<TokenProp>> => {
  return await axios.post(
    `${BASE_URL}/token`,
    { username: USERNAME, password: PASSWORD, grant_type: GRANT_TYPE },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded/text',
      },
    }
  )
}

export const sendSingleSMS = async ({
  token,
  mobile,
  message,
  refId,
}: {
  token: string
  mobile: number
  message: string
  refId?: string | number
}): Promise<AxiosResponse<SMSResponse>> => {
  return await axios.post(
    `${BASE_URL}/api/SendSMS`,
    { mobile, message, ...{ refId } },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const sendBulkSMS = async ({
  token,
  data,
}: {
  token: string
  data: { mobile: number; message: string; refId?: string | number }[]
}): Promise<AxiosResponse<SMSResponse>> => {
  return await axios.post(`${BASE_URL}/api/Outbound/SendBulkSMS `, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export const getDeliveryStatus = async ({
  calBackUrl,
}: {
  calBackUrl: string
}) => {
  return await axios.get(calBackUrl)
}
