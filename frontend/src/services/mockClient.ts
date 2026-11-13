// VITE_MOCK_LATENCY slows every mock down (in ms), to look at loading states.
const MOCK_LATENCY_MS = Number(import.meta.env.VITE_MOCK_LATENCY) || 500

const readFeatures = (value: unknown) => String(value ?? '').split(',')

// For mocks whose empty state is a flag on shared data rather than a different response.
export const isMockEmpty = (feature: string) => readFeatures(import.meta.env.VITE_MOCK_EMPTY).includes(feature)

// Stands in for HTTP until the backend exists. The delay makes loading states visible, and two
// env vars take comma-separated feature names: VITE_MOCK_FAIL tests error states, and
// VITE_MOCK_EMPTY tests empty states by returning emptyData.
export function mockRequest<T>(feature: string, data: T, emptyData: T = data): Promise<T> {
  const failing = readFeatures(import.meta.env.VITE_MOCK_FAIL)
  const isEmpty = readFeatures(import.meta.env.VITE_MOCK_EMPTY).includes(feature)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failing.includes(feature)) reject(new Error(`Mock failure: ${feature}`))
      else resolve(isEmpty ? emptyData : data)
    }, MOCK_LATENCY_MS)
  })
}
