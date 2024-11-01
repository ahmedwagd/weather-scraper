import { logWeatherForCity } from "./services/BBCWeatherScraper";

async function Main(...args: any): Promise<void> {
  await logWeatherForCity('newYork');
}

Main();