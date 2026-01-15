import { ESocialTransmissionRequest, ESocialTransmissionResponse } from "./contract"

export interface ESocialTransmissionClientOptions {
  endpointUrl: string
  accessToken?: string
}

export class ESocialTransmissionClient {
  private endpointUrl: string
  private accessToken?: string

  constructor(options: ESocialTransmissionClientOptions) {
    this.endpointUrl = options.endpointUrl
    this.accessToken = options.accessToken
  }

  async transmit(request: ESocialTransmissionRequest): Promise<ESocialTransmissionResponse> {
    const response = await fetch(this.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Falha na transmissão eSocial: HTTP ${response.status}`)
    }

    const data = (await response.json()) as ESocialTransmissionResponse
    return data
  }
}

