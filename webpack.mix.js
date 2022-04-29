let mix = require('laravel-mix');

mix.setPublicPath('public/dist')
.js('client/client.mjs', 'public/dist')
.js('client/client3d.mjs', 'public/dist')