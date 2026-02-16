# Etapa de planeación

Este proyecto busca hacer un asistente de IA especializado para automatizar la cadena lógistica de las importaciones y exportaciones en el comercio internacional.

## 1.0 Features planeadas

Las features están basadas en mi proyecto final de la universidad cuando estudiaba la carrera de Comercio internacional.

Mi proyecto final consistió en hacer de forma manual todo el proceso para importar un producto, desde la elección del producto, buscar el proovedor, planear la ruta, llenar papeleo, etc.

### 1.1 Pasos de la cadena logística (Tool 2.6):

#### 1.1.1 Busqueda de proveedor

- **1.1.1.1** Buscar los mejores provedores del producto solicitado (Tool 2.1)
- **1.1.1.2** Comparar precios y condiciones
- **1.1.1.3** Hacer un top Desdendente de los mejores candidatos
- **1.1.1.4** Contactar Con los proveedores, desde el primer puesto hacía abajo hasta recibir respuesta de alguno. (Tool 2.2, 2.3, 2.4)

#### 1.1.2 Recopilar información logistica y burocrática

- **1.1.2.1** Analizar información del usuario y su organización, empresa o negocio independiente.
- **1.1.2.2** Buscar información de transportistas. (Tool 2.1)
- **1.1.2.3** Buscar información y situación de Fiscal de los países y ciudades de ambas partes (2.1).
- **1.1.2.4** Consultar con el usuario de ser necesario (Tool 2.2, 2.3, 2.4).

#### 1.1.3 Realizar Negociación

- **1.1.3.1** Cotizar con el proveedor seleccionado. (Tool 2.2, 2.3, 2.4)
- **1.1.3.2** Negociar precios y condiciones. (Tool 2.2, 2.3, 2.4)
- **1.1.3.3** En base a la información recopilada en el paso 1.1.2, se le presentará al usuario un resumen de la situación actual y se le pedirá su aprobación para continuar, recomendando los mejores terminos y los incoterms (Tool 2.2, 2.3, 2.4, 2.5).

#### 1.1.4 Enviar informes al usuario y esperar aprovación 1 (Tool 2.2, 2.3, 2.4)

#### 1.1.5 Planear ruta logistica.

- **1.1.5.1** Analizar el punto de salida y buscar el punto mejor de llegada si no está 100% definido por el usuario (Tool 2.5).
- **1.1.5.2** Buscar las rutas y los puntos intermedios (la ruta es a partir del punto puesto por el incoterm) (Tool 2.5).
- **1.1.5.3** Enlistar todas las rutas y medios de transporte a usar (Tool 2.5).

#### 1.1.6 Contactar y negociar con transportistas.

- **1.1.6.1** Tomar en cuenta **1.1.5** y hacer un proceso de busqueda y negocación similar a **1.1.1** hasta **1.1.3** pero enfocado a cada medio de transporte y en precios de transporte.
- **1.1.6.2** Realizar ajustes despues de cada negociación y despues de toda la fase.

#### 1.1.7 Enviar informes al usuario y esperar aprovación 2 (Tool 2.2, 2.3, 2.4)

## 2.0 Tools Internas

- 2.1 Busqueda y navegación web
- 2.2 Mensajería Email.
- 2.3 Mensajería sms.
- 2.4 Llamadas telefónicas.
- 2.5 Constructor de rutas.
- 2.6 Crear y llenar documento todo
