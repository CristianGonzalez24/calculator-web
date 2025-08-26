/**
 * Unit tests for utility functions
 * Tests mathematical operations, formatting, and validation functions
 */

import { describe, it, expect, vi } from 'vitest'
import {
    formatNumber,
    isSafeNumber,
    convertAngle,
    validateExpression,
    factorial,
    randomNumber,
    safeEval,
    copyToClipboard,
    storeData,
    getData,
    CONSTANTS,
    ANGLE_MODES,
    ERROR_MESSAGES
} from '../utils.js'


describe('formatNumber', () => {
    it('should format integers correctly', () => {
        expect(formatNumber(10)).toBe('10')
        expect(formatNumber(100)).toBe('100')
        expect(formatNumber(0)).toBe('0')
    })

    it('should format decimals correctly', () => {
        expect(formatNumber(10.5)).toBe('10.5')
        expect(formatNumber(3.14159, 2)).toBe('3.14')
        expect(formatNumber(10.00)).toBe('10')
    })

    it('should handle scientific notation for large numbers', () => {
        expect(formatNumber(1e16)).toMatch(/e\+/)
        expect(formatNumber(1e-7)).toMatch(/e-/)
    })

    it('should handle special values', () => {
        expect(formatNumber(Infinity)).toBe('∞')
        expect(formatNumber(-Infinity)).toBe('-∞')
        expect(formatNumber(NaN)).toBe('Math Error')
    })

    it('should preserve significant zeros in integers', () => {
        expect(formatNumber(10)).toBe('10')
        expect(formatNumber(1000)).toBe('1000')
        expect(formatNumber(1010)).toBe('1010')
    })
});

describe('isSafeNumber', () => {
    it('should identify safe numbers', () => {
        expect(isSafeNumber(42)).toBe(true)
        expect(isSafeNumber(-42)).toBe(true)
        expect(isSafeNumber(0)).toBe(true)
    })

    it('should identify unsafe numbers', () => {
        expect(isSafeNumber(Infinity)).toBe(false)
        expect(isSafeNumber(NaN)).toBe(false)
        expect(isSafeNumber(Number.MAX_SAFE_INTEGER + 1)).toBe(false)
    })
});

describe('convertAngle', () => {
    it('should convert degrees to radians', () => {
        expect(convertAngle(180, ANGLE_MODES.DEGREES, true)).toBeCloseToNumber(Math.PI)
        expect(convertAngle(90, ANGLE_MODES.DEGREES, true)).toBeCloseToNumber(Math.PI / 2)
        expect(convertAngle(45, ANGLE_MODES.DEGREES, true)).toBeCloseToNumber(Math.PI / 4)
    })

    it('should convert radians to degrees', () => {
        expect(convertAngle(Math.PI, ANGLE_MODES.DEGREES, false)).toBeCloseToNumber(180)
        expect(convertAngle(Math.PI / 2, ANGLE_MODES.DEGREES, false)).toBeCloseToNumber(90)
        expect(convertAngle(Math.PI / 4, ANGLE_MODES.DEGREES, false)).toBeCloseToNumber(45)
    })

    it('should handle gradians', () => {
        expect(convertAngle(200, ANGLE_MODES.GRADIANS, true)).toBeCloseToNumber(Math.PI)
        expect(convertAngle(Math.PI, ANGLE_MODES.GRADIANS, false)).toBeCloseToNumber(200)
    })

    it('should return unchanged for radians mode', () => {
        expect(convertAngle(1.5, ANGLE_MODES.RADIANS, true)).toBe(1.5)
        expect(convertAngle(1.5, ANGLE_MODES.RADIANS, false)).toBe(1.5)
    })
});

describe('validateExpression', () => {
    it('should validate correct expressions', () => {
        expect(validateExpression('5+5')).toBe(true)
        expect(validateExpression('(2+3)*4')).toBe(true)
        expect(validateExpression('10.5-3.2')).toBe(true)
    })

    it('should reject invalid expressions', () => {
        expect(validateExpression('5++')).toBe(false)
        expect(validateExpression('((2+3)')).toBe(false)
        expect(validateExpression('×5')).toBe(false)
        expect(validateExpression('5÷')).toBe(false)
    })

    it('should handle parentheses validation', () => {
        expect(validateExpression('((()))')).toBe(true)
        expect(validateExpression('((())')).toBe(false)
        expect(validateExpression('())((')).toBe(false)
    })
});

describe('factorial', () => {
    it('should calculate factorials correctly', () => {
        expect(factorial(0)).toBe(1)
        expect(factorial(1)).toBe(1)
        expect(factorial(5)).toBe(120)
        expect(factorial(10)).toBe(3628800)
    })

    it('should throw error for invalid inputs', () => {
        expect(() => factorial(-1)).toThrow(ERROR_MESSAGES.INVALID_INPUT)
        expect(() => factorial(3.5)).toThrow(ERROR_MESSAGES.INVALID_INPUT)
        expect(() => factorial(171)).toThrow(ERROR_MESSAGES.OVERFLOW_ERROR)
    })
});

describe('randomNumber', () => {
    it('should generate numbers within range', () => {
        const random = randomNumber(0, 1)
        expect(random).toBeGreaterThanOrEqual(0)
        expect(random).toBeLessThanOrEqual(1)
    })

    it('should handle custom ranges', () => {
        const random = randomNumber(10, 20)
        expect(random).toBeGreaterThanOrEqual(10)
        expect(random).toBeLessThanOrEqual(20)
    })
});

describe('safeEval', () => {
    it('should evaluate simple expressions', () => {
        expect(safeEval('5+5')).toBe(10)
        expect(safeEval('10*2')).toBe(20)
        expect(safeEval('15/3')).toBe(5)
    })

    it('should handle complex expressions', () => {
        expect(safeEval('(2+3)*4')).toBe(20)
        expect(safeEval('2+3*4')).toBe(14)
        expect(safeEval('2*(3+4)')).toBe(14)
    })

    it('should throw error for invalid expressions', () => {
        expect(() => safeEval('alert("hack")')).toThrow(ERROR_MESSAGES.INVALID_INPUT)
        expect(() => safeEval('5/0')).toThrow()
    })
});

describe('copyToClipboard', () => {
    it('should copy text successfully', async () => {
        const result = await copyToClipboard('test text')
        expect(result).toBe(true)
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
    })

    it('should handle clipboard errors gracefully', async () => {
        navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard error'))
        const result = await copyToClipboard('test')
        expect(result).toBe(false)
    })
});

describe('localStorage functions', () => {
    it('should store and retrieve data', () => {
        const testData = { value: 42, active: true }
        
        expect(storeData('test', testData)).toBe(true)
        expect(localStorage.setItem).toHaveBeenCalledWith('test', JSON.stringify(testData))
        
        localStorage.getItem.mockReturnValue(JSON.stringify(testData))
        expect(getData('test')).toEqual(testData)
    })

    it('should handle storage errors', () => {
        localStorage.setItem.mockImplementation(() => {
            throw new Error('Storage full')
        })
        
        expect(storeData('test', {})).toBe(false)
    })

    it('should return default value when key not found', () => {
        localStorage.getItem.mockReturnValue(null)
        expect(getData('nonexistent', 'default')).toBe('default')
    })
});

describe('Constants', () => {
    it('should have correct mathematical constants', () => {
        expect(CONSTANTS.PI).toBe(Math.PI)
        expect(CONSTANTS.E).toBe(Math.E)
        expect(CONSTANTS.GOLDEN_RATIO).toBeCloseToNumber(1.618, 3)
    })
})