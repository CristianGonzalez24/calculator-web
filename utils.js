/**
 * Utility functions and constants for the Scientific Calculator
 * @fileoverview Contains mathematical constants, validation functions, and utility helpers
 */

// Mathematical constants with high precision
export const CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    SQRT_2: Math.SQRT2,
    SQRT_1_2: Math.SQRT1_2,
    LN_2: Math.LN2,
    LN_10: Math.LN10,
    LOG_2_E: Math.LOG2E,
    LOG_10_E: Math.LOG10E
};

// Precision and limits
export const PRECISION = {
    DECIMAL_PLACES: 12,
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
    EPSILON: Number.EPSILON
};

// Error messages
export const ERROR_MESSAGES = {
    DIVISION_BY_ZERO: 'Error: Division by zero',
    MATH_ERROR: 'Math Error',
    OVERFLOW_ERROR: 'Overflow Error',
    INVALID_INPUT: 'Invalid Input',
    DOMAIN_ERROR: 'Domain Error',
    MEMORY_ERROR: 'Memory Error',
    SYNTAX_ERROR: 'Syntax Error'
};

// Angle conversion modes
export const ANGLE_MODES = {
    DEGREES: 'DEG',
    RADIANS: 'RAD',
    GRADIANS: 'GRAD'
};

/**
 * Formats a number for display with appropriate precision
 * @param {number} value - The number to format
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, maxDecimals = PRECISION.DECIMAL_PLACES) {
    if (!isFinite(value)) {
        if (isNaN(value)) return ERROR_MESSAGES.MATH_ERROR;
        return value > 0 ? '∞' : '-∞';
    }

    // Handle very large or very small numbers with scientific notation
    const absValue = Math.abs(value);
    if (absValue > 1e15 || (absValue < 1e-6 && absValue !== 0)) {
        return value.toExponential(6);
    }

    // Round to avoid floating point precision issues
    const rounded = parseFloat(value.toFixed(maxDecimals));
    
    // Remove trailing zeros only after decimal point, preserve integer zeros
    const str = rounded.toString();
    
    // Only remove trailing zeros if there's a decimal point
    if (str.includes('.')) {
        return str.replace(/\.?0+$/, '');
    }
    
    // Return as-is for integers (preserves significant zeros like in "10", "100", etc.)
    return str;
}

/**
 * Validates if a number is safe for calculations
 * @param {number} value - Number to validate
 * @returns {boolean} True if number is safe
 */
export function isSafeNumber(value) {
    return isFinite(value) && 
        value <= PRECISION.MAX_SAFE_INTEGER && 
        value >= PRECISION.MIN_SAFE_INTEGER;
}

/**
 * Converts angle based on current mode
 * @param {number} angle - Angle value
 * @param {string} mode - Current angle mode
 * @param {boolean} toRadians - Convert to radians (true) or from radians (false)
 * @returns {number} Converted angle
 */
export function convertAngle(angle, mode, toRadians = true) {
    if (mode === ANGLE_MODES.RADIANS) {
        return angle;
    }

    if (toRadians) {
        switch (mode) {
            case ANGLE_MODES.DEGREES:
                return angle * (Math.PI / 180);
            case ANGLE_MODES.GRADIANS:
                return angle * (Math.PI / 200);
            default:
                return angle;
        }
    } else {
        switch (mode) {
            case ANGLE_MODES.DEGREES:
                return angle * (180 / Math.PI);
            case ANGLE_MODES.GRADIANS:
                return angle * (200 / Math.PI);
            default:
                return angle;
        }
    }
}

/**
 * Validates mathematical expression for basic syntax
 * @param {string} expression - Expression to validate
 * @returns {boolean} True if expression appears valid
 */
export function validateExpression(expression) {
    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (let char of expression) {
        if (char === '(') parenthesesCount++;
        if (char === ')') parenthesesCount--;
        if (parenthesesCount < 0) return false;
    }

    if (parenthesesCount !== 0) return false;

    // Check for invalid patterns
    const invalidPatterns = [
        /[+\-×÷]{2,}/,  // Multiple consecutive operators
        /\.[0-9]*\./,   // Multiple decimal points
        /^[×÷]/,        // Starting with multiply or divide
        /[+\-×÷]$/      // Ending with operator
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(expression));
}

/**
 * Calculates factorial of a positive integer
 * @param {number} n - Number to calculate factorial
 * @returns {number} Factorial result
 */
export function factorial(n) {
    if (!Number.isInteger(n) || n < 0) {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT);
    }
    
    if (n > 170) {
        throw new Error(ERROR_MESSAGES.OVERFLOW_ERROR);
    }
    
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    
    return result;
}

/**
 * Generates a random number within a specified range
 * @param {number} min - Minimum value (default: 0)
 * @param {number} max - Maximum value (default: 1)
 * @returns {number} Random number
 */
export function randomNumber(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Deep clones an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    
    return clonedObj;
}

/**
 * Safely evaluates a mathematical expression
 * @param {string} expression - Expression to evaluate
 * @returns {number} Evaluation result
 */
export function safeEval(expression) {
    try {
        // Validate the expression doesn't contain dangerous code
        if (!/^[0-9+\-*/.() \t\n\r]+$/.test(expression)) {
            throw new Error(ERROR_MESSAGES.INVALID_INPUT);
        }

        // Replace mathematical symbols with JavaScript operators
        const jsExpression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/π/g, Math.PI.toString())
            .replace(/e/g, Math.E.toString());

        // Use Function constructor for safer evaluation than eval
        const result = new Function('return ' + jsExpression)();

        if (!isFinite(result)) {
            if (isNaN(result)) throw new Error(ERROR_MESSAGES.MATH_ERROR);
            throw new Error(ERROR_MESSAGES.OVERFLOW_ERROR);
        }

        return result;
    } catch (error) {
        if (
            error.message === ERROR_MESSAGES.INVALID_INPUT ||
            error.message === ERROR_MESSAGES.MATH_ERROR ||
            error.message === ERROR_MESSAGES.OVERFLOW_ERROR
        ) {
            throw error;
        }

        throw new Error(ERROR_MESSAGES.SYNTAX_ERROR);
    }
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Plays a sound effect (if enabled)
 * @param {string} type - Type of sound ('click', 'error', 'success')
 */
export function playSound(type) {
    // This would integrate with Web Audio API for sound effects
    // For now, we'll just implement a simple beep using audio context
    if (!window.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            click: 800,
            error: 200,
            success: 1000
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type] || 800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Silently fail if audio context is not available
        console.warn('Sound playback failed:', error);
    }
}

/**
 * Stores data in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 * @returns {boolean} Success status
 */
export function storeData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to store data:', error);
        return false;
    }
}

/**
 * Retrieves data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Retrieved data or default value
 */
export function getData(key, defaultValue = null) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error('Failed to retrieve data:', error);
        return defaultValue;
    }
}