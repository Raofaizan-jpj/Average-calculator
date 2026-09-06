/**
 * Average Calculator - Interactive Logic
 * High-performance, client-side, zero-dependency calculation engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const numbersInput = document.getElementById('numbersInput');
    const calcForm = document.getElementById('calcForm');
    const calculateBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const loadExampleBtn = document.getElementById('loadExampleBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearToolbarBtn = document.getElementById('clearToolbarBtn');

    const inputCounter = document.getElementById('inputCounter');
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const resultsCard = document.getElementById('resultsCard');

    // Result Value Placeholders
    const resultAverage = document.getElementById('resultAverage');
    const resultSum = document.getElementById('resultSum');
    const resultCount = document.getElementById('resultCount');
    const resultMedian = document.getElementById('resultMedian');
    const resultMin = document.getElementById('resultMin');
    const resultMax = document.getElementById('resultMax');
    const resultRange = document.getElementById('resultRange');

    // Step-by-Step Breakdown Elements
    const stepNumbers = document.getElementById('stepNumbers');
    const stepSum = document.getElementById('stepSum');
    const stepCount = document.getElementById('stepCount');
    const stepAverage = document.getElementById('stepAverage');

    // Copy Buttons & Feedback
    const copyAvgBtn = document.getElementById('copyAvgBtn');
    const copyBreakdownBtn = document.getElementById('copyBreakdownBtn');
    const copyToast = document.getElementById('copyToast');

    // Current State Cache
    let currentCalculation = null;

    /**
     * Parse raw string input into numbers.
     * Supports commas, newlines, carriage returns, spaces, tabs, semicolons, and plus signs (+).
     * Automatically ignores trailing plus sign(s) such as "10+30+20+50+".
     */
    function parseInput(rawText) {
        if (!rawText || typeof rawText !== 'string') {
            return { validNumbers: [], invalidTokens: [] };
        }

        let cleaned = rawText.trim();
        if (!cleaned) {
            return { validNumbers: [], invalidTokens: [] };
        }

        // Automatically ignore trailing plus sign(s) and any trailing delimiters/whitespace
        // Handles inputs like "10+30+20+50+", "10 + 20 + ", "10+20+++", etc.
        cleaned = cleaned.replace(/(?:\s*[\+,\s;]+\s*)*\+[\s+,;]*$/, '').trim();
        // Also trim any remaining trailing delimiters (commas, semicolons, spaces)
        cleaned = cleaned.replace(/[,;\s]+$/, '').trim();

        if (!cleaned) {
            return { validNumbers: [], invalidTokens: [] };
        }

        // Split by commas, semicolons, tabs, newlines, spaces, or plus signs (+)
        // Keep negative numbers intact (e.g. 10 + -5 -> tokens: 10, -5)
        const tokens = cleaned
            .split(/[\r\n\t,;\s]+|\+/)
            .map(token => token.trim())
            .filter(token => token.length > 0);

        const validNumbers = [];
        const invalidTokens = [];

        for (const token of tokens) {
            // Check if string is a valid numeric representation
            // Handles integers, negative numbers, floats (e.g. -12.4, 0.5, .75)
            const num = Number(token);

            if (!isNaN(num) && isFinite(num) && token !== '') {
                validNumbers.push(num);
            } else {
                invalidTokens.push(token);
            }
        }

        return { validNumbers, invalidTokens };
    }

    /**
     * Format a floating point or integer number cleanly without floating-point artifacts.
     */
    function formatNumber(val, maxDecimals = 6) {
        if (!isFinite(val)) return 'Invalid';
        if (Number.isInteger(val)) return val.toLocaleString();

        // Round cleanly to maxDecimals and trim unnecessary trailing zeros
        const factor = Math.pow(10, maxDecimals);
        const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
        return rounded.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: maxDecimals
        });
    }

    /**
     * Calculate statistical metrics
     */
    function calculateStats(numbers) {
        if (!numbers || numbers.length === 0) return null;

        const count = numbers.length;
        const sum = numbers.reduce((acc, curr) => acc + curr, 0);
        const average = sum / count;

        const sorted = [...numbers].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const range = max - min;

        let median;
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            median = (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            median = sorted[mid];
        }

        return {
            numbers,
            sorted,
            count,
            sum,
            average,
            median,
            min,
            max,
            range
        };
    }

    /**
     * Show validation error alert
     */
    function showError(msg) {
        if (!alertBox || !alertMessage) return;
        alertMessage.textContent = msg;
        alertBox.style.display = 'block';
        if (resultsCard) {
            resultsCard.style.display = 'none';
        }
    }

    /**
     * Hide validation error alert
     */
    function hideError() {
        if (!alertBox) return;
        alertBox.style.display = 'none';
    }

    /**
     * Display calculation results and step-by-step breakdown
     */
    function renderResults(stats) {
        if (!stats) return;
        currentCalculation = stats;
        hideError();

        // Primary Hero Average
        resultAverage.textContent = formatNumber(stats.average, 6);

        // Secondary Stat Cards
        resultSum.textContent = formatNumber(stats.sum, 6);
        resultCount.textContent = stats.count.toLocaleString();
        if (resultMedian) resultMedian.textContent = formatNumber(stats.median, 6);
        if (resultMin) resultMin.textContent = formatNumber(stats.min, 6);
        if (resultMax) resultMax.textContent = formatNumber(stats.max, 6);
        if (resultRange) resultRange.textContent = formatNumber(stats.range, 6);

        // Step-by-Step Breakdown
        // 1. Numbers display
        const displayLimit = 25;
        let numbersString = '';
        if (stats.numbers.length <= displayLimit) {
            numbersString = stats.numbers.map(n => formatNumber(n)).join(', ');
        } else {
            const firstPart = stats.numbers.slice(0, 15).map(n => formatNumber(n)).join(', ');
            const lastPart = stats.numbers.slice(-5).map(n => formatNumber(n)).join(', ');
            numbersString = `${firstPart}, ... [${stats.numbers.length - 20} more values] ..., ${lastPart}`;
        }
        stepNumbers.textContent = numbersString;

        // 2. Sum Expression
        let sumExpr = '';
        if (stats.numbers.length <= 10) {
            sumExpr = stats.numbers.map(n => (n < 0 ? `(${n})` : `${n}`)).join(' + ') + ` = ${formatNumber(stats.sum)}`;
        } else {
            const sample = stats.numbers.slice(0, 5).map(n => (n < 0 ? `(${n})` : `${n}`)).join(' + ');
            sumExpr = `${sample} + ... (${stats.count} values) = ${formatNumber(stats.sum)}`;
        }
        stepSum.textContent = sumExpr;

        // 3. Count
        stepCount.textContent = `${stats.count} values`;

        // 4. Division step
        stepAverage.textContent = `${formatNumber(stats.sum)} ÷ ${stats.count} = ${formatNumber(stats.average, 6)}`;

        // Show Results Card
        resultsCard.style.display = 'block';

        // Smooth scroll to results on mobile/small screens if needed
        if (window.innerWidth < 768) {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * Primary calculate execution
     */
    function executeCalculation() {
        const rawText = numbersInput.value.trim();

        if (!rawText) {
            showError('Please enter some numbers to calculate the average.');
            numbersInput.focus();
            return;
        }

        const { validNumbers, invalidTokens } = parseInput(rawText);

        if (invalidTokens.length > 0) {
            const preview = invalidTokens.slice(0, 4).map(t => `"${t}"`).join(', ');
            const more = invalidTokens.length > 4 ? ` and ${invalidTokens.length - 4} other non-numeric items` : '';
            showError(`Invalid input detected: ${preview}${more}. Please ensure only numbers are entered.`);
            return;
        }

        if (validNumbers.length === 0) {
            showError('No valid numbers were found. Please enter numerical values separated by commas, spaces, line breaks, or plus signs (+).');
            return;
        }

        const stats = calculateStats(validNumbers);
        renderResults(stats);
    }

    /**
     * Clear all fields and reset state
     */
    function clearAll() {
        numbersInput.value = '';
        hideError();
        resultsCard.style.display = 'none';
        currentCalculation = null;
        updateLiveCounter();
        numbersInput.focus();
    }

    /**
     * Load realistic example dataset
     */
    function loadExample() {
        const examples = [
            '10 + 30 + 20 + 50',
            '10, 20, 30, 40, 50',
            '15.5, 24.2, 38.0, 42.75, 56.1',
            '85, 92, 78, 95, 88, 76, 89',
            '12, -4, 18, 25, -2, 30'
        ];
        // Cycle or pick
        const sample = examples[Math.floor(Math.random() * examples.length)];
        numbersInput.value = sample;
        updateLiveCounter();
        executeCalculation();
    }

    /**
     * Update live status counter under textarea
     */
    function updateLiveCounter() {
        const rawText = numbersInput.value;
        if (!rawText.trim()) {
            inputCounter.textContent = '0 numbers entered';
            return;
        }

        const { validNumbers } = parseInput(rawText);
        const count = validNumbers.length;
        inputCounter.textContent = `${count} number${count === 1 ? '' : 's'} detected`;
    }

    /**
     * Paste from clipboard with permission handling
     */
    async function pasteFromClipboard() {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    if (numbersInput.value.trim().length > 0) {
                        numbersInput.value += `\n${text}`;
                    } else {
                        numbersInput.value = text;
                    }
                    updateLiveCounter();
                    executeCalculation();
                }
            } else {
                numbersInput.focus();
                showError('Clipboard paste access is not supported by your browser. Please use Ctrl+V / Cmd+V directly in the box.');
            }
        } catch (err) {
            numbersInput.focus();
            showError('Could not read from clipboard. Please paste manually into the text box using Ctrl+V or Cmd+V.');
        }
    }

    /**
     * Copy text to clipboard helper
     */
    function copyToClipboard(text, confirmationMsg = 'Copied!') {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);
            showToast(confirmationMsg);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast(confirmationMsg);
        }).catch(() => {
            showToast('Unable to copy.');
        });
    }

    /**
     * Show toast message
     */
    function showToast(msg) {
        if (!copyToast) return;
        copyToast.textContent = `✓ ${msg}`;
        copyToast.style.display = 'inline-flex';
        setTimeout(() => {
            copyToast.style.display = 'none';
        }, 2200);
    }

    // Event Listeners
    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();
            executeCalculation();
        });
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            executeCalculation();
        });
    }

    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (clearToolbarBtn) clearToolbarBtn.addEventListener('click', clearAll);
    if (loadExampleBtn) loadExampleBtn.addEventListener('click', loadExample);
    if (pasteBtn) pasteBtn.addEventListener('click', pasteFromClipboard);

    // Live typing listener
    if (numbersInput) {
        numbersInput.addEventListener('input', updateLiveCounter);

        // Keyboard shortcuts: Enter or Ctrl+Enter to calculate, Esc to clear
        numbersInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                executeCalculation();
            } else if (e.key === 'Escape') {
                clearAll();
            }
        });
    }

    // Copy Average Only
    if (copyAvgBtn) {
        copyAvgBtn.addEventListener('click', () => {
            if (currentCalculation) {
                copyToClipboard(formatNumber(currentCalculation.average, 6), 'Average copied!');
            }
        });
    }

    // Copy Full Breakdown
    if (copyBreakdownBtn) {
        copyBreakdownBtn.addEventListener('click', () => {
            if (currentCalculation) {
                const summary = [
                    `Average Calculator Summary`,
                    `-------------------------`,
                    `Values: ${currentCalculation.numbers.join(', ')}`,
                    `Sum: ${currentCalculation.numbers.join(' + ')} = ${formatNumber(currentCalculation.sum)}`,
                    `Count: ${currentCalculation.count}`,
                    `Formula: Average = Sum ÷ Count`,
                    `Average: ${formatNumber(currentCalculation.sum)} ÷ ${currentCalculation.count} = ${formatNumber(currentCalculation.average, 6)}`,
                    `-------------------------`,
                    `Calculated at: https://average-calculator-bay.vercel.app/`
                ].join('\n');
                copyToClipboard(summary, 'Full breakdown copied!');
            }
        });
    }

    // Initialize counter
    updateLiveCounter();
});
