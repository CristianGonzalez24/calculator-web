const display = document.querySelector('.calculator__display');
const buttons = document.querySelectorAll('.calculator__btn');
const historyList = document.querySelector('node__history--list');
const memoryList = document.querySelector('.node__memory--list');
const errorMessage = document.querySelector('.calculator__error');
const specialChars = ['/', '*', '+', '-', '%', '=', '^', '!', '√'];
const historyLength = 7;
const memoryLimit = 10;
const trigFunctionRegex = /(sin|cos|tan)(\d+(\.\d+)?)?/;
let history = [];
let memory = [];
let output = '';

const calculate = (value) => {
    try {      
        clearErrorMessage();
        if (value === '=') {
            let result;
            if (output === '') {
                return;
            } else if (output.includes('√')) {
                const number = parseFloat(output.substring(1));
                if (!isNaN(number)) {
                    result = Math.sqrt(number).toFixed(12);
                    history.push('√' + number + ' = ' + result);
                } else {
                    throw new Error('Invalid number inside the square root');
                }
            } else if (output.includes('^')) {                
                const [base, exponent] = output.split('^').map(parseFloat);
                if (!isNaN(base) && !isNaN(exponent)) {
                    result = Math.pow(base, exponent);
                    history.push(base + '^' + exponent + ' = ' + result);
                } else {
                    throw new Error('Invalid expression for exponentiation');
                }
            } else if (output.includes('ln')) {
                const number = parseFloat(output.substring(3));
                if (!isNaN(number) && number > 0) {
                    result = Math.log(number);
                    history.push('ln(' + number + ') = ' + result.toFixed(12));
                } else {
                    throw new Error('Invalid number for natural logarithm');
                }
            } else if (output.includes('log')) {
                const number = parseFloat(output.substring(4));
                if (!isNaN(number) && number > 0) {
                    result = Math.log10(number);
                    history.push('log(' + number + ') = ' + result.toFixed(12));
                } else {
                    throw new Error('Invalid number for logarithm');
                }
            } else if (output.includes('sin') || output.includes('cos') || output.includes('tan')) {
                const match = output.match(trigFunctionRegex);
                const func = match[1];
                const angle = parseFloat(match[2]);
                if (!isNaN(angle)) {
                    result = calculateTrigFunction(angle, func);
                    history.push(output + ' = ' + result);
                } else {
                    throw new Error('Invalid angle for trigonometric function');
                }
            } else if (output.includes('arcs')) {
                const angle = parseFloat(output.substring(4));
                if (!isNaN(angle) && angle >= -1 && angle <= 1) { 
                    result = Math.asin(angle); 
                    history.push('asin(' + angle + ') = ' + result); 
                } else {
                    throw new Error('Invalid angle for arcsin function, must be between -1 and 1');
                }
            } else if (output.includes('arcc')) {
                const angle = parseFloat(output.substring(4)); 
                if (!isNaN(angle) && angle >= -1 && angle <= 1) { 
                    result = Math.acos(angle);
                    history.push('acos(' + angle + ') = ' + result);
                } else {
                    throw new Error('Invalid angle for arccos function, must be between -1 and 1');
                }
            } else if (output.includes('arct')) {
                const angle = parseFloat(output.substring(4));
                if (!isNaN(angle)) {
                    result = Math.atan(angle);
                    history.push('atan(' + angle + ') = ' + result);
                } else {
                    throw new Error('Invalid angle for arctan function');
                }
            } else if (output.includes('!')) {
                const currentValue = parseFloat(output); 
                if (!isNaN(currentValue)) {
                    result = factorial(currentValue);
                    history.push(currentValue + '!' + ' = ' + result);
                } else {
                    throw new Error('Invalid number for factorial');
                }
            } else if (output.includes(Math.PI.toString())){
                result = eval(output);
                history.push(output.replace(Math.PI.toString(), 'π') + ' = ' + Math.round(result * 100) / 100);
            } else if (output.includes(Math.E.toString())){
                result = eval(output);
                history.push(output.replace(Math.E.toString(), 'e') + ' = ' + Math.round(result * 100) / 100);
            } else {
                result = eval(output.replace('%', '/100'));
                if (isNaN(result)) {
                    throw new Error('Invalid expression');
                }
                if (output.includes('%') || output.includes('/') || output.includes('.')) {
                    
                    if (output.includes('/') && output.endsWith('/0')) {
                        throw new Error('Division by zero is not allowed');
                    }
                    result = Math.round(result * 100) / 100;
                }
                history.push(output + ' = ' + result);
            }
        } else {

        }
    } catch (error) {
        display.textContent = 'Error';
        errorMessage.textContent = error.message;
        output = '';
    }
}

function clearErrorMessage() {
    errorMessage.textContent = '';
}
const calculateTrigFunction = (angle, func) => {
    switch (func) {
        case 'sin':
            return Math.sin(angle * (Math.PI / 180)).toFixed(12); // Convertir ángulo de grados a radianes
        case 'cos':
            return Math.cos(angle * (Math.PI / 180)).toFixed(12); 
        case 'tan':
            return Math.tan(angle * (Math.PI / 180)).toFixed(12);
        default:
            throw new Error('Invalid trigonometric function');
    }
}
