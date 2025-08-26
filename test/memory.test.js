/**
 * Unit tests for memory management functionality
 * Tests memory operations: store, recall, clear, add, subtract
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

let memoryOperations
let mockMemoryIndicator

beforeEach(async () => {
    vi.resetModules()  // Reset modules before each test

    // Mock DOM elements
    mockMemoryIndicator = {
        textContent: '',
        classList: {
            add: vi.fn(),
            remove: vi.fn()
        }
    }

    // Mock document.getElementById
    global.document = {
        getElementById: vi.fn((id) => {
            if (id === 'memoryIndicator') return mockMemoryIndicator
            return null
        }),
        createElement: vi.fn(() => ({
            style: { cssText: '' },
            classList: { add: vi.fn(), remove: vi.fn() },
            addEventListener: vi.fn()
        })),
        body: {
            appendChild: vi.fn(),
            removeChild: vi.fn()
        }
    }

    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0))

    const mod = await import('../memory.js')
    memoryOperations = mod.memoryOperations
})

describe('Memory Operations', () => {
    beforeEach(() => {
        // Reset memory state
        memoryOperations.clear()
        vi.clearAllMocks()
    })

    describe('Memory Store (MS)', () => {
        it('should store a value in memory', () => {
            memoryOperations.store(42)
            expect(memoryOperations.getValue()).toBe(42)
            expect(memoryOperations.isSet()).toBe(true)
        })

        it('should update memory indicator when storing', () => {
            memoryOperations.store(100)
            expect(mockMemoryIndicator.textContent).toBe('M')
            expect(mockMemoryIndicator.classList.add).toHaveBeenCalledWith('active')
        })

        it('should throw error for invalid values', () => {
            expect(() => memoryOperations.store(Infinity)).toThrow()
            expect(() => memoryOperations.store(NaN)).toThrow()
        })
    })

    describe('Memory Recall (MR)', () => {
        it('should recall stored value', () => {
            memoryOperations.store(75)
            expect(memoryOperations.recall()).toBe(75)
        })

        it('should return 0 when memory is empty', () => {
            expect(memoryOperations.recall()).toBe(0)
            expect(memoryOperations.isSet()).toBe(false)
        })
    })

    describe('Memory Clear (MC)', () => {
        it('should clear memory', () => {
            memoryOperations.store(50)
            memoryOperations.clear()
            
            expect(memoryOperations.getValue()).toBe(0)
            expect(memoryOperations.isSet()).toBe(false)
        })

        it('should update memory indicator when clearing', () => {
            memoryOperations.store(25)
            memoryOperations.clear()
            
            expect(mockMemoryIndicator.textContent).toBe('')
            expect(mockMemoryIndicator.classList.remove).toHaveBeenCalledWith('active')
        })
    })

    describe('Memory Add (M+)', () => {
        it('should add value to memory', () => {
            memoryOperations.store(10)
            memoryOperations.add(5)
            expect(memoryOperations.getValue()).toBe(15)
        })

        it('should activate memory when adding to empty memory', () => {
            memoryOperations.add(20)
            expect(memoryOperations.getValue()).toBe(20)
            expect(memoryOperations.isSet()).toBe(true)
        })

        it('should handle negative additions', () => {
            memoryOperations.store(10)
            memoryOperations.add(-3)
            expect(memoryOperations.getValue()).toBe(7)
        })
    })

    describe('Memory Subtract (M-)', () => {
        it('should subtract value from memory', () => {
            memoryOperations.store(20)
            memoryOperations.subtract(8)
            expect(memoryOperations.getValue()).toBe(12)
        })
    
        it('should activate memory when subtracting from empty memory', () => {
            memoryOperations.subtract(15)
            expect(memoryOperations.getValue()).toBe(-15)
            expect(memoryOperations.isSet()).toBe(true)
        })
    })

    describe('Memory Persistence', () => {
        it('should save memory state to localStorage', () => {
            memoryOperations.store(99)
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'calculatorMemory',
                JSON.stringify({ value: 99, active: true })
            )
        })

        it('should load memory state from localStorage', async () => {
            const mockMemoryData = { value: 88, active: true }
            localStorage.getItem.mockReturnValue(JSON.stringify(mockMemoryData))

            vi.resetModules()
            const mod = await import('../memory.js')
            memoryOperations = mod.memoryOperations

            expect(localStorage.getItem).toHaveBeenCalledWith('calculatorMemory')
            expect(memoryOperations.getValue()).toBe(88)
            expect(memoryOperations.isSet()).toBe(true)
        })
    })

    describe('Memory Statistics', () => {
        it('should provide memory statistics', () => {
            memoryOperations.store(123.45)
            const stats = memoryOperations.getStats()
            
            expect(stats.currentValue).toBe(123.45)
            expect(stats.isActive).toBe(true)
            expect(stats.formattedValue).toBe('123.45')
        })
    })

    describe('Memory Export/Import', () => {
        it('should export memory state', () => {
            memoryOperations.store(777)
            const exported = memoryOperations.export()
            
            expect(exported.value).toBe(777)
            expect(exported.active).toBe(true)
            expect(exported.timestamp).toBeDefined()
        })

        it('should import memory state', () => {
            const importData = { value: 555, active: true, timestamp: Date.now() }
            const result = memoryOperations.import(importData)
            
            expect(result).toBe(true)
            expect(memoryOperations.getValue()).toBe(555)
            expect(memoryOperations.isSet()).toBe(true)
        })

        it('should handle invalid import data', () => {
            const result = memoryOperations.import({ invalid: 'data' })
            expect(result).toBe(false)
        })
    })
});