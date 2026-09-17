function showAbout(){
    const aboutSectionOnClick = document.getElementById("aboutSection");
    const birthForm = document.querySelector(".birthForm");

    if (aboutSectionOnClick.style.display === "block") {
        aboutSectionOnClick.style.display = "none";
        birthForm.style.display = "flex";
    } else {
        aboutSectionOnClick.style.display = "block";
        birthForm.style.display = "none";
    }
}

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


    console.log("Birth Date:", birthDate);
    console.log("Birth Time:", birthTime);
    console.log("Birth Location:", birthLocation);
    
    console.log("Selected Latitude:", selectedLatitude);
    console.log("Selected Longitude:", selectedLongitude);


    getNatalChart(year, month, day, hour, minute, selectedLatitude, selectedLongitude);
}

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

async function getNatalChart(year, month, day, hour, minute, lat, lon) {
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

    const astrologyData = document.getElementById("astrologyData");

    astrologyData.innerHTML = `
    <p><strong>Sun:</strong> ${data.planets.Sun.sign}</p>
    <p><strong>Moon:</strong> ${data.planets.Moon.sign}</p>
    <p><strong>Rising:</strong> ${getZodiacSign(data.ascendant)}</p>
    <p><strong>Mercury:</strong> ${data.planets.Mercury.sign}</p>
    <p><strong>Venus:</strong> ${data.planets.Venus.sign}</p>
    <p><strong>Mars:</strong> ${data.planets.Mars.sign}</p>
    `;
    
    const numerologyData = document.getElementById("numerologyData");

    numerologyData.innerHTML = `
        <p><strong>Life Path:</strong> ${lifePath}</p>
        <p><strong>Birthday Number:</strong> ${birthdayNumber}</p>
    `;
    console.log("Natal Chart:", data);
}
