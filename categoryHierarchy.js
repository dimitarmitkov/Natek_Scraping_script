const siteUrl = "https://demo-shop.natek.eu";
const puppeteer = require('puppeteer');
const stringify = require("csv-stringify")
const path = require("path");
const fs = require("fs");

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto(siteUrl);

    let structureSelector = "#woocommerce_product_categories-2 > ul";
    let firstArr = [];

    const dataTree = await page.evaluate((sel) => {
        const tds = document.querySelectorAll(sel);
        return Array.from(tds[0].getElementsByTagName("li")).map(t => t.innerHTML);
    }, structureSelector);

    for (let i = 0; i < dataTree.length; i++) {
        let hrefLinks = dataTree[i].match(/(?<=\/">)(.*)(?=<\/a>)/gm);
        firstArr.push(hrefLinks[0]);
    }

    stringify(firstArr, function(err, output){
        if (err) console.error(err);
        fs.writeFileSync(path.resolve("csv","hierarchy.csv"), firstArr,"utf8");
    });

    await browser.close();
}

run().catch(err => console.log(err));