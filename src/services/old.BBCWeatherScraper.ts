import * as cheerio from 'cheerio';
import axios from 'axios';


const urlBBC = "https://www.bbc.com/weather/";

const CITIES = {
  cairo: '360630',
  mecca: '104515',
  abuDhabi: '292968',
  london: "2643743",
  newYork: "5128581",
  brasilia: "3469058"
} as const;

type TDayDetails = {
  day: string,
  shortForecast: string,
  temperature: string,
  highTemp: string,
  lowTemp: string
}
type TCityData = {
  city: string,
  weekList: TDayDetails[]
}


export async function getCairoWeather() {
  try {
    const response = await axios.get(urlBBC + CITIES.abuDhabi);
    const $ = cheerio.load(response.data)
    // let city, day, shortForecast, temperature, highTemp, lowTemp;
    let details: TCityData = {
      city: '',
      weekList: []
    };
    let cityAndShortForecast = await $('#wr-location-name-id').text().trim().split(' - ');
    details.city = await cityAndShortForecast[0];
    const weekList = $('ol.wr-day-carousel__list li')
      .map(function (this: cheerio.Element, i) {
        if (i >= 7) return null;
        const $elem = $(this);
        const tempText = $elem.find(`a#daylink-${i} span.wr-value--temperature--c`).text().trim();
        const dayDetails: TDayDetails = {
          day: $elem.find(`a#daylink-${i} div.wr-day__title`).text().trim(),
          shortForecast: $elem.find(`a#daylink-${i} div.wr-day__content__weather-type-description--opaque`).text().trim(),
          temperature: tempText,
          highTemp: '',
          lowTemp: ''
        };
        if (tempText) {
          dayDetails.highTemp = tempText.slice(0, 3);
          dayDetails.lowTemp = i === 0
            ? dayDetails.highTemp
            : tempText.slice(3) || dayDetails.highTemp;
        }

        return dayDetails;
      })
      .get()
      .filter((day): day is TDayDetails => day !== null);

    details.weekList = weekList;
    console.log("City: ", details.city, "\t", details.weekList[0].highTemp)
    console.log("Hight: ", details.weekList[0].highTemp, "Low: ", details.weekList[0].lowTemp,)
    return details;
  } catch (error) {
    console.error("ERROR", error)
  }

}