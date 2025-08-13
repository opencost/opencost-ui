import { get } from "lodash";
import { DEFAULT_CURRENCY } from "../constants/defaults";

const PRIMARY_API_BASE_URL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/`;
const BACKUP_API_BASE_URL = `https://latest.currency-api.pages.dev/v1/currencies/`;

/**
 * Fetches a currency conversion rate from a given API URL with retry logic.
 *
 * @param {string} apiUrl The full URL for the API call (e.g., for 'usd' rates).
 * @param {string} baseCurrency The currency code of the base (source) currency (lowercased).
 * @param {string} targetCurrency The currency code of the target (destination) currency (lowercased).
 * @returns {Promise<number|null>} The conversion rate as a number, or null if fetching failed.
 */
async function fetchRate(apiUrl, baseCurrency, targetCurrency) {
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // The API response structure is `{"date": "...", "eur": {"usd": 1.09, ...}}`
        // We need to access `data[baseCurrency][targetCurrency]`
        const rate = get(data, `${baseCurrency}.${targetCurrency}`);

        if (typeof rate === 'number' && rate > 0) {
            return rate;
        } else {
            console.warn(`Rate for ${baseCurrency} to ${targetCurrency} not found or invalid in response from: ${apiUrl}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch rate from ${apiUrl}:`, error.message);
        return null;
    }
}

/**
 * Converts an amount from a current currency to a new currency using two API sources.
 * If direct conversion fails, it attempts to convert to a default currency.
 *
 * @param {string} baseCurrency The original currency code (e.g., "usd").
 * @param {string} targetCurrency The desired target currency code (e.g., "eur").
 * @returns {Promise<number|null>} The conversion rate as a number, or null if all attempts fail.
 */
export async function getCurrencyConversionRate(baseCurrency, targetCurrency) {
    const lowerBase = baseCurrency.toLowerCase();
    const lowerTarget = targetCurrency.toLowerCase();
    const lowerDefault = DEFAULT_CURRENCY.toLowerCase();

    // Attempt 1: Primary API, direct conversion
    let rate = await fetchRate(`${PRIMARY_API_BASE_URL}${lowerBase}.json`, lowerBase, lowerTarget);

    if (rate === null) {
        // Attempt 2: Backup API, direct conversion
        console.warn('Primary API failed. Attempting backup API.');
        rate = await fetchRate(`${BACKUP_API_BASE_URL}${lowerBase}.json`, lowerBase, lowerTarget);
    }
    
    // If the rate is found, return it
    if (rate !== null) {
        return rate;
    }

    // --- Fallback Logic ---
    // If direct conversion failed, try to convert to the default currency
    console.warn(`Direct conversion from ${lowerBase} to ${lowerTarget} failed. Attempting fallback conversion to ${lowerDefault}.`);

    if (lowerBase === lowerDefault) {
        console.error('Conversion failed and base currency is already the default. Cannot perform fallback.');
        return null;
    }

    // Attempt 3: Primary API, fallback to default currency
    rate = await fetchRate(`${PRIMARY_API_BASE_URL}${lowerBase}.json`, lowerBase, lowerDefault);
    
    if (rate === null) {
        // Attempt 4: Backup API, fallback to default currency
        console.warn('Primary API for fallback failed. Attempting backup API.');
        rate = await fetchRate(`${BACKUP_API_BASE_URL}${lowerBase}.json`, lowerBase, lowerDefault);
    }
    
    if (rate !== null) {
        console.warn(`Fallback conversion to ${lowerDefault} successful.`);
    }

    // If all attempts fail, rate will be null.
    return rate;
}