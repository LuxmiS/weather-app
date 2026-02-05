const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');

// Track current unit and weather data
let currentUnit = 'celsius';
let currentWeatherData = null;

// Event listeners
searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

celsiusBtn.addEventListener('click', () => switchUnit('celsius'));
fahrenheitBtn.addEventListener('click', () => switchUnit('fahrenheit'));

// Fetch weather data
async function getWeather() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        weatherDisplay.innerHTML = '<p style="color: red;">Please enter a city name</p>';
        return;
    }
    
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
        currentWeatherData = data;
        displayWeather(data);
        
    } catch (error) {
        if (error.message.includes('fetch')) {
            weatherDisplay.innerHTML = '<p style="color: red;">Network error. Check your internet connection.</p>';
        } else {
            weatherDisplay.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
}

// Switch temperature unit
function switchUnit(unit) {
    currentUnit = unit;
    
    // Update button styles
    if (unit === 'celsius') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
    }
    
    // Re-display weather with new unit if data exists
    if (currentWeatherData) {
        displayWeather(currentWeatherData);
    }
}

// Convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// Display weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;
    
    // Convert temperatures based on current unit
    let temp = main.temp;
    let feelsLike = main.feels_like;
    let unitSymbol = '°C';
    
    if (currentUnit === 'fahrenheit') {
        temp = celsiusToFahrenheit(temp);
        feelsLike = celsiusToFahrenheit(feelsLike);
        unitSymbol = '°F';
    }
    
    const html = `
        <h2>${name}</h2>
        <div class="weather-info">
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
            <p class="temperature">${Math.round(temp)}${unitSymbol}</p>
            <p class="description">${weather[0].description}</p>
            <div class="details">
                <p>Feels like: ${Math.round(feelsLike)}${unitSymbol}</p>
                <p>Humidity: ${main.humidity}%</p>
                <p>Wind Speed: ${wind.speed} m/s</p>
            </div>
        </div>
    `;
    
    weatherDisplay.innerHTML = html;
}