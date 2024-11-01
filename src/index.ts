/**
 * @fileoverview Entry point for the BBC Weather Scraping application
 * Demonstrates the usage of the BBCWeatherScraper module
 */

import { logWeatherForCity } from "./services/BBCWeatherScraper";

/**
 * Main application function that initiates weather data fetching
 * @async
 * @function Main
 * @param {...any} args - Command line arguments (currently unused)
 * @returns {Promise<void>}
 * 
 * @example
 * // Run the application
 * Main();
 * 
 * // Example output:
 * // Weather Report: {
 * //   "city": "New York",
 * //   "weekList": [
 * //     {
 * //       "day": "Today",
 * //       "shortForecast": "Sunny",
 * //       "temperature": "25°C",
 * //       "highTemp": "25",
 * //       "lowTemp": "25"
 * //     },
 * //     ...
 * //   ]
 * // }
 */
async function Main(...args: any): Promise<void> {
  await logWeatherForCity('newYork');
}

// Execute the main function
Main();