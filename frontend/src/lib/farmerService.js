import { api } from './api'

export async function getFarmers() {
  try {
    const data = await api.getFarmers({ approved: 'true' })
    return data || []
  } catch (e) {
    throw e
  }
}