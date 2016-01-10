//Carga de la librerías que se utilizarán...
"use strict";
import howler from "./howler.min"; //Para el manejo del sonido...
import sweetalert from "./sweetalert.min"; //Para los mensajes...
import utils from "./utils"; //Opciones adicionales...
//Para la generación de sprites del sonido...
const MAX_NOTAS = 12;
let cont_notas = 0;
let notas = (numero) =>
{
    let sounds = {};
    for(let i = 1, base = 0; i <= numero; i++)
    {
        sounds[String(i)] = [base, 500];
        base += 500;
    }
    return sounds;
};
const piano = new Howl({
  urls: ['sounds/notas.mp3'],
  sprite: notas(MAX_NOTAS)
});

//Fin del sonido...
const canvas = utils.accesoDOM(1, "canvas");
const fade = utils.accesoDOM(1, "fade");
const loading = utils.accesoDOM(1, "loading");
const niveles = utils.accesoDOM(1, "niveles");
const botones = utils.accesoDOM(1, "botones");
const home = utils.accesoDOM(1, "home");
const reload = utils.accesoDOM(1, "reload");

let dimensiones 	    = 	{ancho : 320, alto : 480},
    ratio 			    = 	dimensiones.ancho / dimensiones.alto,
    currentHeight 	    = 	window.innerHeight,
    currentWidth 	    = 	(currentHeight * ratio) - 50,
    dimensionesCanvas   =   {w : canvas.width, h : canvas.height},
    ctx                 =   canvas.getContext("2d"),
    radio               =   0,
    separacion          =   0,
    radioDimensiona     =   0,
    circuloSelecciona   =   {

                                    indice  : 0,
                                    fila    : 0,
                                    columna : 0
                            },
    rutaPuntos          =   [], //Guardará la ruta de la unión de los puntos...
    points              =   [], //Guardará los puntos que se han seleccionado...
    hayCuadrado         =   false,
    posMouse            =   {x : 0, y : 0},
    colorCircle         =   [], //Guarda los colores que puede tener los círculos...
    lineaSelecciona     =   [], //Guardará la relación de las líneas que se deben mostrar en el escenario...
    animacion           =   {
                                animando    :  false,
                                caida       : false,
                                time        :  0,
                                presionado  : []
                            },
    circulos           =    [],
    newCirculos        =    [],
    objetivo           =    [], //Guardará el contador de los objetos que se deben buscar...
    totalMovimiento    =    0, //El número de movimientos que realizará en el escenario...
    numeroMundo        =    0,
    mundoBloquea       =    Number(localStorage.getItem("dots")) || 1,
    validaAnclas       =    {   //Saber si se ha terminado de encontrar todas las anclas (Número 8)
                                terminaAnclas : false,
                                maxAnclas : 0,
                                totalAnclas : 0
                            },
    mundos             =    [],
    mueveLeft          =    Math.floor((window.innerWidth - currentWidth) / 2),
    anchor             =    new Image(); //Para cargar la imagen del ancla...

//Para el escenario...
botones.style.left = niveles.style.left = mueveLeft + "px";
//Para dimensionar el canvas...
botones.style.width = niveles.style.width = canvas.style.width = currentWidth + "px";
niveles.style.height = canvas.style.height = currentHeight + "px";
reload.style.top = home.style.top = (currentHeight - 100) + "px";
//Para que recargue el escenario...
utils.accesoDOM(1, "reload").addEventListener('click', (event) => {
    calculaPosicionCirculos(mundos[numeroMundo]);
});
//Para volver al menú...
utils.accesoDOM(1, "home").addEventListener('click', (event) => {
    utils.accesoDOM(3, 'escenario').classList.toggle('hover');
    canvas.style.display = "none";
    utils.accesoDOM(2, "front")[0].style.display = "block";
    utils.accesoDOM(2, "back")[0].style.display = "none";
});

//Cargar los mundos que están eb el archivo .json...
utils.getJson('js/worlds.min.json', (err, data) =>
{
    if (!err)
    {
        colorCircle = data.colors;
        mundos = data.worlds;
        let mundoDiv = utils.accesoDOM(1, "mundos");
        //Cargar los mundos para que sean seleccionados....
        for(let i = 1; i <= mundos.length; i++)
        {
            let iDiv = document.createElement('div');
            iDiv.id = `w_${i}`;
            iDiv.className = 'circuloNivel';
            if(i <= mundoBloquea)
            {
                iDiv.style.background = "white";
                iDiv.style.color = "black";
            }
            iDiv.innerHTML = i <= 9 ? '0' + i : i;
            mundoDiv.appendChild(iDiv);
            utils.accesoDOM(1, `w_${i}`).addEventListener('click', (event) => {
                let mundoSelecciona = Number(event.currentTarget.id.split("_")[1]);
                if(mundoSelecciona <= mundoBloquea)
                {
                    utils.accesoDOM(3, 'escenario').classList.toggle('hover');
                    canvas.style.display = "block";
                    utils.accesoDOM(2, "front")[0].style.display = "none";
                    utils.accesoDOM(2, "back")[0].style.display = "block";
                    numeroMundo = mundoSelecciona - 1;
                    calculaPosicionCirculos(mundos[numeroMundo]);
                }
            });
        }
        //Para cargar la imagen del ancla..
        anchor.onload = () =>
        {
            fade.style.display = loading.style.display = "none";
        };
        anchor.src = 'img/anchor32_32.png';
        anchor.id = "anchor";
    }
    else
    {
        swal(
        {
            title: "Error",
            text: "Could not load file worlds",
            showCancelButton: false,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Ok",
            closeOnConfirm: false,
            type: "error"
        });
    }
});

//Para dibujar unos circulos...
let circle = ({x, y, r = radio, color = "red", alpha = 1}) => {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.stroke();
};

let dibujaLinea = ({init, end, w = 6, color}) =>
{
    ctx.beginPath();
    ctx.lineWidth = w;
    ctx.moveTo(init.x, init.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = color;
    ctx.stroke();
};

let animate = () =>
{
    animacion.time = requestAnimationFrame(animate);
    dibujarCirculos();
    //Para animar los elementos que se han presionado...
    if(animacion.animando)
    {
        let elimina = [];
        for(let i = 0; i < animacion.presionado.length; i++)
        {
            let seleciona = circulos[animacion.presionado[i].fila][animacion.presionado[i].columna];
            circle(
                        {
                            x : seleciona.position.x,
                            y : seleciona.position.y,
                            r : radio + (radio * ((animacion.presionado[i].cont / 10) * 3)),
                            color : seleciona.color,
                            alpha : 1 - (animacion.presionado[i].cont / 10)
                        }
                    );
            animacion.presionado[i].cont++;
            if(animacion.presionado[i].cont >= 10)
            {
                elimina.push({type : 1, indice : i});
            }
        }
        for(let i = 0; i < elimina.length; i++)
        {
            if(elimina[i].type === 1)
            {
                animacion.presionado.splice(elimina[i], 1);
            }
        }
    }
};

//Dibuja los circurlos en el escenario...
let dibujarCirculos = () =>
{
    ctx.clearRect(0, 0, dimensionesCanvas.w, dimensionesCanvas.h);
    let posInicial = (dimensionesCanvas.w - ((objetivo.length - 1) * 40)) / 2;
    for(let i = 0; i < objetivo.length; i++)
    {
        circle({
                    x       : posInicial + (i * 40),
                    y       : 25,
                    color   : objetivo[i].color,
                    r : 10
                });
        if(!objetivo[i].terminado)
        {
            ctx.font = "bold 10px Arial";
            ctx.fillStyle =  !hayCuadrado ? "#212121" : "white";
            let txtCanvas = `${objetivo[i].total} / ${objetivo[i].maximo}`;
            ctx.fillText(txtCanvas, (posInicial + (i * 40)) - 14, 50);
            //Es un ancla...
            if(objetivo[i].numero === 8)
            {
                ctx.drawImage(anchor, (posInicial + (i * 40)) - 10, 15, 20, 20);
            }
        }
        else
        {
            dibujaLinea(
                            {
                                init : {x : (posInicial + (i * 40)) - 6, y : 25}, //3
                                end  : {x : (posInicial + (i * 40)), y : 30},
                                color : "white",
                                w : 3
                            }
                       );
           dibujaLinea(
                           {
                               init : {x : (posInicial + (i * 40)), y : 30}, //3
                               end  : {x : (posInicial + (i * 40)) + 6, y : 20},
                               color : "white",
                               w : 3
                           }
                      );
        }
    }
    //Para imprimir los movimientos...
    ctx.font = "bold 30px Arial";
    ctx.fillStyle =  !hayCuadrado ? (totalMovimiento > 5 ? "#212121" : "red") : "white";
    ctx.fillText(totalMovimiento <= 9 ? `0${totalMovimiento}` : totalMovimiento, (dimensionesCanvas.w / 2) - 15, dimensionesCanvas.h - 40);
    ctx.font = "bold 15px Arial";
    ctx.fillText("Moves", (dimensionesCanvas.w / 2) - 20, dimensionesCanvas.h - 20);
    //Fin de imprimier los movimientos...
    //movimiento
    let totalElementos = 0;
    for(let i = 0; i < circulos.length; i++)
    {
        for(let c = 0; c < circulos[i].length; c++)
        {
            ctx.shadowBlur = 0;
            let posCirculo = {x : circulos[i][c].position.x, y : circulos[i][c].position.y};
            if(animacion.caida && circulos[i][c].animacion.cae)
            {
                //Está haciendo una animación de caída...
                circulos[i][c].animacion.y += 15; //10
                if(circulos[i][c].animacion.y < posCirculo.y)
                {
                    posCirculo.y = circulos[i][c].animacion.y;
                }
                else
                {
                    circulos[i][c].animacion.cae = false;
                    circulos[i][c].hide = true;
                }
            }
            else
            {
                totalElementos++;
            }
            if(circulos[i][c].visible)
            {
                circle({
                            x       : posCirculo.x,
                            y       : posCirculo.y,
                            color   : circulos[i][c].color
                        });
                //Para el ancla...
                if(circulos[i][c].numberColor === 8)
                {
                    ctx.drawImage(anchor, (posCirculo.x - radio), posCirculo.y - radio, radio * 2, radio * 2);
                }
            }
            else
            {
                //Es un espacio vacío, en el cual se deberá dibujar algo...
                const aumentaRadio = radio + (radio * mundos[numeroMundo].shadow);
                ctx.beginPath();
                ctx.rect(posCirculo.x - aumentaRadio, posCirculo.y - aumentaRadio, aumentaRadio * 2, aumentaRadio * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#C4C4C4';
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'black';
                ctx.stroke();
            }
        }
    }
    ctx.shadowBlur = 0;
    if(animacion.caida)
    {
        if(totalElementos === mundos[numeroMundo].fila * mundos[numeroMundo].columna)
        {
            //Se debe buscar si exiten en las bases anclas, para que se haga la animación de bajar...
            animacion.caida = false;
            newCirculos = []; //Se reincian los nuevos círculos...
            cancelRequestAnimFrame(animacion.time);
            let totalBusca = 0;
            for (let termina of objetivo)
            {
                if(termina.terminado)
                {
                    totalBusca++;
                }
            }
            if(totalBusca === objetivo.length)
            {
                swal(
    			{
    				title: "Excellent",
    				text: "You have exceeded the level",
    				showCancelButton: false,
    				confirmButtonColor: "#DD6B55",
    				confirmButtonText: "Ok",
    				closeOnConfirm: false,
                    type: "success"
    			},
    			() =>
    			{
                    numeroMundo++;
                    if(numeroMundo >= mundos.length)
                    {
                        numeroMundo = 0;
                    }
                    if(numeroMundo + 1 > mundoBloquea)
                    {
                        mundoBloquea = numeroMundo + 1;
                        //Para cambiar el estilo para desbloquear el nivel...
                        utils.accesoDOM(1, `w_${mundoBloquea}`).style.background = "white";
                        utils.accesoDOM(1, `w_${mundoBloquea}`).style.color = "black";
                        localStorage.setItem("dots", mundoBloquea);
                    }
                    calculaPosicionCirculos(mundos[numeroMundo]);
    			});
            }
            else
            {
                if(totalMovimiento === 0)
                {
                    swal(
        			{
        				title: "You're out of moves",
        				showCancelButton: false,
        				confirmButtonColor: "#DD6B55",
        				confirmButtonText: "Ok",
        				closeOnConfirm: false,
                        type: "error"
        			},
                    () =>
        			{
                        calculaPosicionCirculos(mundos[numeroMundo]);
        			});
                }
                else
                {
                    if(!buscaAncla())
                    {
                        //Buscar si no ha quedado "bloqueado" el escenario...
                        if(escenarioBloqueado())
                        {
                            swal({title: `Locked level`, text: `The level is unlocked`,  type: "warning", timer: 3000});
                            desbloqueaNivel();
                            dibujarCirculos();
                        }
                    }
                }
            }
        }
    }
    //Revisar si se puede hacer en una función aparte...
    if(circuloSelecciona.indice !== 0)
    {
        const lineaAvanza = {
                                horizontal : (dimensionesCanvas.w / 6) / 2,
                                vertical : (dimensionesCanvas.h / 6) / 2
                            };
        const numeroLineas = !hayCuadrado ? lineaSelecciona.length : 12;
        if(numeroLineas !== 0)
        {
            const escalaLinea = {
                                    x : lineaAvanza.horizontal * (numeroLineas <= 6 ? numeroLineas : 6),
                                    y : lineaAvanza.vertical * (numeroLineas >= 7 ? numeroLineas - 6 : 0),
                                    color : circulos[circuloSelecciona.fila][circuloSelecciona.columna].color
                                };

            //Horizontal superior...
            dibujaLinea(
                            {
                                init : {x : (dimensionesCanvas.w / 2) - escalaLinea.x, y : 3}, //3
                                end  : {x : (dimensionesCanvas.w / 2) + escalaLinea.x, y : 3},
                                color : escalaLinea.color
                            }
                       );
            //Horizontal Inferior...
            dibujaLinea(
                            {
                                init : {x : (dimensionesCanvas.w / 2) - escalaLinea.x, y : dimensionesCanvas.h - 3},
                                end  : {x : (dimensionesCanvas.w / 2) + escalaLinea.x, y : dimensionesCanvas.h - 3},
                                color : escalaLinea.color
                            }
                       );
            //Para las verticales...
            if(numeroLineas >= 7)
            {
                dibujaLinea(
                                {
                                    init : {x : 3, y : 0},
                                    end  : {x : 3, y : escalaLinea.y},
                                    color : escalaLinea.color
                                }
                           );

               dibujaLinea(
                               {
                                   init : {x : 3, y : dimensionesCanvas.h},
                                   end  : {x : 3, y : dimensionesCanvas.h - (escalaLinea.y)},
                                   color : escalaLinea.color
                               }
                          );
                //Derecha...
                dibujaLinea(
                                {
                                    init : {x : dimensionesCanvas.w - 3.5, y : 0},
                                    end  : {x : dimensionesCanvas.w - 3.5, y : escalaLinea.y},
                                    color : escalaLinea.color
                                }
                           );
               dibujaLinea(
                               {
                                   init : {x : dimensionesCanvas.w - 3.5, y : dimensionesCanvas.h},
                                   end  : {x : dimensionesCanvas.w - 3.5, y : dimensionesCanvas.h - (escalaLinea.y)},
                                   color : escalaLinea.color
                               }
                          );
            }
        }
        for(let i = 0; i < lineaSelecciona.length; i++)
        {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.moveTo(lineaSelecciona[i].line.start.x, lineaSelecciona[i].line.start.y);
            ctx.lineTo(lineaSelecciona[i].line.end.x, lineaSelecciona[i].line.end.y);
            ctx.strokeStyle = lineaSelecciona[i].color;
            ctx.stroke();
        }
        buscaConexion(posMouse.x, posMouse.y);
    }
};

//Para desbloquear el nivel...
let desbloqueaNivel = () =>
{
    //Se deberá "jugar" con los colores existentes...
    //Las "anclas" no se deben tener en cuenta y se deben dejar en la misma posición...
    for(let fila = 0; fila < mundos[numeroMundo].fila; fila++)
    {
        for(let columna = 0; columna < mundos[numeroMundo].columna; columna++)
        {
            if(circulos[fila][columna].numberColor !== 8 && circulos[fila][columna].visible)
            {
                //Inicio...
                let newColor = 0;
                let color = "";
                do
                {
                    let colorValido = false;
                    newColor = Math.floor(Math.random() * colorCircle.length) + 1;
                    for (let buscar of mundos[numeroMundo].colorBusca)
                    {
                        if(buscar.numero === newColor)
                        {
                            colorValido = true;
                            break;
                        }
                    }
                    if(colorValido && newColor !== 8)
                    {
                        break;
                    }
                }while(1);
                color = colorCircle[newColor - 1];
                circulos[fila][columna].numberColor = newColor;
                circulos[fila][columna].color = color;
            }
        }
    }
    if(escenarioBloqueado())
    {
        desbloqueaNivel();
    }
};

//Para buscar si el escenario ha quedado bloqueado...
let escenarioBloqueado = () =>
{
    let direcciones = [[0, -1], [-1, 0], [0, 1], [1, 0]];
    let dirTemporal = {fila : 0, columna : 0};
    let hayBloqueo = true;
    for(let fila = 0; fila < mundos[numeroMundo].fila; fila++)
    {
        for(let columna = 0; columna < mundos[numeroMundo].columna; columna++)
        {
            let numberColor = circulos[fila][columna].numberColor;
            if(numberColor !== 8 && circulos[fila][columna].visible)
            {
                for(let dir = 0; dir < 4; dir++)
                {
                    dirTemporal.fila = fila + direcciones[dir][0];
                    dirTemporal.columna = columna + direcciones[dir][1];
                    let newDireccion = {
                                            fila : dirTemporal.fila >= 0 && dirTemporal.fila < mundos[numeroMundo].fila ? dirTemporal.fila : -1,
                                            columna : dirTemporal.columna >= 0 && dirTemporal.columna < mundos[numeroMundo].columna ? dirTemporal.columna : -1
                                        };
                    if(newDireccion.fila >= 0 && newDireccion.columna >= 0)
                    {
                        if(circulos[newDireccion.fila][newDireccion.columna].numberColor === numberColor)
                        {
                            hayBloqueo = false;
                            break;
                        }
                    }
                }
            }
            if(!hayBloqueo)
            {
                break;
            }
        }
        if(!hayBloqueo)
        {
            break;
        }
    }
    return hayBloqueo;
};

//Para buscar si existe alguna ancla en la base...
let buscaAncla = () =>
{
    newCirculos = []; //Se reincian los nuevos círculos...
    points = [];
    let fila = mundos[numeroMundo].fila - 1; //Se toma la última fila...
    let exiteAncla = false;
    for(let columna = 0; columna < mundos[numeroMundo].columna; columna++)
    {
        if(circulos[fila][columna].numberColor === 8)
        {
            points.push({fila, columna});
            exiteAncla = true;
        }
    }
    if(exiteAncla)
    {
        animate();
        eliminaCirculos(8);
    }
    return exiteAncla;
}

let calculaPosicionCirculos = ({fila, columna, colorBusca, aleatorio = true, escala = {radio : 11, separacion : 40}, movimiento, matrix}) =>
{
    totalMovimiento = movimiento;
    radio = escala.radio;
    separacion = escala.separacion;
    radioDimensiona = Math.round(currentWidth * radio) / dimensionesCanvas.w;
    validaAnclas.terminaAnclas = false; //Por si el escenario tiene anclas...
    validaAnclas.totalAnclas = 0;
    validaAnclas.maxAnclas = mundos[numeroMundo].maxAnclas === undefined ? 0 : mundos[numeroMundo].maxAnclas;
    let indice = 1;
    const centrar = {
                    columna :  (dimensionesCanvas.w - (columna - 1) * separacion) / 2,
                    fila    :  (dimensionesCanvas.h - (fila - 1) * separacion) / 2
                };
    let ciruculoMsg = "";
    objetivo = (() => {
        let buscaElemento = [];
        colorBusca.forEach((busca) =>
        {
            if(busca.buscar)
            {
                buscaElemento.push(
                                    {
                                        numero : busca.numero,
                                        maximo : busca.maximo,
                                        color  : colorCircle[busca.numero - 1],
                                        total  : 0,
                                        terminado  : false
                                    }
                );
                if(ciruculoMsg !== "")
                {
                    ciruculoMsg += "&nbsp&nbsp&nbsp";
                }
                ciruculoMsg += `<div class = 'circuloMsg ${busca.numero === 8 ? 'anclaMsg' : ''}' style = 'background-color:
                                    ${colorCircle[busca.numero - 1]};'>
                                    ${busca.maximo <= 9 ? '0' + busca.maximo : busca.maximo}
                                </div>`;
            }
        });
        return buscaElemento;
    })();
    circulos = []; //Se reinicia el array de círculos...
    for(let f = 0; f < fila; f++)
    {
        circulos.push([]);
        for(let c = 0; c < columna; c++)
        {
            let visible = true;
            let position = {x : (c * separacion) + centrar.columna, y : (f * separacion) + centrar.fila};
            let x = Math.round(Math.abs(((currentWidth * position.x) / dimensionesCanvas.w) - radioDimensiona));
            let y = Math.round(((currentHeight * position.y) / dimensionesCanvas.h) - radioDimensiona);
            let coordinate = {
                                start   : {x, y},
                                end     :   {
                                                x : x + (radioDimensiona * 2),
                                                y : y + (radioDimensiona * 2)
                                            }
                            };
            let numberColor = 0;
            let color = "";
            if(aleatorio)
            {
                //Deberá buscar el color de acuerdo a los que han llegado...
                //Buscar si existe una mejor opción para la búsqueda del color...
                do
                {
                    numberColor = Math.floor(Math.random() * colorCircle.length) + 1;
                    let colorValido = false;
                    for (let buscar of colorBusca)
                    {
                        if(buscar.numero === numberColor)
                        {
                            colorValido = true;
                            break;
                        }
                    }
                    if(colorValido)
                    {
                        break;
                    }
                }while(1);
            }
            else
            {
                if(matrix[f][c] !== 0)
                {
                    numberColor = matrix[f][c];
                }
                else
                {
                    visible = false;
                }

            }
            if(visible)
            {
                color = colorCircle[numberColor - 1];
            }
            let animacion = {cae : false, x : 0, y : 0};
            circulos[f].push({coordinate, position, indice, numberColor, color, hide : true, visible, animacion});
            indice++;
        }
    }
    dibujarCirculos();
    //Para buscar si existe un ancla en la base, cuando se carga el escenario...
    let txtLevel = numeroMundo + 1 <= 9 ? `0${numeroMundo + 1}` : numeroMundo + 1;
    swal(
    {
        imageUrl: "img/icon.png",
        title: `<h1>World ${txtLevel}</h1>${totalMovimiento} moves`,
        text: ciruculoMsg,
        html: true
    },
    () =>
    {
        if(!buscaAncla())
        {
            //Buscar si no ha quedado "bloqueado" el escenario...
            if(escenarioBloqueado())
            {
                swal({title: `Locked level`, text: `The level is unlocked`,  type: "warning", timer: 3000});
                desbloqueaNivel();
                dibujarCirculos();
            }
        }
    });
};

//Para buscar el elemento que se ha presionando...
let buscarElemento = (x, y) =>
{
    let seleCirculo = {fila : 0, columna : 0, indice : 0};
    for(let i = 0; i < circulos.length; i++)
    {
        for(let c = 0; c < circulos[i].length; c++)
        {
            if((x >= circulos[i][c].coordinate.start.x && x <= circulos[i][c].coordinate.end.x) && (y >= circulos[i][c].coordinate.start.y && y <= circulos[i][c].coordinate.end.y) && circulos[i][c].visible && circulos[i][c].numberColor !== 8)
            {
                seleCirculo.fila = i;
                seleCirculo.columna = c;
                seleCirculo.indice = circulos[i][c].indice;
                break;
            }
        }
    }
    return seleCirculo;
};

let buscaConexion = (x, y) =>
{
    //Buscar los elementos cercanos cuando se tiene seleccionado...
    let seleciona = circulos[circuloSelecciona.fila][circuloSelecciona.columna];
    let {fila, columna, indice} = buscarElemento(x, y);
    if(indice !== 0 && indice !== circuloSelecciona.indice && seleciona.numberColor === circulos[fila][columna].numberColor && circulos[fila][columna].visible)
    {
        //Buscar si el elemento al cual ha llegado ya estaba en las líneas...
        //Si es así, se deberá eliminar la lína...
        //Para buscar los elementos...
        let direcciones = [[0, -1], [-1, 0], [0, 1], [1, 0]];
        let dirTemporal = {fila : 0, columna : 0};
        let direccionValida = false;
        for(let dir = 0; dir < 4; dir++)
        {
            dirTemporal.fila = circuloSelecciona.fila + direcciones[dir][0];
            dirTemporal.columna = circuloSelecciona.columna + direcciones[dir][1];
            let newDireccion = {
                                    fila : dirTemporal.fila >= 0 && dirTemporal.fila < mundos[numeroMundo].fila ? dirTemporal.fila : -1,
                                    columna : dirTemporal.columna >= 0 && dirTemporal.columna < mundos[numeroMundo].columna ? dirTemporal.columna : -1
            };
            if(newDireccion.fila === fila && newDireccion.columna === columna)
            {
                direccionValida = true;
                break;
            }
        }
        //Se deberá buscar si el elemento es válido en la dirección...
        if(direccionValida)
        {
            //Guardar la línea que se forma entre los puntos...
            let existeLinea = false;
            //Saber si el último elemento concide con la línea eso quiere decir que ya existe...
            let lineaHecha = false;
            for(let i = 0; i < lineaSelecciona.length; i++)
            {
                let puntoAnterior = lineaSelecciona[i].point.origen === rutaPuntos[rutaPuntos.length - 1].origen && lineaSelecciona[i].point.destino === rutaPuntos[rutaPuntos.length - 1].destino;
                let puntoRegresa = lineaSelecciona[i].point.origen === indice && lineaSelecciona[i].point.destino === seleciona.indice;
                if(puntoAnterior && puntoRegresa)
                {
                    existeLinea = true;
                    points.splice(points.length - 1, 1);
                    lineaSelecciona.splice(i, 1);
                    rutaPuntos.splice(rutaPuntos.length - 1, 1);
                    hayCuadrado = false;
                    canvas.style.background = "white";
                    piano.play(String(cont_notas = cont_notas - 1 >= 1 ? cont_notas - 1 : 12));
                    break;
                }
                else if((lineaSelecciona[i].point.origen === seleciona.indice && lineaSelecciona[i].point.destino === indice) || (lineaSelecciona[i].point.origen === indice && lineaSelecciona[i].point.destino === seleciona.indice))
                {
                    lineaHecha = existeLinea = true;
                    break;
                }
            }
            if(!existeLinea && !hayCuadrado)
            {
                lineaSelecciona.push({
                                        line :
                                                {
                                                    start   : {x : seleciona.position.x, y : seleciona.position.y},
                                                    end     : {x : circulos[fila][columna].position.x, y : circulos[fila][columna].position.y},
                                                },
                                        point : {
                                                    origen  : seleciona.indice,
                                                    destino : indice
                                                },
                                        color :  circulos[fila][columna].color
                });
                //Se debe buscar si el punto ya existe, para validar si se ha hecho un cuadrado...
                rutaPuntos.push({
                                    origen : seleciona.indice,
                                    destino : indice,

                                });
            }
            if(!lineaHecha && !hayCuadrado)
            {
                if(existeCuadrado(points, {fila, columna}) && !existeLinea)
                {
                    hayCuadrado = true;
                    //Poner el color de lo que se está generando de fondo..
                    const colorFondo = utils.hexToRgb(circulos[fila][columna].color);
                    canvas.style.background = `rgba(${colorFondo.r}, ${colorFondo.g}, ${colorFondo.b}, 0.4)`;
                    piano.play(String(MAX_NOTAS));
                    //navigator.vibrate(400);
                }
                if(!existeLinea)
                {
                    points.push({fila, columna});
                    piano.play(String(cont_notas = cont_notas + 1 <= 12 ? cont_notas + 1 : 1));
                }
                circuloSelecciona.indice = indice;
                circuloSelecciona.fila = fila;
                circuloSelecciona.columna = columna;
                seleciona = circulos[fila][columna];
                //Para guardar el elemento que se debe animar...
                //Para la animación de todos los demás cuando existe un cuadrado...
                if(hayCuadrado)
                {
                    for(let i = 0; i < circulos.length; i++)
                    {
                        for(let c = 0; c < circulos[i].length; c++)
                        {
                            if(circulos[i][c].numberColor === seleciona.numberColor && circulos[i][c].visible)
                            {
                                animacion.presionado.push({fila : i,  columna : c, cont : 0});
                            }
                        }
                    }
                }
                else
                {
                    animacion.presionado.push({fila, columna, cont : 0});
                }
            }
        }
    }
    //El circulo seleccionado...
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.moveTo(seleciona.position.x, seleciona.position.y);
    let endLine = {
                    x : ((seleciona.position.x * x) / seleciona.coordinate.start.x) - (radioDimensiona / 2),
                    y : ((seleciona.position.y * y) / seleciona.coordinate.start.y) - (radioDimensiona / 2)
    };
    ctx.lineTo(endLine.x, endLine.y);
    ctx.strokeStyle = seleciona.color;
    ctx.stroke();
};

let existeCuadrado = (arr, obj) =>
{
    let esCuadrado = false;
    for(let i = 0; i < arr.length; i++)
	{
    	if (JSON.stringify(arr[i]) === JSON.stringify(obj))
    	{
        	esCuadrado = true;
        	break;
        }
    }
    return esCuadrado;
};

//Reorganizará la matriz de elementos, y dará los valores para la animación de caída...
let organizaCaida = () =>
{
    let contNuevos = 0;
    for(let c = 0; c < mundos[numeroMundo].columna; c++)
    {
        for(let i = mundos[numeroMundo].fila - 1; i >= 0; i--)
        {
            if((!circulos[i][c].hide || circulos[i][c].animacion.cae) && circulos[i][c].visible)
            {
                let ingresa = false;
                for(let encima = i - 1; encima >= 0; encima--)
                {
                    if(circulos[encima][c].hide && !circulos[encima][c].animacion.cae && circulos[encima][c].visible)
                    {
                        ingresa = true;
                        circulos[encima][c].animacion.cae = true;
                        circulos[i][c].animacion.cae = true;
                        circulos[i][c].numberColor = circulos[encima][c].numberColor;
                        circulos[i][c].color = circulos[encima][c].color;
                        circulos[i][c].animacion.x = circulos[encima][c].position.x;
                        circulos[i][c].animacion.y = circulos[encima][c].position.y;
                        break;
                    }
                }
                if(!ingresa)
                {
                    //El elemento, será tomado desde los nuevos...
                    circulos[i][c].numberColor = newCirculos[contNuevos].newColor;
                    circulos[i][c].color = newCirculos[contNuevos].color;
                    circulos[i][c].animacion.cae = true;
                    circulos[i][c].animacion.x = newCirculos[contNuevos].x;
                    circulos[i][c].animacion.y = newCirculos[contNuevos].y;
                    contNuevos++;
                }
            }
        }
    }
};

//Para saber si hay un ancla en la misma fila...
/*
let anclaFila = (columna, color) =>
{
    let existe = false;
    if(color === 8)
    {
        for(let i = 0; i < mundos[numeroMundo].fila; i++)
        {
            if(circulos[i][columna].numberColor === 8)
            {
                existe = true;
                break;
            }
        }
    }
    return existe;
};
*/

let totalAnclasEscenario = () =>
{
    let numeroAnclasEscenario = 0;
    for(let c = 0; c < mundos[numeroMundo].columna; c++)
    {
        for(let i = 0; i < mundos[numeroMundo].fila; i++)
        {
            numeroAnclasEscenario += circulos[i][c].numberColor === 8 ? 1 : 0;
        }
    }
    return numeroAnclasEscenario;
};

let eliminaCirculos = (numberColor) =>
{
    //Primero, si hay un cuadrado, ocultar todos los que hacen parte de ese color...
    //const numberColor = circulos[circuloSelecciona.fila][circuloSelecciona.columna].numberColor;
    const separa = mundos[numeroMundo].escala === undefined ? 40 : mundos[numeroMundo].escala.separacion;
    const centrar = {
                        columna :  (dimensionesCanvas.w - (mundos[numeroMundo].columna - 1) * separa) / 2,
                        fila    :  (dimensionesCanvas.h - (mundos[numeroMundo].fila - 1) * separa) / 2
                    };
    if(hayCuadrado)
    {
        for(let i = 0; i < circulos.length; i++)
        {
            for(let c = 0; c < circulos[i].length; c++)
            {
                if(circulos[i][c].numberColor === numberColor)
                {
                    circulos[i][c].hide = false;
                }
            }
        }
    }
    else
    {
        //Ocultar sólo los que se han seleccionado...
        for(let i = 0; i < points.length; i++)
        {
            circulos[points[i].fila][points[i].columna].hide = false;
        }
    }
    //Crear los que se han ocultado...
    let totalEncuentra = 0;
    let numeroAnclasEscenario = validaAnclas.maxAnclas !== 0 ? totalAnclasEscenario() : 0;
    //let nuevasAnclas = 0;
    let contFila = 1;
    for(let c = 0; c < mundos[numeroMundo].columna; c++)
    {
        contFila = 1;
        for(let i = 0; i < mundos[numeroMundo].fila; i++)
        {
            if(!circulos[i][c].hide)
            {
                let newColor = 0;
                let color = "";
                do
                {
                    let colorValido = false;
                    newColor = Math.floor(Math.random() * colorCircle.length) + 1;
                    for (let buscar of mundos[numeroMundo].colorBusca)
                    {
                        if(buscar.numero === newColor)
                        {
                            colorValido = true;
                            break;
                        }
                    }
                    if(colorValido)
                    {
                        if(!hayCuadrado || newColor !== numberColor || mundos[numeroMundo].colorBusca.length <= 1)
                        {
                            //Saber si se tienen anclas...
                            if(newColor !== 8) // No es un ancla...
                            {
                                break;
                            }
                            else
                            {
                                //Si ya terminó de mostrar todas las anclas...
                                //El número de anclas del escenario es menor y igual que el máximo...
                                //El máximo de anclas debe disminuir en función
                                //validaAnclas.maxAnclas - validaAnclas.totalAnclas
                                if(!validaAnclas.terminaAnclas && (numeroAnclasEscenario + 1 <= (validaAnclas.maxAnclas - validaAnclas.totalAnclas) || validaAnclas.maxAnclas === 0))
                                {
                                    break;
                                }
                            }
                        }
                    }
                }while(1);
                color = colorCircle[newColor - 1];
                newCirculos.push({
                                    x : (c * separa) + centrar.columna,
                                    y : centrar.fila - (contFila * separa),
                                    color,
                                    newColor
                                });
                contFila++;
                totalEncuentra++;
            }
        }
    }

    //Se deberá actualizar el número de elementos encontrados...
    for(let i = 0; i < objetivo.length; i++)
    {
        if(objetivo[i].numero === numberColor)
        {
            //debugger;
            objetivo[i].total += totalEncuentra;
            //Para guardar el núnero de anclas que se han completado...
            validaAnclas.totalAnclas += objetivo[i].numero === 8 ? totalEncuentra : 0;
            if(objetivo[i].total >= objetivo[i].maximo)
            {
                objetivo[i].terminado = true;
                if(objetivo[i].numero === 8)
                {
                    validaAnclas.terminaAnclas = true;
                }
            }
            break;
        }
    }
    //Organizar los elementos de caída...
    organizaCaida();
    animacion.caida = true;
};


let eventoCanvas = (e) =>
{
    if(!animacion.caida)
    {
        e.stopPropagation();
        e.preventDefault();
        let evento = e;
        if(e.type === "touchstart" || e.type === "touchmove" || e.type === "touchend")
        {
            evento = e.touches[0] || e.changedTouches[0];
        }
        const x = (Math.floor(evento.pageX) - canvas.offsetLeft);
        const y = Math.floor(evento.pageY) - canvas.offsetTop;
        if(e.type === "mousedown" || e.type === "touchstart")
        {
            //Buscar la posición del elemento...
            //Se deberá buscar el elemento que se haya seleccionado...
            let seleccionado = buscarElemento(x, y);
            //Evitar multiples eventos de Touch...
            if(seleccionado.indice !== 0 && points.length === 0)
            {
                canvas.style.cursor = "pointer";
                //tapSound.setVolume(100).play();
                circuloSelecciona.indice = seleccionado.indice;
                circuloSelecciona.fila = seleccionado.fila;
                circuloSelecciona.columna = seleccionado.columna;
                //Para guardar el punto...
                points.push({fila : seleccionado.fila, columna : seleccionado.columna});
                hayCuadrado = false;
                rutaPuntos = []; //Se reinicia la ruta de los puntos...
                cont_notas = 1; //Se reinicia el valor de la nota...
                piano.play(String(cont_notas));
                posMouse.x = x;
                posMouse.y = y;
                animacion.animando = true;
                animacion.presionado.push({
                                            fila : seleccionado.fila,
                                            columna : seleccionado.columna,
                                            cont : 0
                                        });
                animate();
            }
        }
        else if(e.type === "mouseup" || e.type === "touchend")
        {
            //Se debe ejecutar una función que oculte los circulos que se han eliminado, además de validar si hay un cudrado...
            canvas.style.cursor = "auto";
            circuloSelecciona.indice = 0;
            if(points.length > 1)
            {
                eliminaCirculos(circulos[circuloSelecciona.fila][circuloSelecciona.columna].numberColor);
                //Resta la cantidad de movimientos que se han realizado...
                totalMovimiento--;
            }
            else
            {
                cancelRequestAnimFrame(animacion.time);
                dibujarCirculos();
            }
            animacion.presionado = [];
            animacion.animando = false;
            //Fin de la función...
            lineaSelecciona = []; //Se reinicia el vector de líneas...
            points = []; //Se reinicia la variable de los puntos, después de la eliminación de los mismo...
            hayCuadrado = false;
            canvas.style.background = "white";
        }
        else if(e.type === "mousemove" || e.type === "touchmove")
        {
            if(circuloSelecciona.indice !== 0)
            {
                posMouse.x = x;
                posMouse.y = y;
            }
        }
    }
};

//Para los eventos de Mouse y Touch..
//Rest Parameters
let addListenerMulti = (el, fn, ...evts) =>
{
    for(let i = 0; i < evts.length; i++)
    {
        el.addEventListener(evts[i], fn, false);
    }
};
addListenerMulti(canvas, eventoCanvas, 'mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchend', 'touchmove');
//Créditos...
console.log('%c Desarrollado por Jorge Rubiano - @ostjh', 'background: blue; color: white; font-size: x-large');
console.log('%c https://twitter.com/ostjh', 'background: green; color: white; font-size: x-large');
