# NodeJS Assignment

## Backstory

Your boss wants to know where the state of Maryland is spending all of its money. A co-worker started a NodeJS + AngularJS application
to plot points on a map to visually show where, geographically, Maryland is spending the most money. Unfortuantely, your co-worker was
pulled to another project and has left you to pick up where they left off.

The goal of the project is to pull the data from Maryland's Open Data Portal and find the zip codes that have received the highest
total payments from the state of Maryland. For instance, given the following 3 rows:

| Fiscal Year  | Agency Name   | Vendor Name   | Vendor Zip | Amount
|--------------|---------------|---------------|------------|--------
| 2008         | BCCC          | FedEx         | 10087      | 600.00
| 2008         | UMCP          | UPS           | 10087      |  70.00
| 2008         | UMCP          | UPS           | 21111      |  80.00

Zip code 10087 would have a total of $670 and zip code 21111 would be $80.

## Assignment

You must pull data from https://opendata.maryland.gov/Budget/State-of-Maryland-Payments-Data-FY2008-to-FY2017/gja3-vy5r, but for this execise,
your boss is only interested in Fiscal Year 2015. Because this data only contains zip codes, you'll need to also call out to
https://nominatim.openstreetmap.org to map zip codes to latitude and longitude.

Due to rate limits and usage agreements, your boss wants your application to pull the data once when the service starts and keep the data
in memory to serve all requests. Nominatim has a very strict usage policy on how many requests can be made and how often. Due to these
restrictions, your boss has decided to only show the top 3 points on the map. Keep in mind, that Nominatim's policy states that only
one request can be made per second. You must abide by that restriction. Also, your boss is a bit fickle and just last week wanted the top
10 points instead of 3. So keep that in mind.

One final requirement. The environment where your application is going to be deployed is still in flux, so your boss has asked that you
finish up your co-workers Dockerfile to run the application as a Docker container.

## Wrap it up

When you are finished, tar.gz all the files (minus node_modules please), and send them to the person that emailed you the assignment.
You may need to send a Google Drive or similar link if your email provider doesn't like zipped up javascript files.

# Updates to Project
There are several updates I have made to the project described below. The application pulls in data from opendata.marland.gov and assess the fiscal year 2015, 
although it could be easily modified to assess any year that the Api supports (which as of writing this is from FY2008 to FY2019).  The application has the following 
features which I will describe further on the [A brief description of what you did] section of this readme.

Snapshot of features:
    * Hapi Backend to serve files and take care of routes
    * Saves opendata query into memory && Adheres to Nominatim API rate limit of 1 request/second
	* Overly of spending from MaryLand by zipCode on a Leaflet Map (Based on OpeanStreetMap)
    * Slider to choose number of results shown on the map 
    * Sorted table showing spendature by Zipcode.

## Building the Docker image
Run the following command to build the Docker Image
```
docker build -t <your username>/maryland-spending .
```
Check to see if Image was built correctly:
```
docker images
```
## Running the Docker container
Run the following command to run a built Image.
```
docker run -d --name [name] -p [external port]:3000 IMAGE
```

the example below binds our localhost port 3000 to port 3000 of the container, -d is for 
run container in background and print container ID
```
docker run -d --name maryland-spending -p 3000:3000 alimaslax/maryland-spending
```
## A brief description of what you did
In this section I will be briefly going over what I did for each of the features I implemented

* Hapi Backend to serve files and take care of routes
There are several changes to our backend. I have included the following routes to serve our frontend application:
 - /assets/{param*} for our pictures and css stylingsheets.
 - /components/{param*} to serve our modules and components for the app
 - /controllers.js to serve our controller
 - /data/{year} ( GET Method ) - route to get the opendata.maryland.gov for the fiscal year specified. Transforms that data into a 
   sorted { vendor_zip and amount } array of objects.
 - /nominatim/{zipcode} ( GET Method ) - route used to query the nominatim API, transforming zipcodes into latitude and longitude. 

     ***
     Recent Update to Nominatim's API    

     While building the app an update to Nominatim's API no longer supports searching with STATE, COUNTRY, and ZIPCODE
     This broke my ability to search if a zip code is based in a State, I had to rewrite my server code.
     The following used to return a data
     https://nominatim.openstreetmap.org/search.php?state=Maryland&country=USA&postalcode=21022&polygon_geojson=1&format=jsonv2
     Now only the following returns the correct data
     https://nominatim.openstreetmap.org/search.php?country=USA&postalcode=21022&polygon_geojson=1&format=jsonv2
     ***

* Saves opendata query into memory && Adheres to Nominatim API rate limit of 1 request/second
In our controller.js we setup up a service to inject our shared variables into our controllers. This allows for global access to different controllers
(as long as they share a parent module) to the variables. In order to modify and get our variables we attach getter and setter functions. 
To adhere to Nominatim's rate limit we set our application to query our Hapi backend once/second.

* Overly of spending from Maryland by zipCode on a Leaflet Map (Based on OpeanStreetMap)
There are several new files and changes 
 -> map.component.html
     Contains the html template of the module, contains the angular directives that control the behavior of our doms, and attributes.
 -> map.component.js
     Declaration of the map component of the module
 -> map.module.js
     Declaration of the map module
 -> controllers.js (MapController)
     This is the main file that controllers the functionality of the leaflet map as well as quires our Hapi backend. On initialization the MapController 
     quires our database for a route that is defined in our backend called '/data/{fiscal_year}'. This is where we put in the year we are looking to access.
     Once our data is retrieved we save the data into memory, and call the function markLocations(data,count,index). This method ingests our now modified 
     data from the backend, the number of markers to display, and the index to start from. It calls our backend route /nominatim/{zipcode}, which returns 
     the latitude and longitude of our zip code. It then dynamically modifies our markers on the map; adding an entry for each item in our data up to the 
     count of the number of markers needed to be displayed. And finally we setup a function that is able to be called from other controllers that resets 
     all markers and then calls markLocations with our saved data from open.maryland.gov.

* Slider to choose number of results shown on the map 
A custom slider with a mouseup directive that calls our MarkLocations function from the MapController
 -> controllers.js (SliderController)
Defines our starting value for our slider, and makes a function that gets called from our angular directive for the slider. 
This function calls our MapController to redisplay markers based on our slider.

* Sorted table showing spendature by Zipcode.
 -> table.component.html
     Contains the html template of the table module, also contains the angular directives that dynamically populates our table once the data is loaded.
 -> table.component.js
     Declaration of the table component of the module
 -> table.module.js
     Declaration of table module
 -> controllers.js (TableController)
     Our TableController waits to load the scope of our dataTable variable used to populate our bootstrap table. It checks every 500 ms if our data from
     our injected service is loaded. If it is, it than simply sets our dataTable to that data.

## A brief description of how you might improve the project
Given the time there are several things I would improve on the project

* Testing and Swagger implementation(E2E, and Unit Testing)
For each endpoint on my backend I should be exposing the service to Swagger and testing the endpoint. Given more time I would be writing tests
for our frontend as well as our backend. 

* Upgrading to the latest Angular and using Typescript
By upgrading to the latest angular there is more support for 3rd party library integrations. And by using typescript I would simplify the code 
some more, making it easy to read and debug. The benefits of static checking, interfaces, observables, as well as a host of other features make 
upgrading to typescript beneficial.

* Functionality of the site.
- Add support to dynamically remove and add markers instead of resting the number of markers on the map to zero each time the slider is changed.
- I would also add MDBootstrap to our project, giving it a dynamic and searchable table with all the entries loaded as needed, 
instead of saving all the data into memory.
- Remove all markers that are outside of Maryland Zipcode
