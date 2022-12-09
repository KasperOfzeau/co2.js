document.querySelector('#button').addEventListener("click", run);

// selecting loading div
const loader = document.querySelector("#loading");

// showing loading
function displayLoading() {
    loader.classList.add("display");
}

// hiding loading 
function hideLoading() {
    loader.classList.remove("display");
}

let totalBytes;
let mbSent;
let page;
let estimatedCO2; 
let estimatedCO2Year;
import tgwf from 'https://cdn.skypack.dev/@tgwf/co2';

const calculateEmissions = () => {
    const emissions = new tgwf.co2({ model: "swd" })
    const bytesSent = totalBytes;
    const mbSent = (bytesSent / Math.pow(1024, 2)).toFixed(2) * 1;
    const greenHost = false // Is the data transferred from a green host?

    estimatedCO2 = emissions.perVisit(bytesSent, greenHost).toFixed(3);
    estimatedCO2Year = estimatedCO2 * 1000 * 12;

    showInitialContent(page, estimatedCO2, estimatedCO2Year, mbSent);
}

function run() {
    let url = document.querySelector('#input').value;
    if(isValidUrl(url)) {
        const queryUrl = setUpQuery(url);
        displayLoading();
        fetch(queryUrl)
            .then(response => response.json())
            .then(json => {
                hideLoading();
                page = json.id;
                totalBytes = json.lighthouseResult.audits['total-byte-weight'].numericValue;
                calculateEmissions();
        });
    } else {
        console.log('error')
    }
}

function setUpQuery(url) {
        const query = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}`;
        return query;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

function showInitialContent(page, estimatedCO2, estimatedCO2Year, mbSent) {
    document.body.innerHTML = '';
    const title = document.createElement('h1');
    title.innerHTML = `${page} stoot ${estimatedCO2} gram carbon uit per bezoek. Er wordt ${mbSent}MB geladen.`;
    document.body.appendChild(title);

    const subtitle = document.createElement('h2');
    subtitle.innerHTML = `Dat is op een jaarlijkse basis met 1000 bezoekers per maand ${estimatedCO2Year} gram carbon uitstoot.`;
    document.body.appendChild(subtitle);

    const container = document.createElement('ul');
    for (const item in comparisonData) {
        let li = document.createElement("li");
        li.innerHTML = comparisonData[item].startSentence + (comparisonData[item].consumptionPerGram * estimatedCO2Year).toFixed(2) + " " + comparisonData[item].unit + comparisonData[item].endSentence
        container.append(li);
    }
    document.body.appendChild(container);

    const pageTested = document.createElement('p');
    pageTested.textContent = `Page tested: ${page}`;
    document.body.appendChild(pageTested);
}