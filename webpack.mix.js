let webpack = require('webpack');
let mix = require('laravel-mix');

const dotenv = require("dotenv");
dotenv.config();
// const HTTP_PORT = process.env?.HTTP_PORT ?? 80;
const WS_PORT = process.env?.WS_PORT ?? 81;
const HOSTNAME = process.env?.HOSTNAME ?? '0.0.0.0';
const WS_HOSTNAME = process.env?.WS_HOSTNAME ?? 'localhost';

mix.webpackConfig(webpack => {
    return {
        plugins: [
            new webpack.DefinePlugin({
                HOSTNAME:'"'+HOSTNAME+'"',
                WS_HOSTNAME: '"'+WS_HOSTNAME+'"',
                WS_PORT:(WS_PORT).toString()
            })
        ]
    };
});

mix.setPublicPath('public/dist')
.js('client/client.mjs', 'public/dist')
.js('client/client3d.mjs', 'public/dist')
.vue();

