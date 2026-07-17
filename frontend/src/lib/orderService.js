import { api } from './api'

export async function getOrders() {
  return api.getUserOrders()
}

export async function getOrderById(orderId) {
  return api.getOrder(orderId)
}

export async function createOrder(orderData) {
  return api.createOrder(orderData)
}