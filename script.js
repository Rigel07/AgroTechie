const weatherApiKey = 'b6cbd785d65d908df80f194920fce289'; // Replace with your OpenWeatherMap API key
const soilApiKey = '909750f4-66cc-11ef-8a8f-0242ac130004-9097514e-66cc-11ef-8a8f-0242ac130004';

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchData, showError);
    } else {
        document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function fetchData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    document.getElementById("location").innerHTML = `Latitude: ${lat}, Longitude: ${lon}`;

    fetchWeather(lat, lon);
    fetchSoilData(lat, lon);
}

function fetchWeather(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("weather").innerHTML = `
                <h2>Weather Data</h2>
                <p>Temperature: ${data.main.temp} °C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity} %</p>
            `;
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function fetchSoilData(lat, lon) {
    const soilUrl = `https://api.stormglass.io/v2/soil/point?lat=${lat}&lng=${lon}`;

    fetch(soilUrl, {
        headers: {
            'Authorization': soilApiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Soil Data Response:", data); // Log the response to inspect

        // Assuming the response structure has a 'data' array and we want the first item
        const soilData = data.data && data.data[0] ? data.data[0] : null;

        if (soilData) {
            const temperature = soilData.temperature || 'N/A'; // Adjust according to actual response structure
            const moisture = soilData.moisture || 'N/A'; // Adjust according to actual response structure

            document.getElementById("soil").innerHTML = `
                <h2>Soil Data</h2>
                <p>Temperature: ${temperature} °C</p>
                <p>Moisture: ${moisture} %</p>
            `;
        } else {
            document.getElementById("soil").innerHTML = `
                <h2>Soil Data</h2>
                <p>No soil data available.</p>
            `;
        }
    })
    .catch(error => console.error('Error fetching soil data:', error));
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("location").innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("location").innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            document.getElementById("location").innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("location").innerHTML = "An unknown error occurred.";
            break;
    }
}
