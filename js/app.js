// ======================================================
//  FRONTEND - AngularJS (v1.8)
//  Proyecto: F2X.RETO.FRONT
// ======================================================

angular.module('RecaudosApp', [])
.controller('RecaudoController', function($scope, $http, $timeout) {

    // 🌍 URL base del backend (.NET)
    const API_BASE = 'http://localhost:5006/api';

    // ==========================
    // 🔹 Variables Globales
    // ==========================
    $scope.loading = false;
    $scope.alerta = null; // 🔔 Mensajes dinámicos (tipo, texto)
    $scope.resultado = '';
    $scope.conteoData = [];
    $scope.reporteData = [];

    // ==========================
    // 🔔 Sistema de mensajes animados
    // ==========================
    $scope.showMessage = function(tipo, texto, duracion = 4000) {
        $scope.alerta = { tipo, texto, visible: true };
        $timeout(() => { $scope.alerta.visible = false; }, duracion);
    };

    // ==========================
    // 1️⃣ Importar Datos (POST /api/Import/fetch-range)
    // ==========================
    $scope.importarDatos = function() {
        if (!$scope.fechaInicio || !$scope.fechaFin) {
            $scope.showMessage("error", "⚠️ Por favor selecciona ambas fechas.");
            return;
        }

        const body = {
            from: moment($scope.fechaInicio).format('YYYY-MM-DD'),
            to: moment($scope.fechaFin).format('YYYY-MM-DD')
        };

        $scope.loading = true;
        $scope.showMessage("info", `⏳ Importando datos desde ${body.from} hasta ${body.to}...`);

        $http.post(`${API_BASE}/Import/fetch-range`, body)
            .then(function(response) {
                $scope.showMessage("success", `✅ Se importaron ${response.data.saved} registros exitosamente.`);
            })
            .catch(function(error) {
                console.error(error);
                $scope.showMessage("error", error.data?.error || "❌ Error al realizar la importación.");
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    // ==========================
    // 2️⃣ Conteo Diario (GET /api/Recaudo/conteo/{fecha})
    // ==========================
    $scope.getConteoVehiculos = function() {
        if (!$scope.conteoDate) {
            $scope.showMessage("error", "⚠️ Por favor selecciona una fecha.");
            return;
        }

        const fecha = moment($scope.conteoDate).format('YYYY-MM-DD');
        $scope.loading = true;
        $scope.conteoData = [];

        $http.get(`${API_BASE}/Recaudo/conteo/${fecha}`)
            .then(function(response) {
                $scope.conteoData = response.data;
                $scope.showMessage("success", `🚗 Se obtuvieron ${response.data.length} registros del conteo diario.`);
            })
            .catch(function(error) {
                console.error(error);
                $scope.showMessage("error", error.data?.detail || "❌ No se pudo obtener el conteo de vehículos.");
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    // ==========================
    // 3️⃣ Reporte Mensual (GET /api/Recaudo/reporte)
    // ==========================
    $scope.getReporteMensual = function() {
        $scope.loading = true;
        $scope.reporteData = [];

        $http.get(`${API_BASE}/Recaudo/reporte`)
            .then(function(response) {
                $scope.reporteData = response.data;
                $scope.showMessage("success", "📊 Reporte mensual cargado correctamente.");
            })
            .catch(function(error) {
                console.error(error);
                $scope.showMessage("error", error.data?.detail || "❌ Error al obtener el reporte mensual.");
            })
            .finally(function() {
                $scope.loading = false;
            });
    };

    // ==========================
    // 4️⃣ Exportar a PDF (jsPDF + autoTable)
    // ==========================
    $scope.exportarPDF = function() {
        if (!$scope.reporteData || $scope.reporteData.length === 0) {
            $scope.showMessage("error", "⚠️ No hay datos disponibles para exportar.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape');
        const fecha = moment().format('DD/MM/YYYY HH:mm');

        doc.setFontSize(18);
        doc.text("Reporte Mensual de Recaudos F2X", 14, 20);
        doc.setFontSize(11);
        doc.text(`Generado: ${fecha}`, 14, 28);

        const columnas = ["Año", "Mes", "Estación", "Total Cantidad", "Total Valor ($)"];
        const filas = $scope.reporteData.map(item => [
            item.anio,
            $scope.getMonthName(item.mes),
            item.estacionNombre,
            item.totalCantidad,
            item.totalValor.toLocaleString('es-CO', { minimumFractionDigits: 2 })
        ]);

        doc.autoTable({
            startY: 35,
            head: [columnas],
            body: filas,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [0, 122, 204] }
        });

        doc.save(`Reporte_Recaudos_${moment().format('YYYYMMDD_HHmm')}.pdf`);
        $scope.showMessage("success", "📄 Reporte exportado correctamente en PDF.");
    };

    // ==========================
    // 5️⃣ Utilidades y filtros
    // ==========================
    $scope.getMonthName = function(month) {
        return moment().month(month - 1).format('MMMM');
    };

    $scope.formatDate = function(dateString) {
        return moment(dateString).format('DD/MM/YYYY');
    };
});
