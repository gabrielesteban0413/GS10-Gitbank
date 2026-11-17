# Gidbank — Banca digital

Aplicación móvil de demostración con React Native, Expo y Reanimated. Las
animaciones del taller forman parte de operaciones y controles bancarios; no se
presentan como ejercicios aislados.

> Gidbank es un prototipo educativo. Los saldos y movimientos son ficticios, se
> guardan solo en memoria durante la sesión y no se realizan operaciones reales.

## Instalación y ejecución

Requisitos: Node.js 18 o superior y npm.

```bash
npm install
npm start
```

Inicios específicos: `npm run android`, `npm run ios` o `npm run web`.

## Logo de la aplicación

Coloca tu archivo con el nombre `logo.png` en la carpeta `assets/` de la raíz
del proyecto: `assets/logo.png`. Esa carpeta queda junto a `App.js` y
`package.json`. Cuando esté disponible, se puede conectar en el encabezado de
Inicio y en el encabezado del menú lateral; por ahora la aplicación muestra el
nombre Gidbank como texto.

## Taller de animación integrado en la banca

| # | Requisito | Uso bancario y cómo probarlo |
|---|---|---|
| 1 | Arrastre con rotación | En **Transferir**, elige $25, $50 o $100 y arrastra el importe. El token rota hacia el lado del gesto; suéltalo hacia **Bolsillo Viaje** para preparar el movimiento. |
| 2 | Indicador de carga | Tras preparar el importe, toca **Confirmar transferencia**. El spinner empieza al entrar en el estado de procesamiento y gira en bucle mientras la barra de progreso avanza; al terminar, se actualizan los saldos y la actividad de demostración. |
| 3 | Gestos multitáctiles | En **Tarjetas**, toca **Ver tarjeta**. Usa uno o varios dedos para desplazar, ampliar/reducir y rotar la tarjeta virtual simultáneamente. |
| 4 | Rebote al pulsar | En **Tarjetas**, pulsa **Congelar tarjeta** o **Descongelar**. El control se encoge mientras se presiona y recupera su tamaño con un rebote al soltarlo. |
| 5 | Carrusel animado | En **Tarjetas**, desliza horizontalmente entre Gidbank Débito, Gidbank Virtual y Gidbank Viajes. Las tarjetas cambian con transiciones de posición, escala y rotación. |
| 6 | Acelerómetro | En **Inicio**, agita un dispositivo móvil para ocultar el saldo por privacidad; el icono de privacidad también se anima. Toca el icono del ojo para mostrar el saldo otra vez. El acelerómetro no está disponible en la versión web. |
| 7 | Drawer Navigation | Abre el menú lateral para navegar entre **Inicio, Tarjetas, Transferir, Actividad, Escáner QR, Sucursales, Seguridad** y **Perfil**. El menú reúne funciones bancarias, no páginas separadas para cada ejercicio. |

## Flujos de la aplicación

- **Inicio:** saldo, tarjeta principal, bolsillo de ahorro, actividad reciente y
  controles de privacidad.
- **Transferir:** movimiento de dinero simulado desde la cuenta principal a
  Bolsillo Viaje; al completarlo, cambian el saldo, los ahorros y el historial.
- **Tarjetas:** carrusel de tarjetas, controles locales para congelarlas y una
  vista interactiva para mover, ampliar, rotar y voltear la tarjeta. El reverso
  muestra el titular, los últimos cuatro dígitos, el tipo de tarjeta y el
  estado; los datos sensibles permanecen ocultos.
- **Actividad:** historial de demostración con filtros para ingresos y gastos.
- **Escáner QR, Sucursales, Seguridad y Perfil:** herramientas bancarias y del
  dispositivo disponibles desde el menú lateral.

## Tecnologías

- Expo y React Native
- React Native Reanimated y Worklets
- React Native Gesture Handler
- React Navigation Drawer
- Expo Camera, Location y Sensors

## APK de Android

El perfil `preview` de EAS genera un APK instalable:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```
