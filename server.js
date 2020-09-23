'use strict';

var Hapi = require('hapi');

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

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            return reply.file('ui/index.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/app.js',
        handler: function (request, reply) {
            return reply.file('ui/app.js');
        }
    });

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


    server.start(function (err) {
        if (err) {
            return console.error(err);
        }
        console.log('Server started');
    });
});

