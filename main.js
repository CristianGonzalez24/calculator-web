/**
 * Scientific Calculator Main Application
 * @fileoverview Main calculator logic with comprehensive mathematical operations
 */
import { 
    formatNumber, 
    ERROR_MESSAGES, 
    CONSTANTS, 
    ANGLE_MODES,
    convertAngle,
    factorial,
    randomNumber,
    validateExpression,
    safeEval,
    copyToClipboard,
    playSound,
    storeData,
    getData,
    debounce
} from './utils.js';

import { memoryOperations } from './memory.js';
import { historyOperations } from './history.js';

class ScientificCalculator {
    constructor() {
        // Calculator state
        this.currentInput = '0';
        this.expression = '';
        this.lastResult = 0;
        this.angleMode = ANGLE_MODES.DEGREES;
        this.isNewNumber = true;
        this.lastOperation = null;
        this.waitingForNewInput = false;
        
        // UI elements
        this.displayElement = null;
        this.expressionElement = null;
        this.errorToast = null;
        this.loadingIndicator = null;
        
        // Settings
        this.soundEnabled = true;
        this.theme = 'dark';
        
        this.initializeCalculator();
    }

    // Initialize calculator components
    initializeCalculator() {
        this.loadSettings();
        this.initializeUI();
        this.bindEvents();
        this.applyTheme();
        this.updateDisplay();
    }

    // Load settings from localStorage
    loadSettings() {
        const settings = getData('calculatorSettings', {});
        this.angleMode = settings.angleMode || ANGLE_MODES.DEGREES;
        this.soundEnabled = settings.soundEnabled !== false;
        this.theme = settings.theme || 'dark';
        
        // Set global sound flag
        window.soundEnabled = this.soundEnabled;
    }

    // Save settings to localStorage
    saveSettings() {
        storeData('calculatorSettings', {
            angleMode: this.angleMode,
            soundEnabled: this.soundEnabled,
            theme: this.theme
        });
    }

    //Initialize UI elements and their references
    initializeUI() {
        this.displayElement = document.getElementById('mainDisplay');
        this.expressionElement = document.getElementById('expressionDisplay');
        this.errorToast = document.getElementById('errorToast');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Update mode display
        const angleModeBtn = document.getElementById('angleMode');
        if (angleModeBtn) {
            angleModeBtn.textContent = this.angleMode;
        }
        
        // Update sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        
        // Update theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = this.theme === 'dark' ? '🌙' : '☀️';
        }
    }

    // Bind all event listeners
    bindEvents() {
        // Button clicks
        this.bindButtonEvents();
        
        // Keyboard events
        this.bindKeyboardEvents();
        
        // Custom events
        this.bindCustomEvents();
        
        // UI controls
        this.bindUIControlEvents();
    }


    // Bind calculator button events
    bindButtonEvents() {
        const buttonGrid = document.querySelector('.button-grid');
        if (buttonGrid) {
            buttonGrid.addEventListener('click', (event) => {
                const button = event.target.closest('.btn');
                if (button) {
                    const action = button.dataset.action;
                    if (action) {
                        this.handleButtonClick(action);
                        this.animateButtonPress(button);
                        playSound('click');
                    }
                }
            });
        }
    }

    // Bind keyboard events
    bindKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });
    }

    // Bind custom events
    bindCustomEvents() {
        document.addEventListener('historyItemSelected', (event) => {
            const { expression, result } = event.detail;
            
            // Clear current state first
            this.expression = '';
            this.currentInput = formatNumber(result);
            this.isNewNumber = true;
            this.waitingForNewInput = false;
            this.lastOperation = null;
            
            // Set the result as the current input for further calculations
            this.updateDisplay();
            playSound('success');
        });
    }

    // Bind UI control events
    bindUIControlEvents() {
        // Angle mode toggle
        const angleModeBtn = document.getElementById('angleMode');
        if (angleModeBtn) {
            angleModeBtn.addEventListener('click', () => {
                this.toggleAngleMode();
            });
        }
        
        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * Handle button click actions
     * @param {string} action - Button action identifier
     */
    handleButtonClick(action) {
        try {
            if (this.isNumeric(action)) {
                this.inputNumber(action);
            } else if (this.isOperator(action)) {
                this.inputOperator(action);
            } else {
                this.handleSpecialAction(action);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Handle keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardInput(event) {
        // Prevent default for handled keys
        const handledKeys = [
            'Enter', 'Escape', 'Backspace', 'Delete',
            '+', '-', '*', '/', '=', '.',
            '(', ')', '%'
        ];
        
        if (handledKeys.includes(event.key) || /^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
        
        try {
            if (/^[0-9]$/.test(event.key)) {
                this.inputNumber(event.key);
            } else if (event.key === '.') {
                this.inputNumber('.');
            } else if (event.key === '+') {
                this.inputOperator('+');
            } else if (event.key === '-') {
                this.inputOperator('-');
            } else if (event.key === '*') {
                this.inputOperator('×');
            } else if (event.key === '/') {
                this.inputOperator('÷');
            } else if (event.key === 'Enter' || event.key === '=') {
                this.calculate();
            } else if (event.key === 'Escape') {
                this.clearAll();
            } else if (event.key === 'Backspace') {
                this.backspace();
            } else if (event.key === 'Delete') {
                this.clearEntry();
            } else if (event.key === '(') {
                this.inputOperator('(');
            } else if (event.key === ')') {
                this.inputOperator(')');
            } else if (event.key === '%') {
                this.handleSpecialAction('percent');
            }
            
            playSound('click');
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Handle special button actions
     * @param {string} action - Special action identifier
     */
    handleSpecialAction(action) {
        switch (action) {
            case '=':
                this.calculate();
                break;
            case 'clear-all':
                this.clearAll();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'copy':
                this.copyResult();
                break;
            case 'history':
                historyOperations.toggle();
                break;
                
            // Memory operations
            case 'ms':
                memoryOperations.store(parseFloat(this.currentInput));

                // Reset display and input after storing
                this.currentInput = '0';
                this.expression = '';
                this.isNewNumber = true;
                this.updateDisplay();
                break;
            case 'mr':
                this.currentInput = formatNumber(memoryOperations.recall());
                this.isNewNumber = true;
                this.updateDisplay();
                break;
            case 'mc':
                memoryOperations.clear();
                break;
            case 'm-add':
                memoryOperations.add(parseFloat(this.currentInput));
                break;
            case 'm-subtract':
                memoryOperations.subtract(parseFloat(this.currentInput));
                break;
                
            // Mathematical functions
            case 'sin':
                this.calculateTrigFunction('sin');
                break;
            case 'cos':
                this.calculateTrigFunction('cos');
                break;
            case 'tan':
                this.calculateTrigFunction('tan');
                break;
            case 'asin':
                this.calculateInverseTrigFunction('asin');
                break;
            case 'acos':
                this.calculateInverseTrigFunction('acos');
                break;
            case 'atan':
                this.calculateInverseTrigFunction('atan');
                break;
            case 'log':
                this.calculateLogarithm('log10');
                break;
            case 'ln':
                this.calculateLogarithm('log');
                break;
            case 'sqrt':
                this.calculateRoot('sqrt');
                break;
            case 'cbrt':
                this.calculateRoot('cbrt');
                break;
            case 'square':
                this.calculatePower(2);
                break;
            case 'cube':
                this.calculatePower(3);
                break;
            case 'power':
                this.inputOperator('^');
                break;
            case 'factorial':
                this.calculateFactorial();
                break;
            case 'percent':
                this.calculatePercent();
                break;
            case 'random':
                this.generateRandom();
                break;
                
            // Constants
            case 'pi':
                this.inputConstant(CONSTANTS.PI);
                break;
            case 'e':
                this.inputConstant(CONSTANTS.E);
                break;
                
            default:
                console.warn('Unknown action:', action);
        }
    }

    /**
     * Input a number or decimal point
     * @param {string} value - Number or decimal point
     */
    inputNumber(value) {
        if (value === '.') {
            if (this.currentInput.includes('.')) return;
            if (this.isNewNumber) {
                this.currentInput = '0.';
                this.isNewNumber = false;
            } else {
                this.currentInput += '.';
            }
        } else {
            if (this.isNewNumber || this.currentInput === '0') {
                this.currentInput = value;
                this.isNewNumber = false;
            } else {
                this.currentInput += value;
            }
        }
        
        // Reset waitingForNewInput when user starts entering a new number
        if (this.waitingForNewInput) {
            this.waitingForNewInput = false;
        }
        
        this.updateDisplay();
        this.updateExpressionDisplay();
    }

    inputOperator(operator) {
        // Special handling for opening parenthesis
        if (operator === '(') {
            // If we're at the initial state (display shows '0'), start fresh
            if (this.currentInput === '0' && this.expression === '' && this.isNewNumber) {
                this.expression = '( ';
                this.isNewNumber = true;
                this.waitingForNewInput = false;
            } else if (this.waitingForNewInput) {
                // Replace trailing operator if waiting for input
                this.expression = this.expression.replace(/[+\-×÷^]+$/, '') + ` ${operator} `;
            } else {
                // Add current input and then the opening parenthesis
                this.expression += ` ${this.currentInput} ${operator} `;
                this.isNewNumber = true;
                this.waitingForNewInput = false;
            }
        } else if (operator === ')') {
            // Handle closing parenthesis - always include current input
            if (!this.waitingForNewInput) {
                this.expression += this.currentInput + ' ) ';
            } else {
                // If waiting for input, just add the closing parenthesis
                this.expression = this.expression.trim() + ' ) ';
            }
            this.isNewNumber = true;
            this.waitingForNewInput = true;
        } else {
            // Handle regular operators
            if (this.waitingForNewInput) {
                this.expression = this.expression.replace(/[+\-×÷^]+$/, '') + ` ${operator} `;
            } else {
                this.expression += ` ${this.currentInput} ${operator} `;
            }
            this.isNewNumber = true;
            this.waitingForNewInput = true;
        }
        
        this.lastOperation = operator;
        this.updateDisplay();
        this.updateExpressionDisplay();
    }

    /**
     * Input a mathematical constant
     * @param {number} value - Constant value
     */
    inputConstant(value) {
        this.currentInput = formatNumber(value);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    // Perform calculation
    calculate() {
        try {
            let fullExpression = this.expression;
            
            if (!this.waitingForNewInput) {
                fullExpression += this.currentInput;
            } else {
                fullExpression = fullExpression.trim();
                if (fullExpression.endsWith('+') || fullExpression.endsWith('-') || 
                    fullExpression.endsWith('×') || fullExpression.endsWith('÷') ||
                    fullExpression.endsWith('^')) {
                    fullExpression = fullExpression.slice(0, -1).trim();
                }
            }
            
            if (!fullExpression) {
                fullExpression = this.currentInput;
            }
            
            // Validate expression
            if (!validateExpression(fullExpression)) {
                throw new Error(ERROR_MESSAGES.SYNTAX_ERROR);
            }
            
            // Show loading for complex calculations
            this.showLoading();
            
            // Calculate result with delay for smooth UX
            setTimeout(() => {
                try {
                    const result = this.evaluateExpression(fullExpression);
                    
                    // Add to history
                    historyOperations.add(fullExpression, result);
                    
                    // Update display
                    this.lastResult = result;
                    this.currentInput = formatNumber(result);
                    this.expression = '';
                    this.isNewNumber = true;
                    this.waitingForNewInput = false;
                    this.updateDisplay();
                    
                    playSound('success');
                } catch (error) {
                    this.showError(error.message);
                } finally {
                    this.hideLoading();
                }
            }, 100);
            
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }

    /**
     * Evaluate mathematical expression
     * @param {string} expression - Expression to evaluate
     * @returns {number} Calculation result
     */
    evaluateExpression(expression) {
        try {
            // Clean and validate the expression
            expression = expression.trim();
            
            // Log for debugging
            console.log('Evaluating expression:', expression);
            
            // Handle power operations
            expression = expression.replace(/(\d+(?:\.\d+)?)\s*\^\s*(\d+(?:\.\d+)?)/g, 
                (match, base, exp) => `Math.pow(${base}, ${exp})`);
            
            // Handle percentage
            expression = expression.replace(/(\d+(?:\.\d+)?)\s*%/g, (match, num) => `(${num}/100)`);
            
            // Replace calculator operators with JavaScript operators
            expression = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
            
            console.log('Processed expression:', expression);
            
            const result = safeEval(expression);
            
            console.log('Calculation result:', result);
            
            if (!isFinite(result)) {
                if (isNaN(result)) {
                    throw new Error(ERROR_MESSAGES.MATH_ERROR);
                }
                throw new Error(ERROR_MESSAGES.OVERFLOW_ERROR);
            }
            
            return result;
        } catch (error) {
            console.error('Evaluation error:', error);
            if (error.message.includes('Division by zero') || expression.includes('/0')) {
                throw new Error(ERROR_MESSAGES.DIVISION_BY_ZERO);
            }
            throw new Error(ERROR_MESSAGES.MATH_ERROR);
        }
    }

    /**
     * Calculate trigonometric function
     * @param {string} func - Function name (sin, cos, tan)
     */
    calculateTrigFunction(func) {
        const value = parseFloat(this.currentInput);
        const angleInRadians = convertAngle(value, this.angleMode, true);
        
        let result;
        switch (func) {
            case 'sin':
                result = Math.sin(angleInRadians);
                break;
            case 'cos':
                result = Math.cos(angleInRadians);
                break;
            case 'tan':
                // Check for undefined values (odd multiples of π/2)
                if (Math.abs(Math.cos(angleInRadians)) < 1e-10) {
                    throw new Error(ERROR_MESSAGES.MATH_ERROR);
                }
                result = Math.tan(angleInRadians);
                break;
        }
        
        // Handle very small results (close to zero)
        if (Math.abs(result) < 1e-10) {
            result = 0;
        }
        
        const expression = `${func}(${this.currentInput}${this.angleMode === ANGLE_MODES.DEGREES ? '°' : ''})`;
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    /**
     * Calculate inverse trigonometric function
     * @param {string} func - Function name (asin, acos, atan)
     */
    calculateInverseTrigFunction(func) {
        const value = parseFloat(this.currentInput);
        
        let result;
        switch (func) {
            case 'asin':
                if (value < -1 || value > 1) {
                    throw new Error(ERROR_MESSAGES.DOMAIN_ERROR);
                }
                result = Math.asin(value);
                break;
            case 'acos':
                if (value < -1 || value > 1) {
                    throw new Error(ERROR_MESSAGES.DOMAIN_ERROR);
                }
                result = Math.acos(value);
                break;
            case 'atan':
                result = Math.atan(value);
                break;
        }
        
        // Convert from radians to current angle mode
        result = convertAngle(result, this.angleMode, false);
        
        const expression = `${func}(${this.currentInput})`;
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    /**
     * Calculate logarithm
     * @param {string} base - Logarithm base (log10, log)
     */
    calculateLogarithm(base) {
        const value = parseFloat(this.currentInput);
        
        if (value <= 0) {
            throw new Error(ERROR_MESSAGES.DOMAIN_ERROR);
        }
        
        let result;
        let expression;
        
        switch (base) {
            case 'log10':
                result = Math.log10(value);
                expression = `log(${this.currentInput})`;
                break;
            case 'log':
                result = Math.log(value);
                expression = `ln(${this.currentInput})`;
                break;
        }
        
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    /**
     * Calculate root function
     * @param {string} type - Root type (sqrt, cbrt)
     */
    calculateRoot(type) {
        const value = parseFloat(this.currentInput);
        
        let result;
        let expression;
        
        switch (type) {
            case 'sqrt':
                if (value < 0) {
                    throw new Error(ERROR_MESSAGES.DOMAIN_ERROR);
                }
                result = Math.sqrt(value);
                expression = `√(${this.currentInput})`;
                break;
            case 'cbrt':
                result = Math.cbrt(value);
                expression = `∛(${this.currentInput})`;
                break;
        }
        
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    /**
     * Calculate power function
     * @param {number} exponent - Exponent value
     */
    calculatePower(exponent) {
        const value = parseFloat(this.currentInput);
        const result = Math.pow(value, exponent);
        
        if (!isFinite(result)) {
            throw new Error(ERROR_MESSAGES.OVERFLOW_ERROR);
        }
        
        const expression = `${this.currentInput}${exponent === 2 ? '²' : exponent === 3 ? '³' : `^${exponent}`}`;
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    // Calculate factorial
    calculateFactorial() {
        const value = parseFloat(this.currentInput);
        
        const result = factorial(value);
        const expression = `${this.currentInput}!`;
        
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    // Calculate percentage

    calculatePercent() {
        const value = parseFloat(this.currentInput);
        const result = value / 100;
        
        const expression = `${this.currentInput}%`;
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    // Generate random number
    generateRandom() {
        const result = randomNumber();
        const expression = 'random()';
        
        historyOperations.add(expression, result);
        
        this.currentInput = formatNumber(result);
        this.isNewNumber = true;
        this.updateDisplay();
    }

    // Clear all input and expression
    clearAll() {
        this.currentInput = '0';
        this.expression = '';
        this.lastResult = 0;
        this.isNewNumber = true;
        this.waitingForNewInput = false;
        this.lastOperation = null;
        this.updateDisplay();
    }

    // Clear current entry only
    clearEntry() {
        this.currentInput = '0';
        this.isNewNumber = true;
        this.updateDisplay();
    }

    // Backspace last character
    backspace() {
        if (this.currentInput.length > 1 && this.currentInput !== '0') {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
            this.isNewNumber = true;
        }
        this.updateDisplay();
    }

    // Copy result to clipboard
    async copyResult() {
        try {
            const success = await copyToClipboard(this.currentInput);
            if (success) {
                this.showSuccess('Result copied to clipboard');
                playSound('success');
            } else {
                throw new Error('Copy failed');
            }
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
    }

    // Toggle angle mode
    toggleAngleMode() {
        const modes = Object.values(ANGLE_MODES);
        const currentIndex = modes.indexOf(this.angleMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.angleMode = modes[nextIndex];
        
        const angleModeBtn = document.getElementById('angleMode');
        if (angleModeBtn) {
            angleModeBtn.textContent = this.angleMode;
        }
        
        this.saveSettings();
        playSound('click');
    }

    // Toggle sound on/off
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        window.soundEnabled = this.soundEnabled;
        
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
        
        this.saveSettings();
        playSound('click');
    }

    // Toggle theme
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = this.theme === 'dark' ? '🌙' : '☀️';
        }
        
        this.saveSettings();
        playSound('click');
    }

    // Apply theme to document
    applyTheme() {
        document.body.setAttribute('data-theme', this.theme);
    }

    // Update expression display to show current building expression
    updateExpressionDisplay() {
        if (this.expressionElement) {
            let displayExpression = this.expression;
            
            // If we're not waiting for new input, show the current number being typed
            if (!this.waitingForNewInput && this.expression) {
                displayExpression += this.currentInput;
            } else if (!this.expression) {
                // If no expression yet, just show current input
                displayExpression = this.currentInput;
            }
            
            this.expressionElement.textContent = displayExpression || ' ';
        }
    }

    // Update display elements
    updateDisplay() {
        if (this.displayElement) {
            this.displayElement.textContent = this.currentInput;
            this.displayElement.classList.remove('error');
        }
        
        // Expression display is now handled separately
        this.updateExpressionDisplay();
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.displayElement) {
            this.displayElement.textContent = message;
            this.displayElement.classList.add('error');
        }
        
        if (this.errorToast) {
            this.errorToast.textContent = message;
            this.errorToast.classList.add('show');
            setTimeout(() => {
                this.errorToast.classList.remove('show');
            }, 3000);
        }
        
        playSound('error');
        
        // Reset after showing error
        setTimeout(() => {
            this.clearAll();
        }, 2000);
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        // Create temporary success toast
        const successToast = document.createElement('div');
        successToast.className = 'success-toast';
        successToast.textContent = message;
        successToast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: var(--btn-equals);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius-small);
            box-shadow: var(--shadow-heavy);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(successToast);
        
        requestAnimationFrame(() => {
            successToast.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            successToast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (successToast.parentNode) {
                    successToast.parentNode.removeChild(successToast);
                }
            }, 300);
        }, 2000);
    }

    // Show loading indicator
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.add('show');
        }
    }

    // Hide loading indicator
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.classList.remove('show');
        }
    }

    /**
     * Animate button press
     * @param {HTMLElement} button - Button element
     */
    animateButtonPress(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    /**
     * Check if value is numeric
     * @param {string} value - Value to check
     * @returns {boolean} True if numeric
     */
    isNumeric(value) {
        return /^[0-9.]$/.test(value);
    }

    /**
     * Check if value is an operator
     * @param {string} value - Value to check
     * @returns {boolean} True if operator
     */
    isOperator(value) {
        return ['+', '-', '×', '÷', '^', '(', ')'].includes(value);
    }

    // Reset calculator to default state
    reset() {
        this.clearAll();
        memoryOperations.reset();
        historyOperations.reset();
    }

    /**
     * Export calculator state
     * @returns {Object} Calculator state
     */
    exportState() {
        return {
            currentInput: this.currentInput,
            expression: this.expression,
            angleMode: this.angleMode,
            settings: {
                soundEnabled: this.soundEnabled,
                theme: this.theme
            },
            memory: memoryOperations.export(),
            history: historyOperations.export()
        };
    }

    /**
     * Import calculator state
     * @param {Object} state - State to import
     */
    importState(state) {
        if (state.currentInput) this.currentInput = state.currentInput;
        if (state.expression) this.expression = state.expression;
        if (state.angleMode) this.angleMode = state.angleMode;
        
        if (state.settings) {
            this.soundEnabled = state.settings.soundEnabled;
            this.theme = state.settings.theme;
        }
        
        if (state.memory) memoryOperations.import(state.memory);
        if (state.history) historyOperations.import(state.history);
        
        this.saveSettings();
        this.applyTheme();
        this.updateDisplay();
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new ScientificCalculator();
    console.log('Scientific Calculator initialized successfully');
});

// Export for potential external use
export default ScientificCalculator;