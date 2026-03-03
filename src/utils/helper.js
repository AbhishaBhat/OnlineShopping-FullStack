// This file contains utility functions that can be used throughout the application.

function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

module.exports = {
    formatCurrency,
    generateRandomId,
    isValidEmail
};