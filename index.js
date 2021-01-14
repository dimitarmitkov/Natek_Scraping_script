const siteUrl = "https://demo-shop.natek.eu";
const puppeteer = require("puppeteer");
const stringify = require("csv-stringify")
const path = require("path");
const fs = require("fs");

let func = require("./functions");

async function run() {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto(siteUrl);

    const numberOfProductsField = "#main > div:nth-child(2) > p";
    let numberProductsField = await page.evaluate((sel) => {
        return +(document.querySelector(sel).innerHTML.match(/[ ][\d]+[ ]/gm)[0]);
    }, numberOfProductsField);

    let listProductsLength = await func.productsListLength(page);
    let pagesNumber = Math.ceil(numberProductsField / listProductsLength);
    let idArray = [];
    let webArray = [];
    const selectorMain = "#main > ul";

    await func.hrefLinksListGenerator(page, listProductsLength, webArray, idArray, selectorMain);

    if (pagesNumber > 1) {
        for (let i = 2; i <= pagesNumber; i++) {
            let pageUrl = siteUrl + "/page/" + i;
            await page.goto(pageUrl);
            listProductsLength = await func.productsListLength(page);
            await func.hrefLinksListGenerator(page, listProductsLength, webArray, idArray, selectorMain);
        }
    }

    let imageSelectorShort = "#product-INDEX > div.woocommerce-product-gallery.woocommerce-product-gallery--with-images.woocommerce-product-gallery--columns-4.images > figure > div > img";
    let imageSelectorLong = "#product-INDEX > div.woocommerce-product-gallery.woocommerce-product-gallery--with-images.woocommerce-product-gallery--columns-4.images > div > figure > div.woocommerce-product-gallery__image.flex-active-slide > img";
    let relatedProducts = "#product-INDEX > section > ul"
    let k;

    for (let i = 0; i < webArray.length; i++) {
        const page = await browser.newPage();
        await page.goto(webArray[i]);
        k = idArray[i];

        const name = await func.result(page,k,`#product-${k} > div.summary.entry-summary > h1`);

        let modifiedImageSelectorShort = imageSelectorShort.replace("INDEX", k);
        let modifiedImageSelectorLong = imageSelectorLong.replace("INDEX", k);

        let image;
        image = await func.imageStringExtractor(page, modifiedImageSelectorLong, image);
        image = await func.imageStringExtractor(page, modifiedImageSelectorShort, image);

        const sku = await func.result(page,k,`#product-${k} > div.summary.entry-summary > div.product_meta > span.sku_wrapper > span`);
        const category = await func.result(page,k,`#product-${k} > div.summary.entry-summary > div.product_meta > span.posted_in > a`);
        const descr = await func.result(page,k,'#tab-description > p');

        let colorOption;
        let colorSelector = "#pa_color";
        func.logoSizeColorSelector(page, colorSelector, colorOption).then(res => colorOption = res);

        let logoOption;
        let logoSelector = "#logo";
        await func.logoSizeColorSelector(page, logoSelector, logoOption).then(res => logoOption = res);

        let sizeOptions;
        let sizeSelector = "#pa_size";
        await func.logoSizeColorSelector(page, sizeSelector, sizeOptions).then(res => sizeOptions = res);

        const price = await func.result(page, k, `#product-${k} > div.summary.entry-summary > p > span`);
        const secondPrice = await func.result(page, k, `#product-${k} > div.summary.entry-summary > p > span:nth-child(2)`);
        const deletedPrice = await func.result(page, k, `#product-${k} > div.summary.entry-summary > p > del > span > bdi`);
        const deletedPriceAfter = await func.result(page, k, `#product-${k} > div.summary.entry-summary > p > ins`);
        const additionalInfoColor = await func.result(page, k, "#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_pa_color > th", ele => ele.textContent);
        const additionalInfoColorsList = await func.result(page, k, "#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_pa_color > td > p", ele => ele.textContent);
        const additionalInfoLogo = await func.result(page, k, "#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_logo > th", ele => ele.textContent);
        const additionalInfoLogosList = await func.result(page, k, "#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_logo > td > p", ele => ele.textContent);
        const additionalInfoSize = await func.result(page, k, "#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_pa_size > th", ele => ele.textContent);
        const additionalInfoSizesList = await func.result(page, k, "#tab-additional_information > table > tbody > tr.woocommerce-product-attributes-item.woocommerce-product-attributes-item--attribute_pa_size > td > p", ele => ele.textContent);

        let priceList = [price, secondPrice, deletedPrice, deletedPriceAfter].filter(x => x);

        let relatedProductsArray = [];
        let modifiedRelatedProducts = relatedProducts.replace("INDEX", k);
        let data;

        await page.evaluate((sel) => {
            const tds = document.querySelectorAll(sel);
            return Array.from(tds[0].getElementsByTagName("li")).map(t => t.innerHTML);
        }, modifiedRelatedProducts)
            .then(res => data = res)
            .catch(error => {
            });

        if (data) {
            for (let i = 0; i < data.length; i++) {
                let hrefLinks = data[i].match(/(?<=__title">)(.*)(?=<\/h2>)/gm);
                if (hrefLinks) {
                    relatedProductsArray.push(hrefLinks[0]);
                    let str = data[i].match(/data-product_id="[\d]+"/gm);
                }
            }
        }

        let resultArray = [
            name, image, sku, category, descr, colorOption ? colorOption : " ",
            logoOption ? logoOption : " ", sizeOptions ? sizeOptions : " ",
            priceList,
            [additionalInfoColor, additionalInfoColorsList].filter(x => x),
            [additionalInfoSize, additionalInfoSizesList].filter(x => x),
            [additionalInfoLogo, additionalInfoLogosList].filter(x => x),
            relatedProductsArray
        ];

        let fileName = name.split(" ").join("_");
        stringify(resultArray, function(err, output){
            if (err) console.error(err);
            fs.writeFileSync(path.resolve("csv",`${fileName}.csv`), resultArray,"utf8");
        });
    }

    await browser.close();
}

run().catch(err => console.log(err));
