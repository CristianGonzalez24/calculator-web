const display = document.querySelector('.calculator__display');
const buttons = document.querySelectorAll('.calculator__btn');
const historyList = document.querySelector('node__history--list');
const memoryList = document.querySelector('.node__memory--list');
const specialChars = ['/', '*', '+', '-', '%', '=', '^', '!', '√'];
const historyLength = 7;
const memoryLimit = 10;
const trigFunctionRegex = /(sin|cos|tan)(\d+(\.\d+)?)?/;
let history = [];
let memory = [];
let output = '';

