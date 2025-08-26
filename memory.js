/**
 * Memory Management System for Scientific Calculator
 * @fileoverview Handles all memory operations (MS, MR, MC, M+, M-)
 */

import { formatNumber, ERROR_MESSAGES, storeData, getData } from './utils.js';

class MemoryManager {
    constructor() {
        this.memoryValue = 0;
        this.isMemoryActive = false;
        this.memoryIndicator = null;
        this.loadMemoryFromStorage();
        this.initializeUI();
    }

    // Initialize memory UI elements
    initializeUI() {
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.updateMemoryIndicator();
    }

    // Load memory from localStorage
    loadMemoryFromStorage() {
        const storedMemory = getData('calculatorMemory', { value: 0, active: false });
        this.memoryValue = storedMemory.value || 0;
        this.isMemoryActive = storedMemory.active || false;
    }

    // Save memory to localStorage
    saveMemoryToStorage() {
        storeData('calculatorMemory', {
            value: this.memoryValue,
            active: this.isMemoryActive
        });
    }

    // Update memory indicator in UI
    updateMemoryIndicator() {
        if (this.memoryIndicator) {
            if (this.isMemoryActive) {
                this.memoryIndicator.textContent = 'M';
                this.memoryIndicator.classList.add('active');
            } else {
                this.memoryIndicator.textContent = '';
                this.memoryIndicator.classList.remove('active');
            }
        }
    }

    /**
     * Memory Store - Save current value to memory
     * @param {number} value - Value to store in memory
     */
    memoryStore(value) {
        try {
            if (!isFinite(value)) {
                throw new Error(ERROR_MESSAGES.INVALID_INPUT);
            }

            this.memoryValue = value;
            this.isMemoryActive = true;
            this.updateMemoryIndicator();
            this.saveMemoryToStorage();
            
            this.showMemoryFeedback('Stored to memory');
        } catch (error) {
            throw new Error(ERROR_MESSAGES.MEMORY_ERROR);
        }
    }

    /**
     * Memory Recall - Retrieve value from memory
     * @returns {number} Value stored in memory
     */
    memoryRecall() {
        try {
            if (!this.isMemoryActive) {
                return 0;
            }
            
            this.showMemoryFeedback('Recalled from memory');
            return this.memoryValue;
        } catch (error) {
            throw new Error(ERROR_MESSAGES.MEMORY_ERROR);
        }
    }

    // Clear memory storage
    memoryClear() {
        try {
            this.memoryValue = 0;
            this.isMemoryActive = false;
            this.updateMemoryIndicator();
            this.saveMemoryToStorage();
            
            this.showMemoryFeedback('Memory cleared');
        } catch (error) {
            throw new Error(ERROR_MESSAGES.MEMORY_ERROR);
        }
    }

    /**
     * Memory Add - Add current value to memory
     * @param {number} value - Value to add to memory
     */
    memoryAdd(value) {
        try {
            if (!isFinite(value)) {
                throw new Error(ERROR_MESSAGES.INVALID_INPUT);
            }

            this.memoryValue += value;
            this.isMemoryActive = true;
            this.updateMemoryIndicator();
            this.saveMemoryToStorage();
            
            this.showMemoryFeedback(`Added ${formatNumber(value)} to memory`);
        } catch (error) {
            throw new Error(ERROR_MESSAGES.MEMORY_ERROR);
        }
    }

    /**
     * Memory Subtract - Subtract current value from memory
     * @param {number} value - Value to subtract from memory
     */
    memorySubtract(value) {
        try {
            if (!isFinite(value)) {
                throw new Error(ERROR_MESSAGES.INVALID_INPUT);
            }

            this.memoryValue -= value;
            this.isMemoryActive = true;
            this.updateMemoryIndicator();
            this.saveMemoryToStorage();
            
            this.showMemoryFeedback(`Subtracted ${formatNumber(value)} from memory`);
        } catch (error) {
            throw new Error(ERROR_MESSAGES.MEMORY_ERROR);
        }
    }

    /**
     * Get current memory value
     * @returns {number} Current memory value
     */
    getMemoryValue() {
        return this.memoryValue;
    }

    /**
     * Check if memory is active
     * @returns {boolean} True if memory contains a value
     */
    isMemorySet() {
        return this.isMemoryActive;
    }

    /**
     * Show memory operation feedback
     * @param {string} message - Feedback message
     */
    showMemoryFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'memory-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: absolute;
            top: 10px;
            right: 50px;
            background: var(--btn-memory);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.8rem;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;

        document.body.appendChild(feedback);

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    /**
     * Export memory state for backup
     * @returns {Object} Memory state object
     */
    exportMemory() {
        return {
            value: this.memoryValue,
            active: this.isMemoryActive,
            timestamp: Date.now()
        };
    }

    /**
     * Import memory state from backup
     * @param {Object} memoryState - Memory state to import
     */
    importMemory(memoryState) {
        try {
            if (memoryState && typeof memoryState.value === 'number') {
                this.memoryValue = memoryState.value;
                this.isMemoryActive = memoryState.active || false;
                this.updateMemoryIndicator();
                this.saveMemoryToStorage();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import memory:', error);
            return false;
        }
    }

    // Reset memory to default state
    reset() {
        this.memoryClear();
    }

    /**
     * Get memory statistics
     * @returns {Object} Memory usage statistics
     */
    getMemoryStats() {
        return {
            currentValue: this.memoryValue,
            isActive: this.isMemoryActive,
            formattedValue: formatNumber(this.memoryValue),
            lastModified: getData('calculatorMemory', {}).timestamp || null
        };
    }
}

// Create and export singleton instance
export const memoryManager = new MemoryManager();

// Export memory operations as individual functions for easier use
export const memoryOperations = {
    store: (value) => memoryManager.memoryStore(value),
    recall: () => memoryManager.memoryRecall(),
    clear: () => memoryManager.memoryClear(),
    add: (value) => memoryManager.memoryAdd(value),
    subtract: (value) => memoryManager.memorySubtract(value),
    getValue: () => memoryManager.getMemoryValue(),
    isSet: () => memoryManager.isMemorySet(),
    getStats: () => memoryManager.getMemoryStats(),
    export: () => memoryManager.exportMemory(),
    import: (state) => memoryManager.importMemory(state),
    reset: () => memoryManager.reset()
};

// Export class for advanced usage
export default MemoryManager;