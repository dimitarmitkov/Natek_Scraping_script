module.exports = {


    hrefLinksListGenerator: async function hrefLinksListGenerator(page, listProductsLength, webArray, idArray, selector) {
        const data = await page.evaluate((sel) => {
            const tds = document.querySelectorAll(sel);
            return Array.from(tds[0].getElementsByTagName("li")).map(t => t.innerHTML);
        }, selector);

        for (let i = 0; i < listProductsLength; i++) {
            let hrefLinks = data[i].match(/https:\/\/demo-shop\.natek\.eu\/product\/[a-z\-]+\//gm);
            if (hrefLinks) {
                webArray.push(hrefLinks[0]);
                let str = data[i].match(/data-product_id="[\d]+"/gm);
                idArray.push(+str[0].match(/[\d]+/));
            }
        }
    },


    productsListLength: async function productsListLength(page) {
        return await page.evaluate((sel) => {
            return document.getElementsByClassName(sel).length;
        }, productsList);
    },

    result: async function result(page, k, string) {
        if (await page.$(string)) {
            return await page.$eval(string, ele => ele.textContent);
        }
    },

    logoSizeColorSelector: async function logoSizeColorSelector(page, selectorInput, valueInput) {
        await page.waitForSelector(selectorInput, {timeout: 500})
            .then(() => {
                    return page.evaluate((sel) => {
                        const tds = document.querySelectorAll(sel);
                        return Array.from(tds[0].getElementsByTagName("option"))
                            .map(t => t.value).filter(x => x);
                    }, selectorInput);
                }
            )
            .then(res => valueInput = res)
            .catch(error => {
            });
        return valueInput;
    },

    imageStringExtractor: async function imageStringExtractor(page, imageModifierSelector, image) {
        await page.evaluate((sel) => {
            return document.querySelector(sel).getAttribute("src");
        }, imageModifierSelector).then(res => image = res).catch(error => {
        });
        return image;
    },
}

const productsList = "product type-product";


// exports.hrefLinksListGenerator = hrefLinksListGenerator;
// exports.productsListLength = productsListLength;
// exports.result = result;
// exports.logoSizeColorSelector = logoSizeColorSelector;
// exports.imageStringExtractor = imageStringExtractor;