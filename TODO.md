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
