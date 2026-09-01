/**
 * Average Calculator - Main Script
 * Handles calculator functionality, input validation, and result display
 */

// DOM Elements
const calculatorForm = document.getElementById('calculatorForm');
const numbersInput = document.getElementById('numbersInput');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');

// Event Listeners
calculatorForm.addEventListener('submit', handleCalculate);
clearBtn.addEventListener('click', clearCalculator);
copyBtn.addEventListener('click', copyResult);

/**
 * Parse input string and extract valid numbers
 * Supports: commas, spaces, line breaks, decimals, negative numbers
 */
function parseNumbers(input) {
    if (!input || typeof input !== 'string') {
        return [];
    }

    // Replace line breaks and multiple spaces with commas
    let normalized = input
        .replace(/[\n\r]+/g, ',')
        .replace(/\s+/g, ',')
        .replace(/,+/g, ',');

    // Split by commas
    let parts = normalized.split(',');

    // Convert to numbers and filter valid values
    let numbers = parts
        .map(part => part.trim())
        .filter(part => part !== '')
        .map(part => parseFloat(part))
        .filter(num => !isNaN(num));

    return numbers;
}

/**
 * Validate the numbers array
 */
function validateNumbers(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return {
            valid: false,
            message: 'Please enter at least one valid number.'
        };
    }

    if (numbers.length < 2) {
        return {
            valid: false,
            message: 'Please enter at least two valid numbers to calculate an average.'
        };
    }

    // Check for infinite or extremely large numbers
    if (numbers.some(num => !isFinite(num))) {
        return {
            valid: false,
            message: 'Please enter valid numbers only.'
        };
    }

    return { valid: true };
}

/**
 * Calculate statistics
 */
function calculateStats(numbers) {
    const count = numbers.length;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / count;

    return {
        numbers: numbers,
        count: count,
        sum: sum,
        average: average
    };
}

/**
 * Format number for display
 */
function formatNumber(num) {
    // Handle special cases
    if (!isFinite(num)) {
        return 'Invalid';
    }

    // Check if number is integer or has decimals
    if (Number.isInteger(num)) {
        return num.toString();
    }

    // Format decimal numbers (max 10 decimal places, remove trailing zeros)
    const formatted = num.toFixed(10).replace(/\.?0+$/, '');
    return formatted;
}

/**
 * Handle form submission
 */
function handleCalculate(event) {
    event.preventDefault();

    // Clear previous error
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    // Get and parse input
    const input = numbersInput.value.trim();
    const numbers = parseNumbers(input);

    // Validate numbers
    const validation = validateNumbers(numbers);
    if (!validation.valid) {
        showError(validation.message);
        resultsSection.style.display = 'none';
        return;
    }

    // Calculate statistics
    const stats = calculateStats(numbers);

    // Display results
    displayResults(stats);
}

/**
 * Display error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

/**
 * Display results
 */
function displayResults(stats) {
    // Format numbers for display
    const numbersForDisplay = stats.numbers.map(formatNumber).join(', ');

    // Display numbers entered
    document.getElementById('numbersDisplay').textContent = numbersForDisplay;

    // Display count
    document.getElementById('countDisplay').textContent = stats.count;

    // Display sum
    document.getElementById('sumDisplay').textContent = formatNumber(stats.sum);

    // Display average
    document.getElementById('averageDisplay').textContent = formatNumber(stats.average);

    // Display calculation breakdown
    const breakdown = buildBreakdown(stats);
    document.getElementById('breakdownDisplay').innerHTML = breakdown;

    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide copy message if shown
    document.getElementById('copyMessage').style.display = 'none';
}

/**
 * Build calculation breakdown HTML
 */
function buildBreakdown(stats) {
    const { numbers, count, sum, average } = stats;

    // Format number string for display
    const numbersStr = numbers.map(formatNumber).join(' + ');

    // Build the calculation string
    const calculation = `(${numbersStr}) ÷ ${count} = ${formatNumber(sum)} ÷ ${count} = <strong>${formatNumber(average)}</strong>`;

    return `<p>${calculation}</p>`;
}

/**
 * Clear the calculator
 */
function clearCalculator() {
    numbersInput.value = '';
    numbersInput.focus();
    errorMessage.style.display = 'none';
    resultsSection.style.display = 'none';
    document.getElementById('copyMessage').style.display = 'none';
}

/**
 * Copy result to clipboard
 */
function copyResult() {
    const average = document.getElementById('averageDisplay').textContent;

    if (!average) {
        showError('No result to copy. Please calculate first.');
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(average)
        .then(() => {
            // Show success message
            const copyMessage = document.getElementById('copyMessage');
            copyMessage.style.display = 'block';

            // Hide message after 3 seconds
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 3000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            // Fallback: use execCommand (for older browsers)
            try {
                const textarea = document.createElement('textarea');
                textarea.value = average;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                const copyMessage = document.getElementById('copyMessage');
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 3000);
            } catch (fallbackErr) {
                showError('Could not copy to clipboard. Please try again.');
            }
        });
}

/**
 * Set active navigation link
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    numbersInput.focus();
});

/**
 * Handle Enter key in textarea
 * Shift+Enter creates new line, regular Enter submits (on last line with content)
 */
numbersInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        // Only submit if we're at the end or with modifier key
        if (event.ctrlKey) {
            event.preventDefault();
            calculatorForm.dispatchEvent(new Event('submit'));
        }
    }
});
