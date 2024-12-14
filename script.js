let chartInstance; 

function searchWeather() {
    const city = document.getElementById('searchInput').value;
    const apiKey = 'f3edcb1b7a68eac9f5cb0bec68779c71';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            const temperature = data.main.temp;
            const weatherDescription = data.weather[0].description; 
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const windDirection = data.wind.deg;
            const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
            const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
            displayWeather(data, temperature, weatherDescription, humidity, windSpeed, windDirection, sunrise, sunset);
            setBackground(data.weather[0].main, temperature, weatherDescription);
            return fetch(forecastUrl);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Forecast data not available');
            }
            return response.json();
        })
        .then(forecastData => {
            displayForecast(forecastData);
        })
        .catch(error => {
            displayError(error.message);
        });
}

function displayWeather(data, temperature, weatherDescription, humidity, windSpeed, windDirection, sunrise, sunset) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `
        <h2>Weather in ${data.name}, ${data.sys.country}</h2>
        <p><i class="fas fa-thermometer-half"></i> Temperature: ${temperature}°C</p>
        <p><i class="fas fa-cloud-showers-heavy"></i> Precipitation: ${weatherDescription}</p>
        <p><i class="fas fa-tint"></i> Humidity: ${humidity}%</p>
        <p><i class="fas fa-wind"></i> Wind: ${windSpeed} m/s, ${getWindDirection(windDirection)}</p>
        <p><i class="fas fa-sun"></i> Sunrise: ${sunrise}</p>
        <p><i class="fas fa-moon"></i> Sunset: ${sunset}</p>
    `;

    weatherInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    weatherInfo.style.padding = '20px';
    weatherInfo.style.borderRadius = '10px';
    weatherInfo.style.marginRight = '20px'; 

    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    forecastContainer.style.padding = '20px';
    forecastContainer.style.borderRadius = '10px';
}
function displayForecast(forecastData) {
    const forecastChart = document.getElementById('forecastChart').getContext('2d');
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    const forecast = forecastData.list.filter((item, index) => index < 5);

    const labels = forecast.map(item => new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const temperatures = forecast.map(item => item.main.temp);

    console.log('Filtered forecast data:', forecast);
    console.log('Labels:', labels);
    console.log('Temperatures:', temperatures);

    if (chartInstance) {
        chartInstance.destroy(); 
    }

    chartInstance = new Chart(forecastChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                borderColor: 'rgb(51, 130, 190)',
                backgroundColor: 'rgba(54, 142, 142, 0.373)',
                fill: true,
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time',
                        color: 'white' 
                    },
                    ticks: {
                        color: 'white' 
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        color: 'white' 
                    },
                    ticks: {
                        color: 'white' 
                    }
                }
            }
        }
    });
}


function displayError(message) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `<p class="error-message">${message}</p>`;
}

function setBackground(weather, temperature, weatherDescription) {
    let imageUrl = '';

    if (weatherDescription && weatherDescription.includes('rain')) {
        imageUrl = 'url(\'rain.webp\')'; 
    } else if (temperature <= 20) {
        imageUrl = 'url(\'20 below.webp\')'; 
    } else if (temperature >= 21 && temperature <= 30) {
        imageUrl = 'url(\'20-30.webp\')'; 
    } else {
        imageUrl = 'url(\'above 30.webp\')'; 
    }

    document.body.style.backgroundImage = imageUrl;
    document.body.style.backgroundSize = 'cover';
}

function getWindDirection(degree) {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round((degree % 360) / 45);
    return directions[index];
}
