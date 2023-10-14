const puppeteer = require('puppeteer-extra')
const createError = require('http-errors');
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function run(params) {
    // Launch a headless browser

    const url = 'https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=DEL&dest0=YYC&departureDate0=2023-11-08&lang=en-CA&tripType=O&ADT=1&YTH=0&CHD=0&INF=0&INS=0&marketCode=INT';

    const browser = await puppeteer.launch({ headless: true, });

    // Create a new page
    const page = await browser.newPage();
    // await page.setViewport({ width: 1000, height: 700 })
    // Navigate to a URL


    await page.goto(url);

    const cancel = await page.waitForSelector('#mat-dialog-title-0 > span')
    await cancel.click()

    const data = await page.evaluate(() => {
        const notAvailable = 'No flights available';
        const head = document.querySelector("h1").textContent.trim();
        const classCabins = document.querySelectorAll(".cabin-heading");
        const classCabin = []
        classCabins.forEach((element) => {
            classCabin.push(element.textContent.trim());
        })


        if (head === notAvailable) {
            return false;
        }
        const elements = document.querySelectorAll('.upsell-row.stop-over.ng-star-inserted'); // Selector for elements


        const scrapedData = [];

        elements.forEach(async (element) => {


            const data = [];

            const cabinDiv = element.querySelector('.cabins-container.ng-star-inserted').outerHTML;
            const extractedPage = new DOMParser().parseFromString(cabinDiv, 'text/html');
            const cabins = Array.from(extractedPage.querySelectorAll("kilo-cabin-cell-pres"));

            cabins.forEach((cabin) => {
                const seatsLeftElement = cabin.querySelector('.seat-text.ng-star-inserted');
                const pointsElemnet = cabin.querySelector('.points-total');
                const cashElement = cabin.querySelector('.remaining-cash');
                const cabinclassElemnt = cabin.querySelector('.mixed-cabin.good.ng-star-inserted')

                const seatLeft = seatsLeftElement ? seatsLeftElement.textContent.trim() : '';
                const points = pointsElemnet ? pointsElemnet.textContent.trim() : '';
                const cash = cashElement ? cashElement.textContent.trim() : '';
                const mixedCabin = cabinclassElemnt ? cabinclassElemnt.textContent.trim() : '';
                data.push({
                    seatLeft,
                    points,
                    cash,
                    mixedCabin,
                });
            });


            const departureTimeElement = element.querySelector('.departure-time');
            const arrivalTimeElement = element.querySelector('.arrival-time');
            const durationElement = element.querySelector('.flight-summary.ng-star-inserted');
            const layoverElements = Array.from(element.querySelectorAll('.connection-time.mat-caption.ng-star-inserted'));
            const operatingAirlineElement = element.querySelector('.operating-airline-icon');
            const specificClassElement = element.querySelector('.cabin-text');

            const departureTime = departureTimeElement ? departureTimeElement.textContent.trim() : 'Not available';
            const arrivalTime = arrivalTimeElement ? arrivalTimeElement.textContent.trim() : 'Not available';
            const duration = durationElement ? durationElement.textContent.trim() : 'Not available';
            const layover = layoverElements.map((layoverElement) => layoverElement.textContent.trim());
            const operatingAirline = operatingAirlineElement ? operatingAirlineElement.getAttribute('alt') : 'Not available';
            const specificClass = specificClassElement ? specificClassElement.textContent.trim() : 'Not available';

            // Create an object with the extracted data
            const flightData = {
                departureTime,
                arrivalTime,
                duration,
                layover,
                operatingAirline,
                specificClass,
                data
            };

            // Add the object to the scrapedData array
            scrapedData.push(flightData);
        });

        return JSON.stringify({ classCabin, scrapedData });
    });

    await browser.close();
    return data;
    // Close the browser
}

// Call the run function



module.exports = {
    // checkEmail: async (req, res, next) => {
    //     try {

    //         res.send('hiiii');
    //     }
    //     catch (e) {
    //         if (e.isJoi === true) e.status = 422;
    //         next(e);
    //     }
    // },
    runScraper: async (req, res, next) => {
        try {

            const jsonData = req.body;
            const data = await run(jsonData)
            console.log(data)
            res.send(data);
        }
        catch (e) {
            console.log(e)
            next(e);
        }
    },
}