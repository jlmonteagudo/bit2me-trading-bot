Implementar métodos de salida globales (válidas para cualquier estrategia). La
estrategia decide si activa la validación de estos métodos de salida.

1. Trailing stop limit

2. exitByIdlePosition: si ha transcurrido cierto periodo de
   tiempo (parametrizable en la estrategia) y la posición no ha superado un
   porcentaje de ganancias, entonces cerrar la posición

3. exitByBetterPerformanceMarket: si en un ciclo se detecta que hay un mercado que
   está subiendo con más fuerza, entonces se cierra la posición para que
   automáticamente se abra una en el mercado que ofrece mejor rendimiento
