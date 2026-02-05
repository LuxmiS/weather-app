const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const searchHistoryDiv = document.getElementById('search-history');

// Track current unit, weather data, and search history
let currentUnit = 'celsius';
let currentWeatherData = null;
let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

// Event listeners
searchBtn.addEventListener('click', () => getWeather(cityInput.value.trim()));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(cityInput.value.trim());
    }
});

celsiusBtn.addEventListener('click', () => switchUnit('celsius'));
fahrenheitBtn.addEventListener('click', () => switchUnit('fahrenheit'));

// Initialize: display search history on load
displaySearchHistory();

// Fetch weather data
async function getWeather(city) {
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
        
        // Add to search history
        addToHistory(data.name);
        
        displayWeather(data);
        cityInput.value = ''; // Clear input after successful search
        
    } catch (error) {
        if (error.message.includes('fetch')) {
            weatherDisplay.innerHTML = '<p style="color: red;">Network error. Check your internet connection.</p>';
        } else {
            weatherDisplay.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
}

// Add city to search history
function addToHistory(city) {
    // Remove city if it already exists (to avoid duplicates)
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    
    // Add to beginning of array
    searchHistory.unshift(city);
    
    // Keep only last 5 searches
    if (searchHistory.length > 5) {
        searchHistory.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    
    // Update display
    displaySearchHistory();
}

// Display search history
function displaySearchHistory() {
    if (searchHistory.length === 0) {
        searchHistoryDiv.innerHTML = '';
        return;
    }
    
    let historyHTML = searchHistory.map(city => 
        `<span class="history-item" onclick="getWeather('${city}')">
            ${city}
            <span class="remove-btn" onclick="event.stopPropagation(); removeFromHistory('${city}')">×</span>
        </span>`
    ).join('');
    
    historyHTML += `<button class="clear-history" onclick="clearHistory()">Clear All</button>`;
    
    searchHistoryDiv.innerHTML = historyHTML;
}

// Remove single item from history
function removeFromHistory(city) {
    searchHistory = searchHistory.filter(item => item !== city);
    localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// Clear all history
function clearHistory() {
    searchHistory = [];
    localStorage.removeItem('weatherSearchHistory');
    displaySearchHistory();
}

// Switch temperature unit
function switchUnit(unit) {
    currentUnit = unit;
    
    if (unit === 'celsius') {
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
    } else {
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
    }
    
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