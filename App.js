import React, { useState, useEffect } from 'react';
import {
  View,Text,TextInput,TouchableOpacity,StyleSheet,
  SafeAreaView,ActivityIndicator,ScrollView,Image,RefreshControl
} from 'react-native';

import * as Location from 'expo-location';

import { WEATHER_API_KEY, BASE_URL } from './config';

export default function App() {

  const [city, setCity] = useState('Mumbai');

  const [weatherData, setWeatherData] = useState(null);

  const [forecastData, setForecastData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const fetchWeather = async (cityName) => {
  setLoading(true);
  setError(null);

  try {
    const url = `${BASE_URL}/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("City not found. Please check spelling.");
    }

    const data = await response.json();
    setWeatherData(data);
    fetchForecast(cityName);
  }
  catch (err) {
    setError(err.message);
    setWeatherData(null);
  }
  finally {
    setLoading(false);
  }

};

const getCurrentLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    setError('Location permission denied. Please search manually.');
    return;
  }

  let location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;
  fetchWeatherByCoords(latitude, longitude);

};

const fetchWeatherByCoords = async (lat, lon) => {
  setLoading(true);
  setError(null);
  try {
    const url =`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to fetch your location weather.");
    }

    const data = await response.json();
    setWeatherData(data);
    setCity(data.name);
    fetchForecast(data.name);
  }

  catch (err) {
    setError(err.message);
  }

  finally {
    setLoading(false);
  }

};

const fetchForecast = async (cityName) => {
  try {
    const url =`${BASE_URL}/forecast?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    setForecastData(data.list);
  } catch (err) {
    console.log(err);
  }
};

const onRefresh = async () => {
  setRefreshing(true);
  if (weatherData) {
    await fetchWeather(city);
  }
  setRefreshing(false);
};

useEffect(() => {
  fetchWeather(city);
}, []);

  return(
    <SafeAreaView style={styles.container}>
      <ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
  >
    
  <Text style={styles.title}>Weather Forecast</Text>
  <Text style={styles.subtitle}>Soft Nexis Internship</Text>
  <View style={styles.searchRow}>
    <TextInput
      style={styles.searchInput}
      placeholder="Enter city name..."
      value={city}
      onChangeText={setCity}
      onSubmitEditing={() => fetchWeather(city)}
    />
    <TouchableOpacity
      style={styles.searchButton}
      onPress={() => fetchWeather(city)}
    >
      <Text style={styles.searchButtonText}>
        Search
      </Text>
    </TouchableOpacity>
  </View>

  <TouchableOpacity
  style={styles.locationButton}
  onPress={getCurrentLocation}
>
  <Text style={styles.locationButtonText}>
    Use My Location
  </Text>
</TouchableOpacity>
  {loading && (

  <ActivityIndicator
    size="large"
    color="#0288D1"
    style={{ marginTop: 50 }}
  />

)}
{error && !loading && (

  <View style={styles.errorBox}>
    <Text style={styles.errorText}>
      {error}
    </Text>
  </View>

)}
{weatherData && !loading && !error && (

<View style={styles.weatherCard}>
<Text style={styles.cityName}>
{weatherData.name}
</Text>

<Text style={styles.temp}>
{Math.round(weatherData.main.temp)}°C
</Text>

<Image
  source={{
    uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
  }}
  style={styles.weatherIcon}
/>

<Text style={styles.condition}>
  {weatherData.weather[0].main} - {weatherData.weather[0].description}
</Text>

<View style={styles.detailsRow}>
<View style={styles.detailBox}>
<Text style={styles.detailLabel}>Feels Like</Text>
<Text style={styles.detailValue}>
{Math.round(weatherData.main.feels_like)}°C
</Text>
</View>

<View style={styles.detailBox}>
<Text style={styles.detailLabel}>Humidity</Text>
<Text style={styles.detailValue}>
{weatherData.main.humidity}%
</Text>
</View>
<View style={styles.detailBox}>
<Text style={styles.detailLabel}>Wind</Text>
<Text style={styles.detailValue}>
{weatherData.wind.speed} m/s
</Text>
</View>
</View>
</View>

)}

{forecastData.length > 0 && (

<View style={styles.forecastContainer}>

<Text style={styles.forecastTitle}>
5-Day Forecast
</Text>

<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
>
{forecastData
.filter((item) => item.dt_txt.includes("12:00:00"))
.map((item, index) => (

<View key={index} style={styles.forecastCard}>

<Text style={styles.forecastDay}>
{new Date(item.dt_txt).toLocaleDateString("en-US", {
weekday: "short",
})}
</Text>

<Text style={styles.forecastTemp}>
{Math.round(item.main.temp)}°C
</Text>

<Text style={styles.forecastWeather}>
{item.weather[0].main}
</Text>
</View>
))}
</ScrollView>
</View>

)}
</ScrollView>
</SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E1F5FE',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  searchRow: {
  flexDirection: 'row',
  marginTop: 20,
},

searchInput: {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: 8,
  paddingHorizontal: 15,
  paddingVertical: 12,
  fontSize: 16,
},

searchButton: {
  backgroundColor: '#0288D1',
  borderRadius: 8,
  paddingHorizontal: 18,
  justifyContent: 'center',
  marginLeft: 10,
},

searchButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
weatherCard: {
  backgroundColor: "#f5f7f8",
  borderRadius: 16,
  padding: 25,
  alignItems: "center",
  marginTop: 30,
  elevation: 4,
},

cityName: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#222",
},

temp: {
  fontSize: 60,
  fontWeight: "bold",
  color: "#0288D1",
  marginVertical: 10,
},

condition: {
  fontSize: 16,
  color: "#555",
  textTransform: "capitalize",
  marginBottom: 20,
},

detailsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
},

detailBox: {
  alignItems: "center",
},

detailLabel: {
  fontSize: 12,
  color: "#999",
},

detailValue: {
  fontSize: 18,
  fontWeight: "600",
  color: "#222",
},

errorBox: {
  backgroundColor: "#FFEBEE",
  borderRadius: 8,
  padding: 20,
  marginTop: 30,
},

errorText: {
  color: "#C62828",
  textAlign: "center",
  fontSize: 15,
},

locationButton: {
  backgroundColor: "#6A1B9A",
  borderRadius: 8,
  paddingVertical: 12,
  alignItems: "center",
  marginTop: 10,
  marginBottom: 10,
},

locationButtonText: {
  color: "#fff",
  fontWeight: "700",
},

forecastContainer: {
  marginTop: 20,
},

forecastTitle: {
  fontSize: 22,
  fontWeight: "bold",
  marginBottom: 15,
  color: "#222",
},

forecastCard: {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  padding: 15,
  marginRight: 12,
  width: 100,
  alignItems: "center",
  elevation: 3,
},

forecastDay: {
  fontSize: 15,
  fontWeight: "bold",
},

forecastTemp: {
  fontSize: 24,
  color: "#0288D1",
  marginVertical: 10,
},

forecastWeather: {
  fontSize: 13,
  textAlign: "center",
},

weatherIcon: {
  width: 100,
  height: 100,
  marginVertical: 10,
},
});