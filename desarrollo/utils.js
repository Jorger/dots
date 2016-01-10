window.cancelRequestAnimFrame = (() => {
    return window.cancelAnimationFrame          ||
        window.webkitCancelRequestAnimationFrame    ||
        window.mozCancelRequestAnimationFrame       ||
        window.oCancelRequestAnimationFrame     ||
        window.msCancelRequestAnimationFrame        ||
        clearTimeout
} )();

window.requestAnimFrame = (() => {
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

//Para convertir el color de Hexadecimal a RGB...
let hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

//Para cargar un archivo JSON...
let getJson = (url, callback) =>
{
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function()
    {
        if (request.status >= 200 && request.status < 400)
        {
            callback(false, JSON.parse(request.responseText));
        }
        else
        {
            callback(true);
        }
    };
    request.onerror = function()
    {
        callback(true);
    };
    request.send();
};

let accesoDOM = (type, param) =>
{
    if(type === 1)
    {
        return document.getElementById(param);
    }
    else if(type === 2)
    {
        return document.getElementsByClassName(param);
    }
    else
    {
        return document.querySelector('#' + param);
    }
};

module.exports = {hexToRgb, getJson, accesoDOM};
