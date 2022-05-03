let webpack = require('webpack');
let mix = require('laravel-mix');
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
const HTTP_PORT = process.env?.HTTP_PORT ?? 80;
const WS_PORT = process.env?.WS_PORT ?? 81;
const HMR_PORT = process.env?.HMR_PORT ?? 82;
const HOSTNAME = process.env?.HOSTNAME ?? '0.0.0.0';
const WS_HOSTNAME = process.env?.WS_HOSTNAME ?? 'localhost';

mix.options({
	hmrOptions:{
		host: 'localhost',
		port: HMR_PORT
	}
});
mix.webpackConfig(webpack => {
    return {
	devServer:{
        host: HOSTNAME,
		port: HMR_PORT,
        compress:true,
        https: {
            ca:     path.join(__dirname,'../ssl/ca.crt'),
            pfx:    path.join('../ssl/cardssitecert.pfx'),
            key:    path.join('../ssl/decrypted.key'),
            cert:   path.join('../ssl/cert.crt'),
            // requestCert: true,
            passphrase: 'admin',
            rejectUnhauthorized: false,
        },
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        static: {
            serveIndex:true,
            directory: path.join(__dirname, '/'),
            publicPath: '/public'
        },
        client: {
            // https://stackoverflow.com/questions/69719003/webpack-devserver-hmr-not-working-with-ngrok-docker
            webSocketURL: `wss://${HOSTNAME}:${HMR_PORT}/ws`,
            progress: true,
            overlay: true,
        }
	},
        plugins: [
            new webpack.DefinePlugin({
                HOSTNAME:'"'+HOSTNAME+'"',
                HTTP_PORT:'"'+HTTP_PORT+'"',
                WS_HOSTNAME: '"'+WS_HOSTNAME+'"',
                WS_PORT:(WS_PORT).toString(),
                HMR_PORT:(HMR_PORT).toString()
            })
        ]
    };
});

mix.setPublicPath('./public')
// .js('client/2d-client/client.mjs', 'dist')
.js('client/client3d.mjs', './public/dist')
.vue({ version:3});

