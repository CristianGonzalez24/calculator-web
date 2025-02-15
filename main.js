const display = document.querySelector('.calculator__display');
const buttons = document.querySelectorAll('.calculator__btn');
const historyList = document.querySelector('.node__history--list');
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
            output = '';
            display.textContent = result;
        } 
        else if (value === 'AC') {
            output = '';
            display.textContent = '0';
        }
        else if (value === 'DEL') {           
            output = output.slice(0, -1);      
            display.textContent = output === '' ? '0' : output;
        }
        else if (value === ')') {
            if (output === '') {
                return
            }
            if (display.textContent.includes('(')) {
                output += ')';
                display.textContent = output;              
            }
        }
        else if (value === 'ln' || value === 'log') {
            
            if (output === '' || isOperator(output[output.length - 1])) {  
                output += value === 'ln' ? 'ln(' : 'log(';  
            }           
            display.textContent = output;
        }
        else if (value === 'π') {
            output += Math.PI.toString();
            display.textContent = output;
        } 
        else if (value === 'e') {
            output += Math.E.toString();
            display.textContent = output;
        }
        else if (value === 'M+') {
            const num = parseFloat(display.textContent);
            if (!isNaN(num)) { 
                addToMemory(num);
            }
            output = '';
            display.textContent = '0';
        }
        else if (value === 'M-') {
            if (memory.length > 0) {
                removeFromMemory();
            }
        }
        else if (value === 'MR') {
            if (memory.length > 0) {
                output += memory[memory.length - 1];
                display.textContent = output;
            }
        }
        else if (value === 'MC') {
            if (memory.length > 0) {
                clearMemory();
            } 
        }
        else if (value === 'negate') {
            let parts = output.match(/-?\d+\.?\d*|\+|\-|\*|\//g);

            if (parts && parts.length > 0) {
                let lastElement = parts[parts.length - 1];

                if (!isNaN(parseFloat(lastElement))) {
                    parts[parts.length - 1] = (-parseFloat(lastElement)).toString();
                    output = parts.join('');
                    display.textContent = output;
                }
            }
        }
        else if (value === 'sin') {
            if (output.includes('cos')) {
                output = output.replace('cos', 'sin');
                display.textContent = output; 
            }
            else if (output.includes('tan')) {
                output = output.replace('tan', 'sin'); 
                display.textContent = output; 
            }
            output = value;
            display.textContent = output;
        }
        else if (value === 'cos') {
            if (output.includes('sin')) {
                output = output.replace('sin', 'cos'); 
                display.textContent = output; 
            }
            else if (output.includes('tan')) {
                output = output.replace('tan', 'cos'); 
                display.textContent = output; 
            }
            output = value;
            display.textContent = output;
        } 
        else if (value === 'tan') {
            if (output.includes('sin')) {
                output = output.replace('sin', 'tan'); 
                display.textContent = output; 
            }
            else if (output.includes('cos')) {
                output = output.replace('cos', 'tan'); 
                display.textContent = output; 
            }
            output = value;
            display.textContent = output;
        }
        else if (value === 'arcs') {
            if (output.includes('arcc')) {
                output = output.replace('arcc', 'arcs'); 
                display.textContent = output; 
            }
            else if (output.includes('arct')) {
                output = output.replace('arct', 'arcs'); 
                display.textContent = output; 
            }
            output = value;
            display.textContent = output;
        }
        else if (value === 'arcc') {
            if (output.includes('arcs')) {
                output = output.replace('arcs', 'arcc'); 
                display.textContent = output; 
            }
            else if (output.includes('arct')) {
                output = output.replace('arct', 'arcc'); 
                display.textContent = output; 
            }
            output = value;
            display.textContent = output;
        }
        else if (value === 'arct') {
            if (output.includes('arcc')) {
                output = output.replace('arcc', 'arct'); 
                display.textContent = output; 
            }
            else if (output.includes('arcs')) {
                output = output.replace('arcs', 'arct'); 
                display.textContent = output; 
            }
            output = value;
            display.textContent = output;
        }
        else {
            if (isOperator(value)) {
                if (output === '' || isOperator(output[output.length - 1])) {
                    return;
                }
                output += value; 
                display.textContent = output;  
            } else {
                if (specialChars.includes(output.slice(-1)) && specialChars.includes(value)) {
                    output = output.slice(0, -1);
                }
                output += value;     
                display.textContent = output;
            }    
        }
        updateHistory();
    } catch (error) {
        display.textContent = 'Error';
        errorMessage.textContent = error.message;
        output = '';
    }
}
const updateHistory = () => {
    if (history.length >= historyLength) {
        history.shift();
    }
    historyList.innerHTML = '';
    history.slice(-historyLength).forEach((calculation) => {
        const listItem = document.createElement('li');
        listItem.textContent = calculation;
        historyList.appendChild(listItem);
    });
}
const isOperator = (char) => {
    return specialChars.includes(char);
}
const factorial = (n) => {
    if (n === 0 || n === 1) {
        return 1;
    } else {
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result; 
    }
};
const calculateTrigFunction = (angle, func) => {
    switch (func) {
        case 'sin':
            return Math.sin(angle * (Math.PI / 180)).toFixed(12);
        case 'cos':
            return Math.cos(angle * (Math.PI / 180)).toFixed(12); 
        case 'tan':
            return Math.tan(angle * (Math.PI / 180)).toFixed(12);
        default:
            throw new Error('Invalid trigonometric function');
    }
}
const formatMemoryValues = () => {
    if (memory.length === 0) {
        return 'No hay valores en memoria';
    } else {
        return 'Valores en memoria: ' + memory.join(', ');
    }
};
const addToMemory = () => {
    const currentValue = display.textContent;
    if (memory.length >= memoryLimit) {
        memory.shift();
    }
    memory.push(currentValue);
    memoryList.textContent = formatMemoryValues();
};
const removeFromMemory = () => {
    memory.pop();
    memoryList.textContent = formatMemoryValues();
};
const clearMemory = () => {
    memory = [];
    memoryList.textContent = formatMemoryValues();
};
function clearErrorMessage() {
    errorMessage.textContent = '';
}
buttons.forEach((button) => {
    button.addEventListener('click', (e) => calculate(e.target.dataset.value));
});
document.addEventListener('keydown', function(event) {
    const keyCode = event.keyCode;
    if (keyCode >= 96 && keyCode <= 105) {
        const number = keyCode - 96;
        handleInput(number.toString());
    } else if (keyCode === 106) { 
        handleInput('*');
    } else if (keyCode === 107) { 
        handleInput('+');
    } else if (keyCode === 109) { 
        handleInput('-');
    } else if (keyCode === 111) { 
        handleInput('/');
    } else if (keyCode === 13) { 
        calculate('=');
    } else if (keyCode === 8) { 
        calculate('DEL');
    } else if (keyCode === 110) {
        calculate('.');
    }
});
function handleInput(number) {
    output += number;
    display.textContent = output;  
}
