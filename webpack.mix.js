let webpack = require('webpack');
let mix = require('laravel-mix');
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
const HTTP_PORT = process.env?.HTTP_PORT ?? 80;
const WS_PORT = process.env?.WS_PORT ?? 81;
const HOSTNAME = process.env?.HOSTNAME ?? '0.0.0.0';
const WS_HOSTNAME = process.env?.WS_HOSTNAME ?? 'localhost';

mix.options({
	hmrOptions:{
		host: 'localhost',
		port: 3092
	}
});
mix.webpackConfig(webpack => {
    return {
	devServer:{
        host: '0.0.0.0',
		port: 3092,
        compress:true,
        static: {
            serveIndex:true,
            directory: path.join(__dirname, '/'),
            publicPath: '/public'
        },
        client: {
            // webSocketURL: 'ws://localhost:3092/ws',
            progress: true,
            overlay: true,
        }
	},
        plugins: [
            new webpack.DefinePlugin({
                HOSTNAME:'"'+HOSTNAME+'"',
                HTTP_PORT:'"'+HTTP_PORT+'"',
                WS_HOSTNAME: '"'+WS_HOSTNAME+'"',
                WS_PORT:(WS_PORT).toString()
            })
        ]
    };
});

mix.setPublicPath('./public')
.js('client/client.mjs', 'dist')
.js('client/client3d.mjs', './public/dist')
.vue();

