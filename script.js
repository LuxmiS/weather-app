// API key from OpenWeatherMap
// API configuration is loaded from config.js (not tracked in Git)
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get elements from the DOM (document object manager)
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');

// Add event listener to search button
searchBtn.addEventListener('click', getWeather);

// Also allow Enter key to trigger search
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Function to fetch weather data
async function getWeather() {
    const city = cityInput.value.trim();
    
    // Validate input
    if (city === '') {
        weatherDisplay.innerHTML = '<p style="color: red;">Please enter a city name</p>';
        return;
    }
    
    // Show loading message
    weatherDisplay.innerHTML = '<p>Loading...</p>';
    
try {
        const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling.');
        }
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather data. Please try again.');
        }
        
    
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        if (error.message.includes('fetch')){
            weatherDisplay.innerHTML = '<p style="color: red;">Network error. Check your internet connection.</p>';
        } else {
            weatherDisplay.innerHTML = `<p style="color: red;">${error.message}</p>`;
        } 
    }
}

// Function to display weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;
    
    const html = `
        <h2>${name}</h2>
        <div class="weather-info">
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
            <p class="temperature">${Math.round(main.temp)}°C</p>
            <p class="description">${weather[0].description}</p>
            <div class="details">
                <p>Feels like: ${Math.round(main.feels_like)}°C</p>
                <p>Humidity: ${main.humidity}%</p>
                <p>Wind Speed: ${wind.speed} m/s</p>
            </div>
        </div>
    `;
    
    weatherDisplay.innerHTML = html;
}