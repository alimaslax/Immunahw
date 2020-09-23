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
