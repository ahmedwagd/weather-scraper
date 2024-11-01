/**
 * @fileoverview BBC Weather Scraper Module
 * A TypeScript module for scraping weather data from the BBC Weather website.
 * Implements a class-based approach with error handling and type safety.
 */

import * as cheerio from 'cheerio';
import axios from 'axios';

/**
 * Base URL for the BBC Weather service
 * @constant {string}
 */
const BBC_WEATHER_BASE_URL = "https://www.bbc.com/weather/";

/**
 * Mapping of city names to their BBC Weather location codes
 * @constant {Object}
 * @readonly
 */
const CITIES = {
  cairo: '360630',
  mecca: '104515',
  abuDhabi: '292968',
  london: "2643743",
  newYork: "5128581",
  brasilia: "3469058"
} as const;

/**
 * Represents the weather conditions for a single day
 * @typedef {Object} WeatherCondition
 * @property {string} day - The name of the day
 * @property {string} shortForecast - Brief description of weather conditions
 * @property {string} temperature - Raw temperature string from BBC
 * @property {string} highTemp - Highest temperature for the day
 * @property {string} lowTemp - Lowest temperature for the day
 */
type WeatherCondition = {
  day: string;
  shortForecast: string;
  temperature: string;
  highTemp: string;
  lowTemp: string;
}

/**
 * Represents a complete weather report for a city
 * @typedef {Object} CityWeatherReport
 * @property {string} city - Name of the city
 * @property {WeatherCondition[]} weekList - Array of daily weather conditions
 */
type CityWeatherReport = {
  city: string;
  weekList: WeatherCondition[];
}

/**
 * Class responsible for scraping and parsing weather data from BBC Weather
 * @class BBCWeatherScraper
 * @static
 */
class BBCWeatherScraper {
  /**
   * CSS selectors used for scraping weather data
   * @private
   * @static
   */
  private static SELECTORS = {
    locationName: '#wr-location-name-id',
    dayCarousel: 'ol.wr-day-carousel__list li',
    dayTitle: (index: number) => `a#daylink-${index} div.wr-day__title`,
    forecastDescription: (index: number) =>
      `a#daylink-${index} div.wr-day__content__weather-type-description--opaque`,
    temperature: (index: number) => `a#daylink-${index} span.wr-value--temperature--c`
  };

  /**
   * Fetches and parses weather data for a specified city
   * @static
   * @param {keyof typeof CITIES} cityCode - City code from CITIES object
   * @returns {Promise<CityWeatherReport>} Parsed weather report
   * @throws {Error} When network request fails or parsing encounters an error
   * 
   * @example
   * const londonWeather = await BBCWeatherScraper.fetchCityWeather('london');
   * console.log(londonWeather.city); // "London"
   * console.log(londonWeather.weekList[0].highTemp); // "20"
   */
  static async fetchCityWeather(cityCode: keyof typeof CITIES): Promise<CityWeatherReport> {
    try {
      const url = `${BBC_WEATHER_BASE_URL}${CITIES[cityCode]}`;
      const response = await axios.get(url);
      return this.parseWeatherData(response.data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Parses raw HTML to extract weather information
   * @private
   * @static
   * @param {string} html - Raw HTML content from BBC Weather
   * @returns {CityWeatherReport} Parsed weather report
   */
  private static parseWeatherData(html: string): CityWeatherReport {
    const $ = cheerio.load(html);
    const cityName = this.extractCityName($);
    const weekList = this.extractWeeklyForecast($);
    return { city: cityName, weekList };
  }

  /**
   * Extracts city name from the page
   * @private
   * @static
   * @param {cheerio.Root} $ - Cheerio loaded document
   * @returns {string} Extracted city name
   */
  private static extractCityName($: cheerio.Root): string {
    const fullLocationText = $(this.SELECTORS.locationName).text().trim();
    return fullLocationText.split(' - ')[0] || fullLocationText;
  }

  /**
   * Extracts weekly forecast details
   * @private
   * @static
   * @param {cheerio.Root} $ - Cheerio loaded document
   * @returns {WeatherCondition[]} Array of daily weather conditions
   */
  private static extractWeeklyForecast($: cheerio.Root): WeatherCondition[] {
    return $(this.SELECTORS.dayCarousel)
      .map((index, element) => {
        if (index >= 7) return null;
        const $elem = $(element);
        return this.extractDayDetails($elem, index);
      })
      .get()
      .filter((day): day is WeatherCondition => day !== null);
  }

  /**
   * Extracts weather details for a single day
   * @private
   * @static
   * @param {cheerio.Cheerio} $elem - Cheerio element for the day
   * @param {number} index - Day index
   * @returns {WeatherCondition} Weather condition for the day
   */
  private static extractDayDetails($elem: cheerio.Cheerio, index: number): WeatherCondition {
    const day = $elem.find(this.SELECTORS.dayTitle(index)).text().trim();
    const shortForecast = $elem.find(this.SELECTORS.forecastDescription(index)).text().trim();
    const temperature = $elem.find(this.SELECTORS.temperature(index)).text().trim();

    return {
      day,
      shortForecast,
      temperature,
      ...this.parseTemperature(temperature, index)
    };
  }

  /**
   * Parses temperature string into high and low values
   * @private
   * @static
   * @param {string} tempText - Temperature string
   * @param {number} index - Day index
   * @returns {{ highTemp: string; lowTemp: string }} Parsed temperatures
   */
  private static parseTemperature(tempText: string, index: number): {
    highTemp: string;
    lowTemp: string
  } {
    if (!tempText) return { highTemp: '', lowTemp: '' };

    return index === 0
      ? {
        highTemp: tempText.slice(0, 3),
        lowTemp: tempText.slice(0, 3)
      }
      : {
        highTemp: tempText.slice(0, 3),
        lowTemp: tempText.slice(3) || tempText.slice(0, 3)
      };
  }

  /**
   * Handles and logs different types of errors
   * @private
   * @static
   * @param {unknown} error - Error object
   */
  private static handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      console.error('Network Error:', error.message);
    } else if (error instanceof Error) {
      console.error('Parsing Error:', error.message);
    } else {
      console.error('Unknown Error:', error);
    }
  }
}

/**
 * Utility function to demonstrate weather data fetching and logging
 * @async
 * @param {keyof typeof CITIES} cityCode - City code from CITIES object
 * @returns {Promise<void>}
 * 
 * @example
 * await logWeatherForCity('london');
 * // Logs formatted weather report for London
 */
async function logWeatherForCity(cityCode: keyof typeof CITIES) {
  try {
    const weatherReport = await BBCWeatherScraper.fetchCityWeather(cityCode);
    console.log('Weather Report:', JSON.stringify(weatherReport, null, 2));

    const firstDay = weatherReport.weekList[0];
    console.log(`
      City: ${weatherReport.city}
      Today's Forecast: ${firstDay.shortForecast}
      High: ${firstDay.highTemp}°C
      Low: ${firstDay.lowTemp}°C
    `);
  } catch (error) {
    console.error(`Failed to fetch weather for ${cityCode}:`, error);
  }
}

export {
  BBCWeatherScraper,
  logWeatherForCity,
  CITIES
};