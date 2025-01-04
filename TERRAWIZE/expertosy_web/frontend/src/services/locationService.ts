import axios from 'axios';

interface LocationData {
  country: string;
  city: string;
  region: string;
}

export const getLocationFromIP = async (): Promise<LocationData> => {
  try {
    // Using ipapi.co for IP geolocation (free tier available)
    const response = await axios.get('https://ipapi.co/json/');
    return {
      country: response.data.country_name,
      city: response.data.city,
      region: response.data.region
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
}; 