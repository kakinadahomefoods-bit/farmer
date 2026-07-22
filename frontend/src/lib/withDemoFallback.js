const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

export function withDemoFallback(realData, demoData) {
  if (DEMO_MODE && (!realData || (Array.isArray(realData) && realData.length === 0))) {
    return demoData
  }
  return realData
}

export function withDemoCategoriesFallback(realData, demoData) {
  if (DEMO_MODE && (!realData || (Array.isArray(realData) && realData.length === 0))) {
    return demoData
  }
  return realData
}

export { DEMO_MODE }
