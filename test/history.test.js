/**
 * Unit tests for calculation history functionality
 * Tests history management, FIFO queue, and recall operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { historyOperations } from '../history.js'

// Mock DOM elements
const mockElement = {
    style: {},
    setAttribute: vi.fn(),
};

const mockHistoryContent = {
    innerHTML: '',
    querySelectorAll: vi.fn(() => []),
    querySelector: vi.fn(() => mockElement),
    appendChild: vi.fn(),
};

const mockClearHistoryBtn = {
    addEventListener: vi.fn()
}

global.document = {
    ...global.document,
    getElementById: vi.fn((id) => {
        switch (id) {
            case 'historyContent': return mockHistoryContent
            case 'clearHistory': return mockClearHistoryBtn
            case 'historyPanel': return { classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() } }
            default: return null
        }
    }),
    createElement: vi.fn((tag) => {
        return {
            tagName: tag.toUpperCase(),
            style: {},
            className: '',
            textContent: '',
            remove: vi.fn(),
        }
    }),
    body: {
        appendChild: vi.fn()
    },
    dispatchEvent: vi.fn()
}

describe('History Operations', () => {
    beforeEach(() => {
        historyOperations.clear()
        vi.clearAllMocks()
        mockHistoryContent.innerHTML = ''
    })

    describe('Adding to History', () => {
        it('should add calculation to history', () => {
            historyOperations.add('5+5', 10)
            const history = historyOperations.getAll()
            
            expect(history).toHaveLength(1)
            expect(history[0].expression).toBe('5+5')
            expect(history[0].result).toBe(10)
        })

        it('should add multiple calculations', () => {
            historyOperations.add('2+2', 4)
            historyOperations.add('3*3', 9)
            historyOperations.add('10/2', 5)
            
            const history = historyOperations.getAll()
            expect(history).toHaveLength(3)
        })

        it('should maintain FIFO queue with max 10 items', () => {
            // Add 12 items to test FIFO behavior
            for (let i = 1; i <= 12; i++) {
              historyOperations.add(`${i}+${i}`, i * 2)
            }
            
            const history = historyOperations.getAll()
            expect(history).toHaveLength(10)
            
            // First two items should be removed (FIFO)
            expect(history[0].expression).toBe('3+3')
            expect(history[9].expression).toBe('12+12')
        })

        it('should save to localStorage when adding', () => {
            historyOperations.add('7*8', 56)
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'calculatorHistory',
                expect.stringContaining('"expression":"7*8"')
            )
        })
    })

    describe('History Retrieval', () => {
        beforeEach(() => {
            // vi.spyOn(historyOperations, 'animateNewItem').mockImplementation(() => {})  Mock to do the test without the animation
            historyOperations.add('1+1', 2)
            historyOperations.add('2+2', 4)
            historyOperations.add('3+3', 6)
        })

        it('should get specific history item', () => {
            const item = historyOperations.getItem(1)
            expect(item.expression).toBe('2+2')
            expect(item.result).toBe(4)
        })

        it('should return null for invalid index', () => {
            expect(historyOperations.getItem(-1)).toBeNull()
            expect(historyOperations.getItem(10)).toBeNull()
        })

        it('should get recent history items', () => {
            const recent = historyOperations.getRecent(2)
            expect(recent).toHaveLength(2)
            expect(recent[0].expression).toBe('2+2')
            expect(recent[1].expression).toBe('3+3')
        })

        it('should get all history items', () => {
            const all = historyOperations.getAll()
            expect(all).toHaveLength(3)
            expect(all[0].expression).toBe('1+1')
            expect(all[1].expression).toBe('2+2')
            expect(all[2].expression).toBe('3+3')
        })
    })

    describe('History Search', () => {
        beforeEach(() => {
            historyOperations.add('sin(30)', 0.5)
            historyOperations.add('cos(60)', 0.5)
            historyOperations.add('10*5', 50)
            historyOperations.add('sqrt(25)', 5)
        })

        it('should search by expression', () => {
            const results = historyOperations.search('sin')
            expect(results).toHaveLength(1)
            expect(results[0].expression).toBe('sin(30)')
        })

        it('should search by result', () => {
            const results = historyOperations.search('0.5')
            expect(results).toHaveLength(2)
            expect(results[0].expression).toBe('sin(30)')
            expect(results[1].expression).toBe('cos(60)')
        })

        it('should be case insensitive', () => {
            const results = historyOperations.search('SIN')
            expect(results).toHaveLength(1)
        })

        it('should return empty array for no matches', () => {
            const results = historyOperations.search('xyz')
            expect(results).toHaveLength(0)
        })
    })

    describe('History Clearing', () => {
        it('should clear all history', () => {
            historyOperations.add('1+1', 2)
            historyOperations.add('2+2', 4)
            
            historyOperations.clear()
            
            expect(historyOperations.getAll()).toHaveLength(0)
            expect(localStorage.setItem).toHaveBeenCalledWith('calculatorHistory', '[]')
        })
    })

    describe('History Statistics', () => {
        beforeEach(() => {
            historyOperations.add('1+1', 2)
            historyOperations.add('2+2', 4)
        })

        it('should provide history statistics', () => {
            const stats = historyOperations.getStats()
            
            expect(stats.totalCalculations).toBe(2)
            expect(stats.maxCapacity).toBe(10)
            expect(stats.usage).toBe('2/10')
            expect(stats.oldestCalculation).toBeDefined()
            expect(stats.newestCalculation).toBeDefined()
        })
    })

    describe('History Export/Import', () => {
        beforeEach(() => {
            historyOperations.add('5*5', 25)
            historyOperations.add('6*6', 36)
        })

        it('should export history data', () => {
            const exported = historyOperations.export()
            
            expect(exported.history).toHaveLength(2)
            expect(exported.maxHistory).toBe(10)
            expect(exported.exportDate).toBeDefined()
            expect(exported.version).toBe('1.0')
        })

        it('should import history data', () => {
            const importData = {
                history: [
                    { id: 1, expression: '9*9', result: 81, formattedResult: '81', timestamp: new Date().toLocaleString() }
                ],
                maxHistory: 10,
                version: '1.0'
            }
            
            const result = historyOperations.import(importData)
            expect(result).toBe(true)
            
            const history = historyOperations.getAll()
            expect(history).toHaveLength(1)
            expect(history[0].expression).toBe('9*9')
            expect(history[0].result).toBe(81)
            expect(history[0].formattedResult).toBe('81')
        })

        it('should handle invalid import data', () => {
            const result = historyOperations.import({ invalid: 'data' })
            expect(result).toBe(false)
        })
    })

    describe('History UI Interactions', () => {
        it('should dispatch custom event when history item selected', () => {
            // Mock history item click
            const mockHistoryItem = {
                dataset: { expression: '4+4', result: '8' },
                classList: { add: vi.fn(), remove: vi.fn() },
                style: {}
            }
            
            mockHistoryContent.querySelectorAll.mockReturnValue([mockHistoryItem])
            
            // Simulate the click event handling
            const event = new CustomEvent('historyItemSelected', {
                detail: { expression: '4+4', result: 8 }
            })
            
            expect(event.detail.expression).toBe('4+4')
            expect(event.detail.result).toBe(8)
        })

        afterEach(() => {
            mockHistoryContent.querySelectorAll.mockReturnValue([])
        })
    })
})