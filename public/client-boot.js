let loadscript = '/dist/client3d.js';
axios.get('./public/hot').then(res => {
    // HMR enabled
    console.log(res);
    let contents = '';
    // loadscript = res.data.trim().split('\\n').join('')+loadscript;
    loadscript = 'https://'+location.hostname+':3092'+loadscript;
}).catch(err => {
    console.error(err);
    loadscript = './public/'+loadscript; // relative, port 80
}).finally(() => {
    let scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', loadscript);
    document.body.appendChild(scriptEl);
});