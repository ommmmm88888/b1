import { describe, expect, it } from 'vitest'

import { SERVICE_WORKER_CACHE_VERSION } from './runtimeInfo'

describe('runtimeInfo', () => {
  it('exposes the current service worker cache version', () => {
    expect(SERVICE_WORKER_CACHE_VERSION).toBe('v1-2026-05-02')
  })
})
