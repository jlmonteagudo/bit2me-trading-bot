NEW VERSION

- En el front, a título orientativo hay que poner el precio actual, el precio stop loss, el precio take profit. Junto al precio stop loss y take profit hay que poner la distancia con respecto al precio actual. Esta información se indicará tanto para posiciones abiertas como para posiciones cerradas.

- En la base de datos se tiene que almacenar (manualmente, más adelante se hará una pantalla de settings) cuánto estamos dispuestos a ganar y cuánto estamos dispuestos a perder. Por ejemplo, con respecto al precio de bitcoin, 250 euros de ganancia y 500 euros de pérdidas. Esta información serán settings de la estrategia. UPDATE: las ganancias y pérdidas tienen que ser mucho menores, porque en el caso de las ganancias se va a ir haciendo trailing stop loss. Por ejemplo, ganancia 50 euros, pérdidas 300 euros.

- Cuando se cree una orden, en base a la configuración de ganancias y pérdidas se almacenará un campo que nos indique el precio del stop loss y el precio del take profit. Se creará una orden stop loss en el exchange. El take profit se puede hacer manual, es decir, el usuario es quién cierra la posición manualmente. Pero, cuando el precio alcance el precio del take profit, entonces se cancelará la orden stop loss, y se creará una nueva con un precio stop loss un poco inferior al precio del take profit. Si el precio sigue subiendo, entonces se irá haciendo un trailing stop loss utilizando un valor absoluto que estará configurado en los settings. Para gestionarlo, podremos tener un campo en la posición que nos indique si estamos en modo trailing stop loss, y si estamos en trailing stop loss entonces  iremos creando nuevas órdenes stop limit utilizando el valor absoluto que incrementa las órdenes stop loss (pueden ser 20, 30 ó 50  euros respecto al precio del bitcoin, hay que analizarlo).

- Si se cierra una posición manualmente, hay que tener en cuenta que antes hay que cancelar la orden stop loss.

---


Implementar métodos de salida globales (válidas para cualquier estrategia). La
estrategia decide si activa la validación de estos métodos de salida.

1. Trailing stop limit

2. exitByIdlePosition: si ha transcurrido cierto periodo de
   tiempo (parametrizable en la estrategia) y la posición no ha superado un
   porcentaje de ganancias, entonces cerrar la posición

3. exitByBetterPerformanceMarket: si en un ciclo se detecta que hay un mercado que
   está subiendo con más fuerza, entonces se cierra la posición para que
   automáticamente se abra una en el mercado que ofrece mejor rendimiento

Los pares pueden estar preseleccionados en la estrategia, o se podría indicar que se base en tickers (últimas 24 horas). Independientemente de cuál de los métodos se utilice habría que comprobar que el volumen en la moneda cuota sea superior a cierto valor.

Hay que parametrizar en la estrategia el valor de stopLossPercentage (0.99 debería ser stopLossPercentage = 1. 0.99 se calcularía mediante (100 - stopLossPercentate) / 100): const stopPrice = truncateFloat(price \* 0.99, market.pricePrecision);

---

- si hay una posición abierta, validar si al orden está open, filled or cancelled. Si está filled o cancelled hay que cancelar la posición. Si la orden está filled, entonces hay que cerrar la posición

- al cancelar, si ya no existe, da error. gestionar error en try catch
