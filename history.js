/**
 * Calculation History Management System
 * @fileoverview Manages calculation history with FIFO queue and persistent storage
 */

import { formatNumber, storeData, getData, deepClone } from './utils.js';

class HistoryManager {
    constructor(maxHistory = 10) {
        this.maxHistory = maxHistory;
        this.history = [];
        this.historyPanel = null;
        this.historyContent = null;
        this.clearHistoryBtn = null;
        this.loadHistoryFromStorage();
        this.initializeUI();
    }

    // Initialize history UI elements
    initializeUI() {
        this.historyPanel = document.getElementById('historyPanel');
        this.historyContent = document.getElementById('historyContent');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
        
        this.renderHistory();
    }

    // Load history from localStorage
    loadHistoryFromStorage() {
        this.history = getData('calculatorHistory', []);
        // Ensure we don't exceed max history from stored data
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(-this.maxHistory);
            this.saveHistoryToStorage();
        }
    }

    // Save history to localStorage
    saveHistoryToStorage() {
        storeData('calculatorHistory', this.history);
    }

    /**
     * Add calculation to history
     * @param {string} expression - The mathematical expression
     * @param {number} result - The calculation result
     */
    addToHistory(expression, result) {
        try {
            // Clean the expression to ensure it doesn't contain the result
            const cleanExpression = expression.trim();

            const historyItem = {
                id: Date.now(),
                expression: cleanExpression,
                result: result,
                formattedResult: formatNumber(result),
                timestamp: new Date().toLocaleString()
            };

            this.history.push(historyItem);

            // Maintain FIFO queue (First In, First Out)
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }

            this.saveHistoryToStorage();
            this.renderHistory();
            this.animateNewItem(historyItem.id);
        } catch (error) {
            console.error('Failed to add to history:', error);
        }
    }

    // Clear all history
    clearHistory() {
        this.history = [];
        this.saveHistoryToStorage();
        this.renderHistory();
        this.showHistoryFeedback('History cleared');
    }

    /**
     * Get specific history item
     * @param {number} index - Index of history item
     * @returns {Object|null} History item or null
     */
    getHistoryItem(index) {
        if (index >= 0 && index < this.history.length) {
            return deepClone(this.history[index]);
        }
        return null;
    }

    /**
     * Get all history items
     * @returns {Array} Array of history items
     */
    getAllHistory() {
        return deepClone(this.history);
    }

    /**
     * Get recent history items
     * @param {number} count - Number of recent items to get
     * @returns {Array} Recent history items
     */
    getRecentHistory(count = 5) {
        return deepClone(this.history.slice(-count));
    }

    /**
     * Search history by expression or result
     * @param {string} query - Search query
     * @returns {Array} Matching history items
     */
    searchHistory(query) {
        const lowerQuery = query.toLowerCase();
        return this.history.filter(item => 
            item.expression.toLowerCase().includes(lowerQuery) ||
            item.formattedResult.toLowerCase().includes(lowerQuery)
        );
    }

    // Render history in UI
    renderHistory() {
        if (!this.historyContent) return;

        if (this.history.length === 0) {
            this.historyContent.innerHTML = '<p class="no-history">No calculations yet</p>';
            return;
        }

        const historyHTML = this.history
            .slice()
            .reverse() // Show most recent first
            .map(item => this.createHistoryItemHTML(item))
            .join('');

        this.historyContent.innerHTML = historyHTML;
        
        this.addHistoryItemListeners();
    }

    /**
     * Create HTML for a single history item
     * @param {Object} item - History item
     * @returns {string} HTML string
     */
    createHistoryItemHTML(item) {
        return `
            <div class="history-item" data-id="${item.id}" data-expression="${item.expression}" data-result="${item.result}">
                <div class="history-expression" title="${item.expression}">${this.truncateExpression(item.expression)}</div>
                <div class="history-result" title="${item.formattedResult}">${item.formattedResult}</div>
                <div class="history-timestamp">${item.timestamp}</div>
            </div>
        `;
    }

    /**
     * Truncate long expressions for display
     * @param {string} expression - Expression to truncate
     * @returns {string} Truncated expression
     */
    truncateExpression(expression) {
        const maxLength = 30;
        if (expression.length <= maxLength) {
            return expression;
        }
        return expression.substring(0, maxLength - 3) + '...';
    }

    // Add click listeners to history items
    addHistoryItemListeners() {
        const historyItems = this.historyContent.querySelectorAll('.history-item');
        
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                const expression = item.dataset.expression;
                const result = parseFloat(item.dataset.result);

                // Validate the data before dispatching
                if (isNaN(result)) {
                    console.error('Invalid result in history item:', result);
                    return;
                }
                
                console.log('History recall - Expression:', expression, 'Result:', result);
                
                // Dispatch custom event for calculator to handle
                const event = new CustomEvent('historyItemSelected', {
                    detail: { expression, result }
                });
                document.dispatchEvent(event);
                
                // Visual feedback
                item.classList.add('selected');
                setTimeout(() => item.classList.remove('selected'), 200);
            });

            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(4px)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
            });
        });
    }

    /**
     * Animate new history item
     * @param {number} itemId - ID of the new item
     */
    animateNewItem(itemId) {
        setTimeout(() => {
            const newItem = this.historyContent.querySelector(`[data-id="${itemId}"]`);
            if (newItem) {
                newItem.style.opacity = '0';
                newItem.style.transform = 'translateX(-20px)';
                
                requestAnimationFrame(() => {
                    newItem.style.transition = 'all 0.3s ease';
                    newItem.style.opacity = '1';
                    newItem.style.transform = 'translateX(0)';
                });
            }
        }, 100);
    }

    // Toggle history panel visibility (mobile)
    toggleHistoryPanel() {
        if (this.historyPanel) {
            this.historyPanel.classList.toggle('visible');
        }
    }

    // Show history panel (mobile)
    showHistoryPanel() {
        if (this.historyPanel) {
            this.historyPanel.classList.add('visible');
        }
    }

    // Hide history panel (mobile)
    hideHistoryPanel() {
        if (this.historyPanel) {
            this.historyPanel.classList.remove('visible');
        }
    }

        /**
     * Show history operation feedback
     * @param {string} message - Feedback message
     */
    showHistoryFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'history-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--btn-function);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
            box-shadow: var(--shadow-heavy);
        `;

        document.body.appendChild(feedback);

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translate(-50%, -50%) scale(1.05)';
        });

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translate(-50%, -50%) scale(0.95)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 1500);
    }

    /**
     * Export history data
     * @returns {Object} History export data
     */
    exportHistory() {
        return {
            history: deepClone(this.history),
            maxHistory: this.maxHistory,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * Import history data
     * @param {Object} historyData - History data to import
     * @returns {boolean} Success status
     */
    importHistory(historyData) {
        try {
            if (historyData && Array.isArray(historyData.history)) {
                this.history = historyData.history.slice(-this.maxHistory);
                this.saveHistoryToStorage();
                this.renderHistory();
                this.showHistoryFeedback('History imported successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import history:', error);
            this.showHistoryFeedback('Failed to import history');
            return false;
        }
    }

    /**
     * Get history statistics
     * @returns {Object} History statistics
     */
    getHistoryStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const todayCount = this.history.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= today;
        }).length;

        return {
            totalCalculations: this.history.length,
            todayCalculations: todayCount,
            oldestCalculation: this.history.length > 0 ? this.history[0].timestamp : null,
            newestCalculation: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null,
            maxCapacity: this.maxHistory,
            usage: `${this.history.length}/${this.maxHistory}`
        };
    }

    // Reset history manager
    reset() {
        this.clearHistory();
    }
}

// Create and export singleton instance
export const historyManager = new HistoryManager();

// Export history operations as individual functions
export const historyOperations = {
    add: (expression, result) => historyManager.addToHistory(expression, result),
    clear: () => historyManager.clearHistory(),
    getItem: (index) => historyManager.getHistoryItem(index),
    getAll: () => historyManager.getAllHistory(),
    getRecent: (count) => historyManager.getRecentHistory(count),
    search: (query) => historyManager.searchHistory(query),
    toggle: () => historyManager.toggleHistoryPanel(),
    show: () => historyManager.showHistoryPanel(),
    hide: () => historyManager.hideHistoryPanel(),
    export: () => historyManager.exportHistory(),
    import: (data) => historyManager.importHistory(data),
    getStats: () => historyManager.getHistoryStats(),
    reset: () => historyManager.reset()
};

// Export class for advanced usage
export default HistoryManager;