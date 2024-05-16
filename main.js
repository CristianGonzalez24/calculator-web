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
            }
            else if (output.includes('√')) {
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
