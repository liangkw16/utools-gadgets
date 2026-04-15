export const FEATURE_REGISTRY = Object.freeze({
  bluetooth: {
    code: 'bluetooth',
    label: 'Bluetooth'
  },
  speaker: {
    code: 'speaker',
    label: 'Speaker'
  }
})

export const DEFAULT_FEATURE = FEATURE_REGISTRY.bluetooth.code

export function normalizeFeatureCode (code) {
  return FEATURE_REGISTRY[code]?.code ?? DEFAULT_FEATURE
}
