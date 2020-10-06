'use strict';

var Hapi = require('hapi');
var Joi = require("joi");
var axios = require("axios");
var helper = require('./js/extract');

var server = new Hapi.Server();
server.connection({
    port: 3000,
    host: '0.0.0.0'
});

// TODO load the data from external APIs and figure out the top zip codes by amounts
// Expose that data for the UI
// Maryland Data URL: https://opendata.maryland.gov/resource/3ycv-rxy9.json

server.register([{ register: require('inert') }], function (err) {
    if (err) {
        return console.error(err);
    }

    //========= Start of Files ====== //
    // serve node modules
    server.route({
        method: 'GET',
        path: '/node_modules/{param*}',
        handler: {
            directory: {
                path: 'node_modules',
                listing: false,
                index: true
            }
        }
    });
    // serve assets
    server.route({
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
                path: 'ui/assets/',
                listing: false,
                index: true
            }
        }
    });
    // serve components
    server.route({
        method: 'GET',
        path: '/components/{param*}',
        handler: {
            directory: {
                path: 'ui/components/',
                listing: false,
                index: true
            }
        }
    });
    // serve index
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            return reply.file('ui/index.html');
        }
    });
    // serve app
    server.route({
        method: 'GET',
        path: '/app.js',
        handler: function (request, reply) {
            return reply.file('ui/app.js');
        }
    });
    // serve controllers
    server.route({
        method: 'GET',
        path: '/controllers.js',
        handler: function (request, reply) {
            return reply.file('ui/controllers.js');
        }
    });
    //========= End of Files ====== //


    //========= Start of API ====== //

    server.route({
        method: "GET",
        path: "/data/{year}",
        handler: async (request, response) => {
            var data = {};
            data = await axios.get('https://opendata.maryland.gov/resource/gja3-vy5r.json?fiscal_year='+request.params.year+'&$limit=50000')
                .then(response => {
                    return helper.spentByZipcode(response.data);
                })
                .catch(error => {
                    console.log(error);
                    return {};
                });
            response(data);
        }
    });

    // Get Request for data fisical_year
    server.route({
        method: "GET",
        path: "/nominatim/{zipcode}",
        handler: async (request, response) => {
            var data = {};
            data = await axios.get('https://nominatim.openstreetmap.org/search.php?country=USA&postalcode='+request.params.zipcode+'&polygon_geojson=1&format=jsonv2')
                .then(response => {
                    console.log(response.data);
                    if(response.data.length == 0){
                        return {};
                    }
                    return {
                        lat: response.data[0].lat,
                        lon: response.data[0].lon
                    }
                })
                .catch(error => {
                    console.log(error);
                    return {};
                });
            response(data);
        }
    });


    //========= End of API ====== //





    //Start the Hapi server
    server.start(function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('Server started');
    });
});

