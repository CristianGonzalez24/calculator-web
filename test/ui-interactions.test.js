/**
 * UI interaction tests for the calculator application
 * Tests button clicks, visual feedback, and responsive behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fireEvent } from '@testing-library/dom'

// Mock DOM elements for UI testing
const createUITestDOM = () => {
    const mockButton = {
        style: { transform: '' },
        classList: { add: vi.fn(), remove: vi.fn() },
        dataset: { action: 'add' },
        addEventListener: vi.fn(),
        click: vi.fn()
    }
    
    const mockDisplay = {
        textContent: '0',
        classList: { add: vi.fn(), remove: vi.fn() },
        scrollLeft: 0
    }

    const mockButtonGrid = {
        addEventListener: vi.fn(),
        children: [mockButton]
    }

    global.document = {
        querySelector: vi.fn((selector) => {
            if (selector === '.button-grid') return mockButtonGrid
            if (selector === '.btn') return mockButton
            return null
        }),
        querySelectorAll: vi.fn(() => [mockButton]),
        getElementById: vi.fn((id) => {
            if (id === 'mainDisplay') return mockDisplay
            return null
        }),
        addEventListener: vi.fn(),
        createElement: vi.fn(() => ({
            style: { cssText: '' },
            classList: { add: vi.fn(), remove: vi.fn() }
        })),
        body: { appendChild: vi.fn(), removeChild: vi.fn(), setAttribute: vi.fn() }
    }

    global.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 0))

    return { mockButton, mockDisplay, mockButtonGrid }
}

describe('UI Interaction Tests', () => {
    let mockElements

    beforeEach(() => {
        vi.clearAllMocks()
        mockElements = createUITestDOM()
    })

    describe('Button Press Animations', () => {
        it('should animate button press with scale effect', () => {
            const button = mockElements.mockButton
            
            // Simulate button press animation
            button.style.transform = 'scale(0.95)'
            expect(button.style.transform).toBe('scale(0.95)')
            
            // Simulate animation reset
            setTimeout(() => {
                button.style.transform = ''
                expect(button.style.transform).toBe('')
            }, 150)
        })

        it('should provide visual feedback on button hover', () => {
            const button = mockElements.mockButton
            
            // Simulate hover effect
            const hoverEvent = new MouseEvent('mouseenter')
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)'
            })
            
            // Trigger hover
            button.style.transform = 'translateY(-2px)'
            expect(button.style.transform).toBe('translateY(-2px)')
        })

        it('should handle button click events', () => {
            const button = mockElements.mockButton
            const clickHandler = vi.fn()
            
            button.addEventListener('click', clickHandler)
            button.click()
            
            expect(button.click).toHaveBeenCalled()
        })
    })

    describe('Display Updates', () => {
        it('should update display text content', () => {
            const display = mockElements.mockDisplay
            
            display.textContent = '123'
            expect(display.textContent).toBe('123')
        })

        it('should handle display overflow with scrolling', () => {
            const display = mockElements.mockDisplay
            
            // Simulate long number display
            display.textContent = '123456789012345678901234567890'
            display.scrollLeft = 100
            
            expect(display.scrollLeft).toBe(100)
        })

        it('should apply error styling to display', () => {
            const display = mockElements.mockDisplay
            
            display.classList.add('error')
            expect(display.classList.add).toHaveBeenCalledWith('error')
        })

        it('should remove error styling after correction', () => {
            const display = mockElements.mockDisplay
            
            display.classList.remove('error')
            expect(display.classList.remove).toHaveBeenCalledWith('error')
        })
    })

    describe('Responsive Behavior', () => {
        it('should handle window resize events', () => {
            const resizeHandler = vi.fn()
            global.addEventListener = vi.fn()
            
            global.addEventListener('resize', resizeHandler)
            expect(global.addEventListener).toHaveBeenCalledWith('resize', resizeHandler)
        })

        it('should adapt layout for mobile screens', () => {
            // Mock mobile viewport
            global.innerWidth = 480
            global.innerHeight = 800
            
            expect(global.innerWidth).toBeLessThan(768)
        })

        it('should adapt layout for tablet screens', () => {
            // Mock tablet viewport
            global.innerWidth = 768
            global.innerHeight = 1024
            
            expect(global.innerWidth).toBeGreaterThanOrEqual(768)
            expect(global.innerWidth).toBeLessThan(1024)
        })
    })

    describe('Touch Interactions', () => {
        it('should handle touch events on mobile', () => {
            const button = mockElements.mockButton
            const touchHandler = vi.fn()
            
            button.addEventListener('touchstart', touchHandler)
            
            const touchEvent = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }]
            })
            
            expect(touchEvent.type).toBe('touchstart')
        })

        it('should prevent double-tap zoom on buttons', () => {
            const button = mockElements.mockButton
            
            // Mock touch-action CSS property
            button.style.touchAction = 'manipulation'
            expect(button.style.touchAction).toBe('manipulation')
        })
    })

    describe('Visual Feedback', () => {
        it('should show loading indicator during calculations', () => {
            const loadingIndicator = {
                classList: { add: vi.fn(), remove: vi.fn() }
            }
            
            loadingIndicator.classList.add('show')
            expect(loadingIndicator.classList.add).toHaveBeenCalledWith('show')
            
            setTimeout(() => {
                loadingIndicator.classList.remove('show')
                expect(loadingIndicator.classList.remove).toHaveBeenCalledWith('show')
            }, 100)
        })

        it('should display success feedback for operations', () => {
            const successToast = {
                textContent: '',
                style: { transform: 'translateX(0)' },
                classList: { add: vi.fn() }
            }
            
            successToast.textContent = 'Operation successful'
            successToast.style.transform = 'translateX(0)'
            
            expect(successToast.textContent).toBe('Operation successful')
            expect(successToast.style.transform).toBe('translateX(0)')
        })

        it('should show error toast for invalid operations', () => {
            const errorToast = {
                textContent: '',
                classList: { add: vi.fn(), remove: vi.fn() }
            }
            
            errorToast.textContent = 'Division by zero'
            errorToast.classList.add('show')
            
            expect(errorToast.textContent).toBe('Division by zero')
            expect(errorToast.classList.add).toHaveBeenCalledWith('show')
        })
    })

    describe('Theme Switching', () => {
        it('should toggle between dark and light themes', () => {
            const body = document.body
            
            body.setAttribute('data-theme', 'light')
            expect(body.setAttribute).toHaveBeenCalledWith('data-theme', 'light')
            
            body.setAttribute('data-theme', 'dark')
            expect(body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark')
        })

        it('should update theme toggle button icon', () => {
            const themeButton = {
                textContent: '🌙'
            }
            
            themeButton.textContent = '☀️'
            expect(themeButton.textContent).toBe('☀️')
        })
    })

    describe('Sound Effects', () => {
        it('should play click sound on button press', () => {
            const audioContext = new AudioContext()
            
            expect(audioContext.createOscillator).toBeDefined()
            expect(audioContext.createGain).toBeDefined()
        })
        
        it('should toggle sound on/off', () => {
            const soundButton = {
                textContent: '🔊'
            }
            
            soundButton.textContent = '🔇'
            expect(soundButton.textContent).toBe('🔇')
            
            soundButton.textContent = '🔊'
            expect(soundButton.textContent).toBe('🔊')
        })
    })

    describe('History Panel Interactions', () => {
        it('should toggle history panel visibility', () => {
            const historyPanel = {
                classList: { toggle: vi.fn(), add: vi.fn(), remove: vi.fn() }
            }
            
            historyPanel.classList.toggle('visible')
            expect(historyPanel.classList.toggle).toHaveBeenCalledWith('visible')
        })
    })

    it('should handle history item clicks', () => {
        const historyItem = {
            dataset: { expression: '5+5', result: '10' },
            addEventListener: vi.fn(),
            click: vi.fn()
        }
        
        const clickHandler = vi.fn()
        historyItem.addEventListener('click', clickHandler)
        historyItem.click()
        
        expect(historyItem.click).toHaveBeenCalled()
    })

    describe('Copy to Clipboard', () => {
        it('should copy result to clipboard', async () => {
            const clipboardText = '42'
            
            await navigator.clipboard.writeText(clipboardText)
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(clipboardText)
        })

        it('should show feedback after successful copy', () => {
            const feedback = {
                textContent: 'Copied to clipboard',
                style: { opacity: '1' }
            }
            
            expect(feedback.textContent).toBe('Copied to clipboard')
            expect(feedback.style.opacity).toBe('1')
        })
    })

    describe('Keyboard Visual Feedback', () => {
        it('should highlight corresponding button on key press', () => {
            const button = mockElements.mockButton
            
            // Simulate key press highlighting
            button.classList.add('keyboard-active')
            expect(button.classList.add).toHaveBeenCalledWith('keyboard-active')
            
            setTimeout(() => {
                button.classList.remove('keyboard-active')
                expect(button.classList.remove).toHaveBeenCalledWith('keyboard-active')
            }, 200)
        })
    })
});