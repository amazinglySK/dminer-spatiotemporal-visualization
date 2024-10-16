let jsonData = {};

let model = null;
let variable = null;
let statistics = null;

let timeSeriesData = {};
let chosen = null;

async function fetchGCM() {
    if (chosen == "GCM") {
        return;
    }
    chosen = "GCM";

    return Promise.all([
        fetch("gcm_data_rc.json")
            .then((response) => response.json())
            .then((data) => {
                jsonData = data;
            })
            .catch((error) => console.error("Error loading GCM data:", error)),
        fetch("gcm_data_tempvalues.csv")
            .then((response) => response.text())
            .then((csvData) => {
                parseCSVData(csvData);
            })
            .catch((error) =>
                console.error("Error loading time series data:", error)
            ),
    ]);
    // Fetch GCM regression coefficient data

    // Fetch time series data from CSV
}

async function fetchDL() {
    if (chosen == "DL") {
        return;
    }
    chosen = "DL";

    return Promise.all([
        fetch("dl_ta_data_rc.json")
            .then((response) => response.json())
            .then((data) => {
                jsonData = data;
            })
            .catch((error) => console.error("Error loading GCM data:", error)),

        // Fetch time series data from CSV
        fetch("dl_data_tempvalues.csv")
            .then((response) => response.text())
            .then((csvData) => {
                parseCSVData(csvData);
            })
            .catch((error) =>
                console.error("Error loading time series data:", error)
            ),
    ]);
    // Fetch GCM regression coefficient data
}

// Parse the CSV time series data into an object
function parseCSVData(csvData) {
    timeSeriesData = {};
    const rows = csvData.split("\n");
    const headers = rows[0].split(","); // First row contains the dates (Jan 2025, Feb 2025, ...)

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(",");
        const latLonKey = `${row[0]},${row[1]}`; // lat and lon are the first two columns
        const timeSeriesValues = row.slice(2).map(Number); // The rest are temperature values
        timeSeriesData[latLonKey] = timeSeriesValues;
    }
}

// Function to update model and variable selections
function updateParameters() {
    // Both the select menus
    model = document.querySelector('input[name="model"]:checked')?.value;
    variable = document.querySelector('input[name="variable"]:checked')?.value;
    statistics = document.querySelector(
        'input[name="statistics"]:checked'
    )?.value;

    // Check if 'gcm' model and 'ta' (temperature) variable are selected before updating map
    if (model === "gcm") {
        if (variable == "ta") {
            updateMap("GCM");
        }
    } else if (model == "dl") {
        if (variable == "ta") {
            updateMap("DL");
        }
    } else {
        clearMap(); // Clear the map if conditions are not met
    }
}

// Function to clear the map when conditions are not met
function clearMap() {
    Plotly.purge("map");
}

// Function to update the map based on the selected parameters
async function updateMap(model) {
    if (model == "GCM") {
        await fetchGCM();
    } else {
        await fetchDL();
    }

    if (!jsonData) {
        alert("Data not loaded yet.");
        return;
    }

    const tempData = jsonData.locations.map((location) => {
        return {
            lat: location.lat,
            lon: location.lon,
            regression_coefficient: location.regression_coefficient,
        };
    });

    const filteredData = tempData.filter(
        (d) => d.regression_coefficient !== null
    );

    const mapTrace = {
        type: "scattergeo",
        mode: "markers",
        lat: filteredData.map((d) => d.lat),
        lon: filteredData.map((d) => d.lon),
        marker: {
            size: 10,
            color: filteredData.map((d) => d.regression_coefficient),
            opacity: 0.2,
            colorscale: [
                [0, "blue"],
                [0.5, "lime"],
                [0.75, "yellow"],
                [1, "red"],
            ],
            cmin: Math.min(
                ...filteredData.map((d) => d.regression_coefficient)
            ),
            cmax: Math.max(
                ...filteredData.map((d) => d.regression_coefficient)
            ),
            colorbar: {
                title: `Trend Coefficient`,
                tickvals: [
                    Math.min(
                        ...filteredData.map((d) => d.regression_coefficient)
                    ),
                    Math.max(
                        ...filteredData.map((d) => d.regression_coefficient)
                    ),
                ],
                ticktext: [
                    `${Math.min(
                        ...filteredData.map((d) => d.regression_coefficient)
                    ).toFixed(2)}`,
                    `${Math.max(
                        ...filteredData.map((d) => d.regression_coefficient)
                    ).toFixed(2)}`,
                ],
            },
        },
        text: filteredData.map(
            (d) =>
                `(${d.lat.toFixed(2)}, ${d.lon.toFixed(
                    2
                )}): ${d.regression_coefficient.toFixed(2)}`
        ),
        hoverinfo: "text+lat+lon",
    };

    const mapLayout = {
        title: `Block Maxima Trend`,
        geo: {
            projection: {
                type: "natural earth",
            },
            showland: true,
            landcolor: "#e0e0e0", // Color for the land
            coastlinecolor: "black", // Black color for coastline
            coastlinewidth: 3, // Thickness of the coastline
            subunitcolor: "black", // Black borders between countries/states
            subunitwidth: 3, // Thickness of country borders
            lakes: {
                color: "#ffffff", // Same as background color for lakes
            },
            bgcolor: "#ffffff", // Background color for the map
        },
        paper_bgcolor: "#1e1e1e", // Dark background for paper
        plot_bgcolor: "#1e1e1e", // Dark background for plot
        font: {
            color: "#e0e0e0", // Font color for the text
        },
    };

    Plotly.newPlot("map", [mapTrace], mapLayout);

    document.getElementById("map").on("plotly_click", function (data) {
        const point = data.points[0];
        const lat = point.lat;
        const lon = point.lon;
        plotTimeseriesGraph(lat, lon);
        plotHistogram(lat, lon); // Call to display the histogram next to the time series graph
    });
}

// Function to plot the time series graph based on latitude and longitude
// FIXME: NEEDS FIXING. LATLONKEY NOT FOUND IN TIMESERIESDATA EVEN THOUGH LOADING CORRECTLY
function plotTimeseriesGraph(lat, lon) {
    const latLonKey = `${lat},${lon}`;
    console.log(latLonKey);
    console.log(timeSeriesData);
    const timeSeries = timeSeriesData[latLonKey];

    if (!timeSeries) {
        alert("No time series data found for this location.");
        return;
    }

    const dates = generateDateRange("2025-01", "2100-12");

    const trace = {
        x: dates,
        y: timeSeries,
        mode: "lines",
        type: "scatter",
        name: `Lat: ${lat}, Lon: ${lon}`,
        line: { color: "#17BECF" },
    };

    const layout = {
        title: `Time Series Data for Latitude: ${lat}, Longitude: ${lon}`,
        xaxis: { title: "Date" },
        yaxis: { title: "Temperature (K)" },
        paper_bgcolor: "#1e1e1e",
        plot_bgcolor: "#1e1e1e",
        font: { color: "#e0e0e0" },
    };

    Plotly.newPlot("timeseries", [trace], layout);
}

// Function to plot the histogram of time series data
// FIXME: NEEDS FIXING. LATLONKEY NOT FOUND IN TIMESERIESDATA EVEN THOUGH LOADING CORRECTLY
function plotHistogram(lat, lon) {
    const latLonKey = `${lat},${lon}`;
    const timeSeries = timeSeriesData[latLonKey];

    if (!timeSeries) {
        alert("No time series data found for this location.");
        return;
    }

    const trace = {
        x: timeSeries,
        type: "histogram",
        marker: {
            color: "#FF4136",
        },
    };

    const layout = {
        title: `Temperature Histogram for Latitude: ${lat}, Longitude: ${lon}`,
        xaxis: { title: "Temperature (K)" },
        yaxis: { title: "Frequency" },
        paper_bgcolor: "#1e1e1e",
        plot_bgcolor: "#1e1e1e",
        font: { color: "#e0e0e0" },
    };

    Plotly.newPlot("histogram", [trace], layout);
}

// Generate date range from Jan 2025 to Dec 2100
function generateDateRange(start, end) {
    const startDate = new Date(start + "-01");
    const endDate = new Date(end + "-01");
    const dateArray = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const formattedDate = `${year}-${month.toString().padStart(2, "0")}`;
        dateArray.push(formattedDate);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return dateArray;
}

// Get modal elements
const modal = document.getElementById("settingsModal");
const openModalBtn = document.getElementById("openSettings");
const closeModalBtn = document.getElementsByClassName("close")[0];

// Function to open the modal
openModalBtn.onclick = function () {
    modal.style.display = "block";
};

// Function to close the modal when clicking the close button
closeModalBtn.onclick = function () {
    modal.style.display = "none";
};

// Function to close the modal when clicking outside the modal content
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
