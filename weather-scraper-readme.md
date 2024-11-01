# BBC Weather Scraper

A TypeScript application that scrapes weather data from BBC Weather for specified cities. This utility provides a clean interface to fetch and parse weather forecasts, including temperature and weather conditions for up to 7 days.

## Features

- Fetch weather data for predefined cities
- Parse daily weather conditions including:
  - Temperature (high/low)
  - Weather forecast descriptions
  - Day information
- Support for multiple cities (Cairo, Mecca, Abu Dhabi, London, New York, Brasilia)
- Error handling for network and parsing issues
- TypeScript support with full type definitions

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm or yarn package manager
- TypeScript installed globally or as a dev dependency

## Installation

1. Clone the repository or copy the source files
2. Install dependencies:

```bash
npm install
# or
yarn install
```

Required dependencies:
```json
{
  "dependencies": {
    "axios": "^latest",
    "cheerio": "^latest"
  },
  "devDependencies": {
    "@types/cheerio": "^latest",
    "typescript": "^latest"
  }
}
```

## Usage

### Basic Usage

```typescript
import { BBCWeatherScraper, CITIES } from './weather-scraper';

// Fetch weather for a specific city
async function getWeather() {
  try {
    const weather = await BBCWeatherScraper.fetchCityWeather('london');
    console.log(weather);
  } catch (error) {
    console.error('Failed to fetch weather:', error);
  }
}
```

### Using the Logging Utility

```typescript
import { logWeatherForCity } from './weather-scraper';

// Log weather information in a formatted way
await logWeatherForCity('newYork');
```

### Available Cities

The following city codes are predefined:
- `cairo` - Cairo, Egypt
- `mecca` - Mecca, Saudi Arabia
- `abuDhabi` - Abu Dhabi, UAE
- `london` - London, UK
- `newYork` - New York, USA
- `brasilia` - Brasilia, Brazil

## API Reference

### BBCWeatherScraper

Static class providing weather scraping functionality.

#### Methods

`static async fetchCityWeather(cityCode: keyof typeof CITIES): Promise<CityWeatherReport>`
- Fetches and parses weather data for a specified city
- Returns a promise resolving to CityWeatherReport

### Types

```typescript
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
```

## Important Notes

1. **Web Scraping Considerations:**
   - This tool scrapes BBC Weather website. Always check the website's robots.txt and terms of service
   - Consider rate limiting requests to avoid overwhelming the server
   - The scraper might break if BBC changes their HTML structure

2. **Error Handling:**
   - Network errors are logged and thrown
   - Parsing errors are handled gracefully
   - Invalid city codes will result in errors

3. **Limitations:**
   - Only works with predefined cities
   - Temperature is in Celsius only
   - Limited to 7 days forecast

## Contributing

Feel free to contribute to this project by:
1. Forking the repository
2. Creating a feature branch
3. Making your changes
4. Submitting a pull request

## License

This project is open source and available under the MIT License.

## Disclaimer

This tool is for educational purposes only. Make sure to comply with BBC's terms of service and robots.txt before using this scraper. Consider using official weather APIs for production applications.
