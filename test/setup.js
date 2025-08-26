/**
 * Test setup file for Vitest
 * Configures global test environment and utilities
 */

import { beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock Web Audio API for sound tests
global.AudioContext = vi.fn(() => ({
    createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'sine',
        start: vi.fn(),
        stop: vi.fn()
    })),
    createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { 
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
        }
    })),
    destination: {},
    currentTime: 0
}));

global.webkitAudioContext = global.AudioContext;

// Mock clipboard API
global.navigator.clipboard = {
    writeText: vi.fn(() => Promise.resolve())
}

// Reset all mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
})

// Add custom matchers
expect.extend({
    toBeCloseToNumber(received, expected, precision = 10) {
        const pass = Math.abs(received - expected) < Math.pow(10, -precision)
        return {
            message: () => `expected ${received} to be close to ${expected} within ${precision} decimal places`,
            pass
        }
    }
})