// when calculate button pressed
document.querySelector('#button').addEventListener("click", fetchSite);

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

let data;
let mbSent;
let page;
let estimatedCO2; 
let estimatedCO2Year;
import tgwf from 'https://cdn.skypack.dev/@tgwf/co2';

function fetchSite() {
    let url = document.querySelector('#input').value;
    if(isValidUrl(url)) {
        const queryUrl = setUpQuery(url);
        displayLoading();
        fetch(queryUrl)
            .then(response => response.json())
            .then(json => {
                if(typeof json.lighthouseResult.audits !== 'undefined') {
                    page = json.id;
                    console.log(json)
                    data = json.lighthouseResult.audits;
                    hideLoading();
                    showInitialContent();
                } else {
                    hideLoading();
                    console.log(json['error'])
                }
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
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
        return false;
    }
}

function showInitialContent() {
    if(calculateEmissions()) {
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

        displayUnoptimizedImages();
        displayUnminifiedCss();
        displayUnminifiedJS();
    }
}

const calculateEmissions = () => {
    const totalBytes = data['total-byte-weight'].numericValue;
    const emissions = new tgwf.co2({ model: "swd" })
    const bytesSent = totalBytes;
    mbSent = (bytesSent / Math.pow(1024, 2)).toFixed(2) * 1;
    const greenHost = false // Is the data transferred from a green host?

    estimatedCO2 = emissions.perVisit(bytesSent, greenHost).toFixed(3);
    estimatedCO2Year = estimatedCO2 * 1000 * 12;

    if(estimatedCO2 !== '') {
        return true;
    } else {
        return false;
    }
}

const displayUnoptimizedImages = () => {
    let unoptimizedImages = data['uses-optimized-images'].details.items;
    const title = document.createElement('h2');
    title.innerHTML = `${unoptimizedImages.length} afbeeldingen die geopimaliseerd kunnen worden.`;
    const unoptimizedImagesList = document.createElement('ul'); 
    unoptimizedImages.forEach(element => {
        const kbSize = (element.totalBytes / 1024).toFixed(2);
        const kbToSave = (element.wastedBytes / 1024).toFixed(2);
        let li = document.createElement("li");
        li.innerHTML = '<img class="unoptimized__thumbnail" src="' + element.url + '"><a target="_blank" href="' + element.url + '">' + element.url + '</a> Grootte bestand: ' + kbSize + 'kb, Te besparen: ' + kbToSave + 'kb'; 
        unoptimizedImagesList.append(li);
    });
    document.body.appendChild(title);
    document.body.appendChild(unoptimizedImagesList);
}

const displayUnminifiedCss = () => {
    console.log(data['unminified-css'])
    let unminifiedCss = data['unminified-css'].details.items;
    const title = document.createElement('h2');
    title.innerHTML = `${unminifiedCss.length} css bestand(en) die geopimaliseerd kunnen worden.`;
    const unminifiedCssList = document.createElement('ul'); 
    unminifiedCss.forEach(element => {
        const kbSize = (element.totalBytes / 1024).toFixed(2);
        const kbToSave = (element.wastedBytes / 1024).toFixed(2);
        let li = document.createElement("li");
        li.innerHTML = '<a target="_blank" href="' + element.url + '">' + element.url + '</a> Grootte bestand: ' + kbSize + 'kb, Te besparen: ' + kbToSave + 'kb'; 
        unminifiedCssList.append(li);
    });
    document.body.appendChild(title);
    document.body.appendChild(unminifiedCssList);
}

const displayUnminifiedJS = () => {
    console.log(data['unminified-javascript'])
    let unminifiedJS = data['unminified-javascript'].details.items;
    const title = document.createElement('h2');
    title.innerHTML = `${unminifiedJS.length} javascript bestand(en) die geopimaliseerd kunnen worden.`;
    const unminifiedJSList = document.createElement('ul'); 
    unminifiedJS.forEach(element => {
        const kbSize = (element.totalBytes / 1024).toFixed(2);
        const kbToSave = (element.wastedBytes / 1024).toFixed(2);
        let li = document.createElement("li");
        li.innerHTML = '<a target="_blank" href="' + element.url + '">' + element.url + '</a> Grootte bestand: ' + kbSize + 'kb, Te besparen: ' + kbToSave + 'kb'; 
        unminifiedJSList.append(li);
    });
    document.body.appendChild(title);
    document.body.appendChild(unminifiedJSList);
}