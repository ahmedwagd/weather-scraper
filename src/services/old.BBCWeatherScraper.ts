/**
 * @fileoverview BBC Weather Scraper Module
 * This module provides functionality to scrape weather data from BBC Weather website
 * for specific cities using Cheerio for HTML parsing and Axios for HTTP requests.
 */

import * as cheerio from 'cheerio';
import axios from 'axios';

/** Base URL for BBC weather service */
const urlBBC = "https://www.bbc.com/weather/";

/**
 * Map of city names to their BBC Weather location IDs
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
 * Represents detailed weather information for a single day
 * @typedef {Object} TDayDetails
 * @property {string} day - Name of the day
 * @property {string} shortForecast - Brief weather description
 * @property {string} temperature - Full temperature string
 * @property {string} highTemp - Highest temperature for the day
 * @property {string} lowTemp - Lowest temperature for the day
 */
type TDayDetails = {
  day: string,
  shortForecast: string,
  temperature: string,
  highTemp: string,
  lowTemp: string
}

/**
 * Represents weather data for a city including a week's forecast
 * @typedef {Object} TCityData
 * @property {string} city - Name of the city
 * @property {TDayDetails[]} weekList - Array of daily weather details
 */
type TCityData = {
  city: string,
  weekList: TDayDetails[]
}

/**
 * Fetches and parses weather data for Abu Dhabi from BBC Weather
 * @async
 * @function getCairoWeather
 * @returns {Promise<TCityData|undefined>} Object containing city name and weekly forecast data,
 *                                        or undefined if an error occurs
 * 
 * @example
 * try {
 *   const weatherData = await getCairoWeather();
 *   console.log(weatherData?.city);
 *   console.log(weatherData?.weekList[0].highTemp);
 * } catch (error) {
 *   console.error("Failed to fetch weather data:", error);
 * }
 * 
 * @throws {Error} When network request fails or HTML parsing encounters an error
 */
export async function getCairoWeather() {
  try {
    // Fetch HTML content from BBC Weather
    const response = await axios.get(urlBBC + CITIES.abuDhabi);
    const $ = cheerio.load(response.data)

    // Initialize weather details object
    let details: TCityData = {
      city: '',
      weekList: []
    };

    // Extract city name and current forecast
    let cityAndShortForecast = await $('#wr-location-name-id').text().trim().split(' - ');
    details.city = await cityAndShortForecast[0];

    // Parse weekly forecast data
    const weekList = $('ol.wr-day-carousel__list li')
      .map(function (this: cheerio.Element, i) {
        // Limit to 7 days of forecast
        if (i >= 7) return null;

        const $elem = $(this);
        const tempText = $elem.find(`a#daylink-${i} span.wr-value--temperature--c`).text().trim();

        // Create daily weather details object
        const dayDetails: TDayDetails = {
          day: $elem.find(`a#daylink-${i} div.wr-day__title`).text().trim(),
          shortForecast: $elem.find(`a#daylink-${i} div.wr-day__content__weather-type-description--opaque`).text().trim(),
          temperature: tempText,
          highTemp: '',
          lowTemp: ''
        };

        // Parse temperature values
        if (tempText) {
          dayDetails.highTemp = tempText.slice(0, 3);
          // For current day, low temp equals high temp
          dayDetails.lowTemp = i === 0
            ? dayDetails.highTemp
            : tempText.slice(3) || dayDetails.highTemp;
        }

        return dayDetails;
      })
      .get()
      .filter((day): day is TDayDetails => day !== null);

    details.weekList = weekList;

    // Log current weather information
    console.log("City: ", details.city, "\t", details.weekList[0].highTemp)
    console.log("Hight: ", details.weekList[0].highTemp, "Low: ", details.weekList[0].lowTemp,)

    return details;
  } catch (error) {
    console.error("ERROR", error)
  }
}