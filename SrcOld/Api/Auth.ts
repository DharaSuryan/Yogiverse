import axios from 'axios';

const API_BASE_URL = 'https://pashuahar.com/';

export const fetchCountries = async () => {
  try {
    let page = 1;
    let allCountries = [];
    
    while (true) {
      const response = await axios.get('https://pashuahar.com/api/v1/helper_app/countries', {
        params: { page, row_per_page: 50 }
      });
      
      allCountries = [...allCountries, ...response.data.data];
      if (response.data.data.length < 50) break;
      page++;
    }
    
    return {
      data: allCountries.map(country => ({
        id: country.id,
        name: country.country_name,
        calling_code: country.calling_code,
        states: country.all_state || []
      }))
    };
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const fetchStates = async (countryId: string) => {
  try {
    const response = await axios.get(`https://pashuahar.com/api/v1/helper_app/states/${countryId}`);
    return {
      data: response.data.data.map(state => ({
        id: state.id,
        name: state.state_name,
        cities: state.all_city || []
      }))
    };
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

export const fetchCities = async (stateId: string) => {
  try {
    const response = await axios.get(`https://pashuahar.com/api/v1/helper_app/cities/${stateId}`);
    return {
      data: response.data.data.map(city => ({
        id: city.id,
        name: city.city_name
      }))
    };
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

// export const registerUser = async (userData: FormData) => {
//   try {
//     const response = await axios.post('https://pashuahar.com/api/v1/register', userData);
//     return response;
//   } catch (error) {
//     console.error('Error registering user:', error);
//     throw error;
//   }
// };
