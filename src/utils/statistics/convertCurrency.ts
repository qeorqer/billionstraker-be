import axios from 'axios';
import Decimal from 'decimal.js';

const endpointBaseApi =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/';

export const convertCurrency = async (
  currencyToConvert: string,
  currencyToConvertFrom: string,
  value: number,
): Promise<number> => {
  try {
    const convertApiRoute = `${endpointBaseApi}${currencyToConvertFrom}/${currencyToConvert}.json`;
    const rateForOneResponse = await axios.get(convertApiRoute);
    const rateForOne = rateForOneResponse.data[currencyToConvert];

    return Number(Decimal.mul(rateForOne, value).toFixed(2));
  } catch (e) {
    try {
      // In case first request fails, which happens sometimes, use another which is more stable
      const singleCurrencyRoute = `${endpointBaseApi}${currencyToConvertFrom}.json`;
      const singleCurrencyResponse = await axios.get(singleCurrencyRoute);
      const rateForOne =
        singleCurrencyResponse.data[currencyToConvertFrom][currencyToConvert];

      return Number(Decimal.mul(rateForOne, value).toFixed(2));
    } catch (error) {
      console.log(error);
      return 0;
    }
  }
};
