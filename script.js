// ============================================
// CALCULATOR STATE MANAGEMENT
// ============================================

class Calculator {
    constructor() {
        this.displayValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.expression = '';
    }

    // Input a digit or decimal point
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.displayValue = String(digit);
            this.waitingForOperand = false;
        } else {
            this.displayValue = this.displayValue === '0' ? String(digit) : this.displayValue + digit;
        }
    }

    // Input a decimal point
    inputDecimal() {
        if (this.waitingForOperand) {
            this.displayValue = '0.';
            this.waitingForOperand = false;
            return;
        }

        if (!this.displayValue.includes('.')) {
            this.displayValue += '.';
        }
    }

    // Clear all
    clear() {
        this.displayValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.expression = '';
    }

    // Delete last digit
    delete() {
        if (this.displayValue.length > 1) {
            this.displayValue = this.displayValue.slice(0, -1);
        } else {
            this.displayValue = '0';
        }
    }

    // Handle percentage
    percentage() {
        const value = parseFloat(this.displayValue);
        if (!isNaN(value)) {
            this.displayValue = String(value / 100);
        }
    }

    // Perform operation
    performOperation(nextOperator) {
        const inputValue = parseFloat(this.displayValue);

        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const result = this.calculate(this.previousValue, inputValue, this.operator);

            this.displayValue = String(result);
            this.previousValue = result;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;

        // Update expression
        this.updateExpression(nextOperator);
    }

    // Calculate result
    calculate(firstValue, secondValue, operator) {
        switch (operator) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '*':
                return firstValue * secondValue;
            case '/':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            default:
                return secondValue;
        }
    }

    // Update expression display
    updateExpression(operator) {
        const operatorSymbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };

        if (this.previousValue !== null) {
            this.expression = `${this.formatNumber(this.previousValue)} ${operatorSymbols[operator] || ''}`;
        }
    }

    // Format number for display
    formatNumber(num) {
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    // Get display value
    getDisplayValue() {
        const num = parseFloat(this.displayValue);
        if (isNaN(num)) return '0';

        // Handle very large or very small numbers
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
            return num.toExponential(6);
        }

        // Limit decimal places
        const formatted = parseFloat(num.toFixed(10)).toString();
        return this.formatNumber(parseFloat(formatted));
    }

    // Get expression
    getExpression() {
        return this.expression;
    }
}

// ============================================
// UI CONTROLLER
// ============================================

class CalculatorUI {
    constructor() {
        this.calculator = new Calculator();
        this.displayElement = document.getElementById('display');
        this.expressionElement = document.getElementById('expression');
        this.themeToggle = document.getElementById('themeToggle');

        this.initializeTheme();
        this.attachEventListeners();
        this.updateDisplay();
    }

    // Initialize theme from localStorage
    initializeTheme() {
        const savedTheme = localStorage.getItem('calculator-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Attach all event listeners
    attachEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                const number = button.getAttribute('data-number');
                this.handleNumberInput(number);
            });
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', () => {
                const operator = button.getAttribute('data-operator');
                this.handleOperator(operator);
            });
        });

        // Action buttons
        document.getElementById('clear').addEventListener('click', () => this.handleClear());
        document.getElementById('delete').addEventListener('click', () => this.handleDelete());
        document.getElementById('percent').addEventListener('click', () => this.handlePercent());
        document.getElementById('equals').addEventListener('click', () => this.handleEquals());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Handle number input
    handleNumberInput(number) {
        if (number === '.') {
            this.calculator.inputDecimal();
        } else {
            this.calculator.inputDigit(number);
        }
        this.updateDisplay();
        this.addButtonFeedback();
    }

    // Handle operator
    handleOperator(operator) {
        this.calculator.performOperation(operator);
        this.updateDisplay();
        this.addButtonFeedback();
    }

    // Handle clear
    handleClear() {
        this.calculator.clear();
        this.updateDisplay();
        this.addButtonFeedback();
    }

    // Handle delete
    handleDelete() {
        this.calculator.delete();
        this.updateDisplay();
        this.addButtonFeedback();
    }

    // Handle percentage
    handlePercent() {
        this.calculator.percentage();
        this.updateDisplay();
        this.addButtonFeedback();
    }

    // Handle equals
    handleEquals() {
        this.calculator.performOperation('=');
        this.calculator.expression = '';
        this.calculator.operator = null;
        this.calculator.previousValue = null;
        this.updateDisplay();
        this.addButtonFeedback();
    }

    // Update display
    updateDisplay() {
        this.displayElement.textContent = this.calculator.getDisplayValue();
        this.expressionElement.textContent = this.calculator.getExpression();
    }

    // Add visual feedback
    addButtonFeedback() {
        this.displayElement.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.displayElement.style.transform = 'scale(1)';
        }, 100);
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('calculator-theme', newTheme);
    }

    // Handle keyboard input
    handleKeyboard(e) {
        e.preventDefault();

        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumberInput(e.key);
        }

        // Decimal point
        if (e.key === '.' || e.key === ',') {
            this.handleNumberInput('.');
        }

        // Operators
        if (e.key === '+') this.handleOperator('+');
        if (e.key === '-') this.handleOperator('-');
        if (e.key === '*') this.handleOperator('*');
        if (e.key === '/') this.handleOperator('/');

        // Actions
        if (e.key === 'Enter' || e.key === '=') this.handleEquals();
        if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') this.handleClear();
        if (e.key === 'Backspace') this.handleDelete();
        if (e.key === '%') this.handlePercent();
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculatorUI = new CalculatorUI();

    // Add smooth transition to display
    const displayElement = document.getElementById('display');
    displayElement.style.transition = 'transform 0.1s ease';

    console.log('✨ Premium Calculator initialized successfully!');
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.btn')) {
        e.preventDefault();
    }
});

// Add touch feedback for mobile
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('touchstart', function () {
        this.style.transform = 'scale(0.95)';
    });

    button.addEventListener('touchend', function () {
        this.style.transform = '';
    });
});
