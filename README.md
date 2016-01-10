# Dots JS

Inspirado en el popuplar juego [Two Dots], Dots JS ha sido desarrollado haciendo uso de la última versión de Javascript 
conocida como [ES6/ES2015], tiene como fin afianzar los conocimiento de esta nueva versión, aplicando algunas de sus funcionalidades como son:

* Uso de nuevas formas de declarar variables: 
  * ``let`` 
  * ``const``
* [Funciones Arrow]
* [Template Literals]
* [Módulos]
* Entre otras.

Es posible ver un listado de las nuevas funcionalidades que nos trae ES6, en el repositorio denominado 
[ECMAScript 6 equivalents in ES5] realizado por [Addy Osmani]

### Demo

![DOTS](https://dl.dropboxusercontent.com/u/181689/imgdots/dots2.gif)

Es posible acceder al juego a través de la dirección: https://jorger.github.io/dots/

Para dispositivos móviles es posible escanear el siguiente código QR.

![QR](https://dl.dropboxusercontent.com/u/181689/imgdots/qrdots.png?a=1)

En dispositivos móviles basados en Android con navegador Google Chrome, es posible agregar la aplicación a la [pantalla principal], 
esn este caso se hará uso de [manifest.json] para controlar la orientación del dispositivo.

### Funcionalidades.

El objetivo dle juego es unir dos o más puntos del mismo color, una vez realizado éste proceso, los puntos unidos desaparecerán, dando lugar 
a nuevos que son generados aleatoriamente, cuando se forma cierra la figura (se forma un cuadrado o rectángulo), todos los puntos del mismo color desaparecerán, 
los nuevos no contebdrán el mismo color (a no ser que no haya más colores).

Existen una serie de muros que no son seleccionables.

![DOTS](https://dl.dropboxusercontent.com/u/181689/imgdots/dots3.gif)

En algunos escenarios el objetivo será llevar una serie de anclas hasta la base del juego, una vez se encuentran en este punto desaparecerán, 
éstas no pueden ser seleccionadas.

![DOTS](https://dl.dropboxusercontent.com/u/181689/imgdots/dots4.gif)

### Stack

Debido a que todos los navegadores aún no soportan algunas de las nuevas funcionalidades de ES6, se hace necesario realizar una "traducción" 
de éste a la versión estable como es ES5, para tal fin se ha hecho uso de [BabelJS] además de [Browserify] para el manejo de módulos.

Además de otras librerías que se encuentran específicadas en el archivo **package.json**

Para la instación de estas se debe hacer uso del comando:

```
npm install
```

Para realizar la conversión/empaquetamiento, se deberá ejecutar el comando:

```
npm run watch
```

El cual a su vez ejecuta el comando:

```
watchify desarrollo/main.js -o js/build.js -t [ babelify --presets [ es2015 ] ]
```

Para realizar la compresión de los archivos (js/css), se hace uso de los paquetes **uglifyjs** y **clean-css**.

A través del comando:

```
npm run start
```

Para el manejo de audio se ha hecho uso de la librería [howler], la cual posee la característa de manejar sprite de audios, 
para el presente ejercicio fue vital, ya que permitió que tan sólo se manejrará un archivo de audio, el cual a su vez contenía varios.

El juego está realizado haciendo uso de [Canvas], API proporcionada por la actual versión de HTML5, por ser nativa es posible su 
funcionamiento en cualquier dipositivo, tanto móvil como de escritorio.

### Service Worker

Otras de las características asociadas al juego, ha sido la posibilidad de ser jugado offline, para lo cual se ha hecho uso de 
[Service Worker], se ha tomado como ejemplo la aplicación [airhorn].


### Otras fuentes.

Para la realización del presente actividad se han consultado varias fuentes, tanto vídeos como Blogs/artículos.

* [Javascript ES6 Cheatsheet #2 - the best of JS ES6]
* [Essential ES6 / ES2015 JavaScript]
* [ES6 In Depth: Arrow functions]
* [ARROW FUNCTIONS AND THEIR SCOPE]
* [Learn ES2015]
* [Getting started with Progressive Web Apps]


### Autor
Jorge Rubaino [@ostjh]
License
----
MIT
[@ostjh]:https://twitter.com/ostjh
[Two Dots]:http://weplaydots.com/twodots.html
[ES6/ES2015]:http://www.ecma-international.org/ecma-262/6.0/index.html
[Funciones Arrow]:https://googlechrome.github.io/samples/arrows-es6/
[Template Literals]:https://developers.google.com/web/updates/2015/01/ES6-Template-Strings
[Módulos]:https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Sentencias/import
[ECMAScript 6 equivalents in ES5]:https://github.com/addyosmani/es6-equivalents-in-es5#default-parameters
[Addy Osmani]:https://github.com/addyosmani
[BabelJS]:https://babeljs.io/
[Browserify]:http://browserify.org/
[howler]:https://github.com/goldfire/howler.js
[Service Worker]:http://www.html5rocks.com/en/tutorials/service-worker/introduction/?redirect_from_locale=es
[airhorn]:https://github.com/GoogleChrome/airhorn
[pantalla principal]:https://developer.chrome.com/multidevice/images/home_add.png
[manifest.json]:https://developers.google.com/web/updates/2014/11/Support-for-installable-web-apps-with-webapp-manifest-in-chrome-38-for-Android
[Canvas]:https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
[Javascript ES6 Cheatsheet #2 - the best of JS ES6]: https://www.youtube.com/watch?v=LmL0Gh193M0
[Essential ES6 / ES2015 JavaScript]:https://www.youtube.com/watch?v=CozSF5abcTA
[ES6 In Depth: Arrow functions]: https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/
[ARROW FUNCTIONS AND THEIR SCOPE]:http://jsrocks.org/2014/10/arrow-functions-and-their-scope/
[Learn ES2015]:https://babeljs.io/docs/learn-es2015/
[Getting started with Progressive Web Apps]:https://addyosmani.com/blog/getting-started-with-progressive-web-apps/


