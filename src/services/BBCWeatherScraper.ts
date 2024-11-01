import * as cheerio from 'cheerio';
import axios from 'axios';

// Configuration
const BBC_WEATHER_BASE_URL = "https://www.bbc.com/weather/";
const CITIES = {
  cairo: '360630',
  mecca: '104515',
  abuDhabi: '292968',
  london: "2643743",
  newYork: "5128581",
  brasilia: "3469058"
} as const;

// Types
type WeatherCondition = {
  day: string;
  shortForecast: string;
  temperature: string;
  highTemp: string;
  lowTemp: string;
}

type CityWeatherReport = {
  city: string;
  weekList: WeatherCondition[];
}

// Weather Scraper Class
class BBCWeatherScraper {
  private static SELECTORS = {
    locationName: '#wr-location-name-id',
    dayCarousel: 'ol.wr-day-carousel__list li',
    dayTitle: (index: number) => `a#daylink-${index} div.wr-day__title`,
    forecastDescription: (index: number) => `a#daylink-${index} div.wr-day__content__weather-type-description--opaque`,
    temperature: (index: number) => `a#daylink-${index} span.wr-value--temperature--c`
  };

  /**
   * Fetch and parse weather data for a specific city
   * @param cityCode City code from CITIES object
   * @returns Parsed weather report
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
   * Parse HTML to extract weather information
   * @param html Raw HTML content
   * @returns Parsed weather report
   */
  private static parseWeatherData(html: string): CityWeatherReport {
    const $ = cheerio.load(html);

    const cityName = this.extractCityName($);
    const weekList = this.extractWeeklyForecast($);

    return { city: cityName, weekList };
  }

  /**
   * Extract city name from the page
   * @param $ Cheerio loaded document
   * @returns Extracted city name
   */
  private static extractCityName($: cheerio.Root): string {
    const fullLocationText = $(this.SELECTORS.locationName).text().trim();
    return fullLocationText.split(' - ')[0] || fullLocationText;
  }

  /**
   * Extract weekly forecast details
   * @param $ Cheerio loaded document
   * @returns Array of daily weather conditions
   */
  private static extractWeeklyForecast($: cheerio.Root): WeatherCondition[] {
    return $(this.SELECTORS.dayCarousel)
      .map((index, element) => {
        if (index >= 7) return null; // Limit to 7 days

        const $elem = $(element);
        return this.extractDayDetails($elem, index);
      })
      .get()
      .filter((day): day is WeatherCondition => day !== null);
  }

  /**
   * Extract details for a single day
   * @param $elem Cheerio element for the day
   * @param index Day index
   * @returns Weather condition for the day
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
   * Parse temperature into high and low
   * @param tempText Temperature string
   * @param index Day index
   * @returns Object with highTemp and lowTemp
   */
  private static parseTemperature(tempText: string, index: number): { highTemp: string; lowTemp: string } {
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
   * Handle and log errors
   * @param error Error object
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

// Utility for logging and demonstration
async function logWeatherForCity(cityCode: keyof typeof CITIES) {
  try {
    const weatherReport = await BBCWeatherScraper.fetchCityWeather(cityCode);
    console.log('Weather Report:', JSON.stringify(weatherReport, null, 2));

    // Optional: Additional logging
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