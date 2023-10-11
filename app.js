
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function run() {
    // Launch a headless browser

    const url = 'https://www.aircanada.com/aeroplan/redeem/availability/outbound?org0=DEL&dest0=YYC&departureDate0=2023-11-08&lang=en-CA&tripType=O&ADT=1&YTH=0&CHD=0&INF=0&INS=0&marketCode=INT';

    const browser = await puppeteer.launch({ headless: false, defaultViewport: false });

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


            // Extract information from each element
            // const cabins  = element.querySelector()
            const data = [];

            // for (let cabin of cabins) {
            //     const seatsLeft = await cabin.$eval('.seats-text', el => el.textContent);
            //     const cabinClass = await cabin.$eval('.cabin-text', el => el.textContent);
            //     const points = await cabin.$eval('.points-total', el => el.textContent);
            //     const price = await cabin.$eval('kilo-price', el => el.textContent);

            //     data.push({
            //         seatsLeft,
            //         cabinClass,
            //         points,
            //         price
            //     });
            // }

            //             const data = [];
            //             const cabinsContainer = await page.$('.cabins-container');

            //             const cabins = await cabinsContainer.$$('.cabin');

            //             for (let cabin of cabins) {

            //                 const cabinClass = await cabin.$eval('.cabin-text', el => el.textContent.trim());
            //                 const points = await cabin.$eval('.points-total', el => el.textContent.trim());
            //                 const price = await cabin.$eval('kilo-price', el => el.textContent.trim());
            //                 data.push({ cabinClass, points, price })
            //                 console.log(`
            //     Class: ${cabinClass}
            //     Points: ${points}
            //     Price: ${price}
            //   `);

            //             }

            ////////////

            const cabinDiv = element.querySelector('.cabins-container.ng-star-inserted').outerHTML;

            const extractedPage = new DOMParser().parseFromString(cabinDiv, 'text/html');



            const cabins = Array.from(extractedPage.querySelectorAll("kilo-cabin-cell-pres"));




            /////////


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

    console.log(data);
    // // prepare to get the textContent of the selector above (use page.evaluate)
    // // let lamudiNewPropertyCount = await page.evaluate(el => el.textContent, elHandle[0]);
    // // console.log(lamudiNewPropertyCount);

    // // const flights = await page.$$eval("#\37 9aa85dc-f137-44c4", (cells) => {

    // //     return cells.map(cell => {

    // //         const cabin = cell.className.split(' ')[0];

    // //         const points = cell.$eval('.points-total', el => el.textContent);

    // //         const price = cell.$eval('.remaining-cash span', el => el.textContent.trim());

    //         return {
    //             cabin,
    //             points,
    //             price
    //         };

    //     });
    // });
    // console.log(flights);
    // Wait for the results to load (you may need to adjust the selector)
    // await page.waitForNavigation({ waitUntil: 'load' })
    // Extract the results or perform further actions
    const results = await page.evaluate(() => {
        // You can use JavaScript to extract data from the page here
        // For example, find and return the result elements as an array
        // const results = Array.from(document.querySelectorAll('.your-result-selector'));
        // return results.map(result => result.textContent.trim());
    });

    // Output or process the extracted results
    // Check new URL
    console.log('New page URL:', page.url());




    // await page.evaluate(() => {
    //     console.log('hii')
    //     let radio = document.querySelector('#bkmgFlights_tripTypeSelector_O')
    //     radio.click()
    //     console.log('bii')
    // });
    // await page.evaluate(() => {
    //     console.log('hii')
    //     let radio = document.querySelector('#bkmgFlights_searchTypeToggle')
    //     radio.click()

    // Take a screenshot and save it as 'example.png'
    // await page.screenshot({ path: 'example.png' });

    // Close the browser
    // await browser.close();
}

// Call the run function
run();
