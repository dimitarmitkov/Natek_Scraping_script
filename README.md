# Natek_Scraping_script
 Natek test task

Entry point is index.js file. You need to type: "npm run start", to run the program.

Runtime environment: Node.js

Programming language: JavaScript ES6

Node library: Puppeteer


1.	File structure:

−	index.js contains main functionality for scraping products data and exports it in csv files named with products names. If product name contains empty spaces they are replaced with “_” symbol.

−	categoryHierarchy.js contains functionality for scraping data from right side bar widget and exports it in file named hierarchy.csv.
  
−	functions.js contains all global functions used in index.js file.

- csv (directory) contains all csv files holding extracted data.

2.	Main functionalities.

2.1.	Scraping program collects and sores information about every product form https://demo-shop.natek.eu in following order:

−	Product name / title

−	 Product image URL

−	SKU

−	Product category

−	Product description

−	Product color option (if applicable)

−	Product size option (if applicable)

−	Product logo option (if applicable)

−	Product price

−	Product attributes (if applicable, from the tab Additional Information)


−	Related products SKUs (if applicable)

2.2.	Category hierarchy is collected and stored in order of appearance.

3.	Algorithm for scraping of products:

−	Scraper collects total number of product and number of product per page;

−	Calculates number of pages and loops through all pages;

−	Generates arrays of url and id for all products;

−	Then scraper loops each url containing needed product data and collects it into array for export in csv file;

−	If product data does not exist, scraper is writing in csv file empty string or empty array, depending on data type; 

