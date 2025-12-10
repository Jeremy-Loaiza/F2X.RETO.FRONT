F2X - Frontend Sistema de Recaudos
Descripción
Este repositorio contiene el Frontend del proyecto F2X - Sistema de Recaudos. Corresponde a la interfaz web que consume la API del backend para mostrar y gestionar la información de recaudos.
Repositorio:
https://github.com/Jeremy-Loaiza/F2X.RETO.FRONT
________________________________________
Tecnologías utilizadas
•	HTML5
•	CSS3
•	JavaScript
•	AngularJS 
________________________________________
Descarga del proyecto
Con Git
git clone https://github.com/Jeremy-Loaiza/F2X.RETO.FRONT.git
Sin Git
1.	Ir al repositorio
2.	Clic en Code → Download ZIP
3.	Descomprimir la carpeta
________________________________________



Requisitos
Obligatorios
•	Navegador web (Google Chrome recomendado)
•	Backend en ejecución
Recomendados
•	Visual Studio Code
•	Live Server (extensión)
________________________________________
Librerías utilizadas
El proyecto usa librerías mediante CDN:
•	AngularJS 1.8.x
No requiere instalación obligatoria de paquetes.
Instalación opcional local
Si deseas usar librerías locales:
npm init -y
npm install angular bootstrap jquery
________________________________________
Configuración
Editar el archivo app.js y configurar la URL del backend:
const API_URL = 'http://localhost:PUERTO/api/recaudos';
Reemplazar PUERTO por el puerto real del backend.
________________________________________


Cómo ejecutar
Opción básica
1.	Abrir el archivo index.html en el navegador
Con Live Server
1.	Abrir el proyecto en VS Code
2.	Clic derecho sobre index.html
3.	Seleccionar Open with Live Server
________________________________________
Funcionalidades
•	Listado de recaudos
•	Filtros de búsqueda
•	Paginación
•	Importación de datos
•	Consumo de API REST
________________________________________
Problemas comunes
No se muestran datos
•	Verificar que el backend esté activo
•	Revisar URL configurada en app.js
________________________________________
Autor
Jeremy Loaiza
Reto F2X
________________________________________
Guardar como:
README.md

