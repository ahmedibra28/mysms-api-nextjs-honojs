export type EnvProp = {
  USERNAME: string
  PASSWORD: string
  GRANT_TYPE: string
  TOKEN_URL: string
  BASE_URL: string
}

export type TokenProp = {
  access_token: string
  token_type: string
  expires_in: number
  userName: string
  '.issued': string
  '.expires': string
}

export type SMSResponse = {
  ResponseCode: string
  ResponseMessage: string
  Data: {
    MessageID: string
    Description: string
    DeliveryCallBack: string
    Details: {
      TextLength: number
      TotalCharacters: number
      TotalSMS: number
      IsGMS7Bit: boolean
      ContainsUnicode: boolean
      IsMultipart: boolean
      ExtensionSet: Array<string>
      UnicodeSet: Array<string>
      MessageParts: Array<string>
    }
  }
}

export type WebhookProp = {
  ID: string
  MessageID: string
  Origin: string
  Destination: string
  MessagePart: string
  PartNo: string
  StatusId: '2' | '3' | '5'
  Status: string
  DeliveredOn: string
}
