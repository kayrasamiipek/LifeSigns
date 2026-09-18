function showAbout(){
    const aboutSectionOnClick = document.getElementById("aboutSection");
    const birthForm = document.querySelector(".birthForm");

    const resultsSection = document.getElementById("resultsSection");

    birthForm.style.display = "none";
    resultsSection.style.display = "block";

    if(showBreakdownCheck == false){
        if (aboutSectionOnClick.style.display === "block") {
            aboutSectionOnClick.style.display = "none";
            birthForm.style.display = "flex";
        } else {
            aboutSectionOnClick.style.display = "block";
            birthForm.style.display = "none";
        }
    }else{
        if (aboutSectionOnClick.style.display === "block") {
            aboutSectionOnClick.style.display = "none";
            birthForm.style.display = "none";
            resultsSection.style.display = "block";
        } else {
            aboutSectionOnClick.style.display = "block";
            birthForm.style.display = "none";
            resultsSection.style.display = "none";
        }
    }
    
}

let showBreakdownCheck = false;

let selectedLatitude;
let selectedLongitude;

async function searchCity(city){
    
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5&language=en&format=json`);
    const data = await response.json();
    console.log(data);

    locationSuggestion.innerHTML = "";
    if (!data.results){
        return;
    }

    data.results.forEach(function(location){
            const option = document.createElement("div");
            option.textContent = `${location.name}, ${location.admin1}, ${location.country}`;

            option.addEventListener("click", function(){
                birthZoneInput.value = `${location.name}, ${location.admin1}, ${location.country}`;
                selectedLatitude = location.latitude;
                selectedLongitude = location.longitude;

                locationSuggestion.innerHTML = "";
                console.log("Selected Latitude:", selectedLatitude);
                console.log("Selected Longitude:", selectedLongitude);
            });

            locationSuggestion.appendChild(option);
    });
}

const birthZoneInput = document.getElementById("birthZone");
const locationSuggestion = document.getElementById("locationSuggestion");

birthZoneInput.addEventListener("input", async function () { 
    const city = birthZoneInput.value.trim();

    if (city.length < 3) {
        locationSuggestion.innerHTML = "";
        return;
    }

    searchCity(city);

});

// Show Breakdown Button
function showBreakdown(){
    const birthDate = document.getElementById("birthDate").value;
    const birthTime = document.getElementById("birthTime").value;
    const birthLocation = document.getElementById("birthZone").value;

    if (
        birthDate === "" ||
        birthTime === "" ||
        birthLocation === "" ||
        selectedLatitude === undefined ||
        selectedLongitude === undefined
    ) {
        alert("Please complete all birth information.");
        return;
    }

    const dateParts = birthDate.split("-");
    const timeParts = birthTime.split(":");

    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);

    const hour = Number(timeParts[0]);
    const minute = Number(timeParts[1]);

    const lifePath = calculateLifePath(birthDate);
    const birthdayNumber = calculateBirthdayNumber(birthDate);

    console.log("Birth Date:", birthDate);
    console.log("Birth Time:", birthTime);
    console.log("Birth Location:", birthLocation);
    
    console.log("Selected Latitude:", selectedLatitude);
    console.log("Selected Longitude:", selectedLongitude);

    console.log("Life Path:", lifePath);
    console.log("Birthday Number:", birthdayNumber);

    getChart(year, month, day, hour, minute, selectedLatitude, selectedLongitude, lifePath, birthdayNumber);
}


// Functioning Get Chart VIA API And Incorporation Of Numerology

async function getChart(year, month, day, hour, minute, lat, lon, lifePath, birthdayNumber) {
    showBreakdownCheck = true;
    const response = await fetch("https://api.cosmyday.com/natal", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            year: year,
            month: month,
            day: day,
            hour: hour,
            minute: minute,
            lat: lat,
            lon: lon
        })
    });

    const data = await response.json();

    const birthForm = document.getElementById("birthForm");
    const resultsSection = document.getElementById("resultsSection");

    birthForm.style.display = "none";
    resultsSection.style.display = "block";

    displayPlanetPlacements(data);
    displayHouseCusps(data);
    
    const numerologyData = document.getElementById("numerologyData");

    numerologyData.innerHTML = `
        <p><strong>Life Path:</strong> ${lifePath}</p>
        <p><strong>Birthday Number:</strong> ${birthdayNumber}</p>
    `;
    console.log("Natal Chart:", data);
}

// Numerology Calculations

function reduceNumber(number) {
    while (
        number > 9 &&
        number !== 11 &&
        number !== 22 &&
        number !== 33
    ) {
        number = number
            .toString()
            .split("")
            .map(Number)
            .reduce((sum, digit) => sum + digit, 0);
    }

    return number;
}

function calculateLifePath(birthDate) {
    const digits = birthDate
        .replaceAll("-", "")
        .split("")
        .map(Number);

    const total = digits.reduce((sum, digit) => sum + digit, 0);

    return reduceNumber(total);
}

function calculateBirthdayNumber(birthDate) {
    const day = Number(birthDate.split("-")[2]);

    return reduceNumber(day);
}

// Calculations for Zodiac Sign

function getZodiacSign(longitude) {
    const signs = [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces"
    ];

    const signIndex = Math.floor(longitude / 30);

    return signs[signIndex];
}

function formatDegree(decimalDegree) {
    const degree = Math.floor(decimalDegree);
    const minutes = Math.round((decimalDegree - degree) * 60);

    return `${degree}°${minutes}'`;
}

function displayPlanetPlacements(data) {
    const planetPlacements = document.getElementById("planetPlacements");

    planetPlacements.innerHTML = "";

    const planetsToShow = [
        "Sun",
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
        "Lilith",
        "NorthNode"
    ];

    const risingRow = document.createElement("p");

    risingRow.textContent =
        `Rising: ${getZodiacSign(data.ascendant)}`;

    planetPlacements.appendChild(risingRow);

    planetsToShow.forEach(function(planetName) {
        const planet = data.planets[planetName];

        const row = document.createElement("p");

        row.textContent =
            `${planetName}: ${planet.sign} ` +
            `${formatDegree(planet.degInSign)} ` +
            `${planet.retrograde ? "R " : ""}` +
            `— House ${planet.house}`;

        planetPlacements.appendChild(row);
    });
}

function displayHouseCusps(data) {
    const houseCusps = document.getElementById("houseCusps");

    houseCusps.innerHTML = "";

    data.cusps.forEach(function(cuspLongitude, index) {
        const houseNumber = index + 1;

        const sign = getZodiacSign(cuspLongitude);

        const degreeInsideSign = cuspLongitude % 30;

        const row = document.createElement("p");

        row.textContent =
            `House ${houseNumber}: ${sign} ${formatDegree(degreeInsideSign)}`;

        houseCusps.appendChild(row);
    });
}