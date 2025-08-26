/**
 * Integration tests for the main calculator functionality
 * Tests user interactions, calculations, and UI updates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock DOM structure
const createMockDOM = () => {
    const mockDisplay = { textContent: '0', classList: { add: vi.fn(), remove: vi.fn() } }
    const mockExpression = { textContent: '' }
    const mockMemoryIndicator = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } }
    const mockHistoryContent = { innerHTML: '', querySelectorAll: vi.fn(() => []) }
    const mockButtonGrid = { addEventListener: vi.fn() }
    const mockErrorToast = { textContent: '', classList: { add: vi.fn(), remove: vi.fn() } }
    const mockLoadingIndicator = { classList: { add: vi.fn(), remove: vi.fn() } }

    global.document = {
        getElementById: vi.fn((id) => {
            const elements = {
                'mainDisplay': mockDisplay,
                'expressionDisplay': mockExpression,
                'memoryIndicator': mockMemoryIndicator,
                'historyContent': mockHistoryContent,
                'errorToast': mockErrorToast,
                'loadingIndicator': mockLoadingIndicator,
                'angleMode': { textContent: 'DEG', addEventListener: vi.fn() },
                'soundToggle': { textContent: '🔊', addEventListener: vi.fn() },
                'themeToggle': { textContent: '🌙', addEventListener: vi.fn() },
                'clearHistory': { addEventListener: vi.fn() }
            }
            return elements[id] || null
        }),
        querySelector: vi.fn((selector) => {
            if (selector === '.button-grid') return mockButtonGrid
            return null
        }),
        addEventListener: vi.fn(),
        body: { 
            setAttribute: vi.fn(),
            appendChild: vi.fn(),
            removeChild: vi.fn()
        },
        createElement: vi.fn(() => ({
            className: '',
            textContent: '',
            style: { cssText: '' },
            classList: { add: vi.fn(), remove: vi.fn() }
        })),
        dispatchEvent: vi.fn()
    }

    return {
        mockDisplay,
        mockExpression,
        mockMemoryIndicator,
        mockHistoryContent,
        mockButtonGrid,
        mockErrorToast,
        mockLoadingIndicator
    }
}

// Import calculator after DOM setup
let ScientificCalculator
let calculator

describe('Scientific Calculator Integration Tests', () => {
    let mockElements

    beforeEach(async () => {
        vi.useFakeTimers()
        vi.clearAllMocks()
        mockElements = createMockDOM()
        
        // Dynamic import to ensure fresh instance
        const module = await import('../main.js')
        ScientificCalculator = module.default
        
        calculator = new ScientificCalculator()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('Basic Arithmetic Operations', () => {
        it('should perform addition correctly', () => {
            calculator.inputNumber('5')
            calculator.inputOperator('+')
            calculator.inputNumber('3')
            calculator.calculate()

            vi.advanceTimersByTime(100)  // setTimeout of calculate()          
            expect(mockElements.mockDisplay.textContent).toBe('8')
        })

        it('should perform subtraction correctly', () => {
            calculator.inputNumber('10')
            calculator.inputOperator('-')
            calculator.inputNumber('4')
            calculator.calculate()

            vi.advanceTimersByTime(100)         
            expect(mockElements.mockDisplay.textContent).toBe('6')
        })

        it('should perform multiplication correctly', () => {
            calculator.inputNumber('7')
            calculator.inputOperator('×')
            calculator.inputNumber('8')
            calculator.calculate()

            vi.advanceTimersByTime(100)          
            expect(mockElements.mockDisplay.textContent).toBe('56')
        })
        
        it('should perform division correctly', () => {
            calculator.inputNumber('15')
            calculator.inputOperator('÷')
            calculator.inputNumber('3')
            calculator.calculate()
            
            vi.advanceTimersByTime(100)
            expect(mockElements.mockDisplay.textContent).toBe('5')
        })
        
        it('should handle decimal operations', () => {
            calculator.inputNumber('2')
            calculator.inputNumber('.')
            calculator.inputNumber('5')
            calculator.inputOperator('+')
            calculator.inputNumber('1')
            calculator.inputNumber('.')
            calculator.inputNumber('5')
            calculator.calculate()
            
            vi.advanceTimersByTime(100)
            expect(mockElements.mockDisplay.textContent).toBe('4')
        })
    })

    describe('Advanced Mathematical Functions', () => {
        it('should calculate square root', () => {
            calculator.inputNumber('25')
            calculator.calculateRoot('sqrt')
            
            expect(mockElements.mockDisplay.textContent).toBe('5')
        })

        it('should calculate power operations', () => {
            calculator.inputNumber('2')
            calculator.calculatePower(3)
            
            expect(mockElements.mockDisplay.textContent).toBe('8')
        })

        it('should calculate factorial', () => {
            calculator.inputNumber('5')
            calculator.calculateFactorial()
            
            expect(mockElements.mockDisplay.textContent).toBe('120')
        })

        it('should calculate trigonometric functions', () => {
            calculator.inputNumber('90')
            calculator.calculateTrigFunction('sin')
            
            // sin(90°) should be 1
            expect(parseFloat(mockElements.mockDisplay.textContent)).toBeCloseToNumber(1, 10)
        })

        it('should calculate logarithms', () => {
            calculator.inputNumber('10')
            calculator.calculateLogarithm('log10')
            
            expect(mockElements.mockDisplay.textContent).toBe('1')
        })
    })

    describe('Error Handling', () => {
        it('should handle division by zero', () => {
            calculator.inputNumber('5')
            calculator.inputOperator('÷')
            calculator.inputNumber('0')
            calculator.calculate()
            
            vi.advanceTimersByTime(100)

            expect(mockElements.mockDisplay.textContent).toBe('Math Error')
            expect(mockElements.mockDisplay.classList.add).toHaveBeenCalledWith('error')

            expect(mockElements.mockErrorToast.textContent).toBe('Math Error');
            expect(mockElements.mockErrorToast.classList.add).toHaveBeenCalledWith('show')
        })

        it('should handle invalid factorial input', () => {
            calculator.inputNumber('-5')
            expect(() => calculator.calculateFactorial()).toThrow()
        })

        it('should handle domain errors for square root', () => {
            calculator.inputNumber('-4')
            expect(() => calculator.calculateRoot('sqrt')).toThrow()
        })

        it('should handle trigonometric domain errors', () => {
            calculator.inputNumber('2')
            expect(() => calculator.calculateInverseTrigFunction('asin')).toThrow()
        })
    })

    describe('Memory Operations', () => {
        it('should store and recall memory', () => {
            calculator.inputNumber('42')
            calculator.handleSpecialAction('ms')
            
            calculator.clearAll()
            calculator.handleSpecialAction('mr')
            
            expect(mockElements.mockDisplay.textContent).toBe('42')
        })

        it('should add to memory', () => {
            calculator.inputNumber('10')
            calculator.handleSpecialAction('ms')
            
            calculator.inputNumber('5')
            calculator.handleSpecialAction('m-add')
            
            calculator.handleSpecialAction('mr')
            expect(mockElements.mockDisplay.textContent).toBe('15')
        })

        it('should clear memory', () => {
            calculator.inputNumber('100')
            calculator.handleSpecialAction('ms')
            calculator.handleSpecialAction('mc')
            
            calculator.handleSpecialAction('mr')
            expect(mockElements.mockDisplay.textContent).toBe('0')
        })
    })

    describe('Input Validation', () => {
        it('should prevent multiple decimal points', () => {
            calculator.inputNumber('3')
            calculator.inputNumber('.')
            calculator.inputNumber('1')
            calculator.inputNumber('.') // Should be ignored
            calculator.inputNumber('4')
            
            expect(mockElements.mockDisplay.textContent).toBe('3.14')
        })

        it('should handle leading zeros correctly', () => {
            calculator.inputNumber('0')
            calculator.inputNumber('5')
            
            expect(mockElements.mockDisplay.textContent).toBe('5')
        })
    })

    describe('Clear Operations', () => {
        it('should clear all with C button', () => {
            calculator.inputNumber('123')
            calculator.inputOperator('+')
            calculator.inputNumber('456')
            
            calculator.clearAll()
            
            expect(mockElements.mockDisplay.textContent).toBe('0')
            expect(calculator.expression).toBe('')
        })

        it('should clear entry with CE button', () => {
            calculator.inputNumber('123')
            calculator.clearEntry()
            
            expect(mockElements.mockDisplay.textContent).toBe('0')
        })

        it('should handle backspace', () => {
            calculator.inputNumber('1')
            calculator.inputNumber('2')
            calculator.inputNumber('3')
            calculator.backspace()
            
            expect(mockElements.mockDisplay.textContent).toBe('12')
        })
    })

    describe('Keyboard Input', () => {
        it('should handle number key presses', () => {
            const event = new KeyboardEvent('keydown', { key: '5' })
            calculator.handleKeyboardInput(event)
            
            expect(mockElements.mockDisplay.textContent).toBe('5')
        })

        it('should handle operator key presses', () => {
            calculator.inputNumber('3')
            
            const event = new KeyboardEvent('keydown', { key: '+' })
            calculator.handleKeyboardInput(event)
            
            expect(calculator.expression).toContain('3 +')
        })

        it('should handle Enter key for calculation', () => {
            calculator.inputNumber('2')
            calculator.inputOperator('+')
            calculator.inputNumber('2')
            
            const event = new KeyboardEvent('keydown', { key: 'Enter' })
            calculator.handleKeyboardInput(event)

            vi.advanceTimersByTime(100)
            
            expect(mockElements.mockDisplay.textContent).toBe('4')
        })

        it('should handle Escape key for clear', () => {
            calculator.inputNumber('123')
            
            const event = new KeyboardEvent('keydown', { key: 'Escape' })
            calculator.handleKeyboardInput(event)
            
            expect(mockElements.mockDisplay.textContent).toBe('0')
        })
    })

    describe('Complex Expressions', () => {
        it('should handle parentheses correctly', () => {
            // (2+3)*4 = 20
            calculator.inputOperator('(')
            calculator.inputNumber('2')
            calculator.inputOperator('+')
            calculator.inputNumber('3')
            calculator.inputOperator(')')
            calculator.inputOperator('×')
            calculator.inputNumber('4')
            calculator.calculate()

            vi.advanceTimersByTime(100)
            
            expect(mockElements.mockDisplay.textContent).toBe('20')
        })

        it('should handle operator precedence', () => {
            // 2+3*4 = 14
            calculator.inputNumber('2')
            calculator.inputOperator('+')
            calculator.inputNumber('3')
            calculator.inputOperator('×')
            calculator.inputNumber('4')
            calculator.calculate()

            vi.advanceTimersByTime(100)
            
            expect(mockElements.mockDisplay.textContent).toBe('14')
        })
    })

    describe('Angle Mode Operations', () => {
        it('should toggle angle modes', () => {
            expect(calculator.angleMode).toBe('DEG')
            
            calculator.toggleAngleMode()
            expect(calculator.angleMode).toBe('RAD')
            
            calculator.toggleAngleMode()
            expect(calculator.angleMode).toBe('GRAD')
            
            calculator.toggleAngleMode()
            expect(calculator.angleMode).toBe('DEG')
        })

        it('should calculate trigonometric functions in different modes', () => {
            // sin(π/2) in radians = 1
            calculator.angleMode = 'RAD'
            calculator.inputConstant(Math.PI / 2)
            calculator.calculateTrigFunction('sin')
            
            expect(parseFloat(mockElements.mockDisplay.textContent)).toBeCloseToNumber(1, 10)
        })
    })

    describe('Settings and Persistence', () => {
        it('should save settings to localStorage', () => {
            calculator.toggleSound()
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'calculatorSettings',
                expect.stringContaining('"soundEnabled"')
            )
        })

        it('should toggle theme', () => {
            calculator.toggleTheme()
            expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light')
        })
    })

    describe('State Export/Import', () => {
        it('should export calculator state', () => {
            calculator.inputNumber('42')
            calculator.angleMode = 'RAD'
            
            const state = calculator.exportState()
            
            expect(state.currentInput).toBe('42')
            expect(state.angleMode).toBe('RAD')
            expect(state.settings).toBeDefined()
        })

        it('should import calculator state', () => {
            const state = {
                currentInput: '99',
                angleMode: 'GRAD',
                settings: { soundEnabled: false, theme: 'light' }
            }
            
            calculator.importState(state)
            
            expect(calculator.currentInput).toBe('99')
            expect(calculator.angleMode).toBe('GRAD')
            expect(calculator.soundEnabled).toBe(false)
        })
    })
});