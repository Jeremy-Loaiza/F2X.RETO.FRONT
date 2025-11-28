// ======================================================
//  FRONTEND - AngularJS (v1.8)
//  Proyecto: F2X.RETO.FRONT
// ======================================================

angular.module('RecaudosApp', [])
.controller('RecaudoController', function($scope, $http, $timeout) {

    const API_BASE = 'http://localhost:5006/api';

    // ==========================
    // Variables
    // ==========================
    $scope.loading = false;
    $scope.alerta = null;

    $scope.conteoData = [];
    $scope.reporteData = [];
    $scope.reporteDiario = [];
    $scope.estaciones = [];
    $scope.fechas = [];
    $scope.totalesGlobales = {};

    // ✅ NUEVO: Totales por página (conteo diario)
    $scope.totalPaginaCantidad = 0;
    $scope.totalPaginaValor = 0;

    // filtros
    $scope.filtroEstacion = "";
    $scope.filtroHora = "";    // compatibilidad hacia atrás (hora exacta)
    $scope.horaInicio = "";    // para rango (HH:mm)
    $scope.horaFin = "";       // para rango (HH:mm)

    // lista de horas (0..23) para selects
    $scope.horas = Array.from({length: 24}, (_, i) => (i < 10 ? '0'+i : ''+i));

    $scope.ultimaImportacion = { desde: null, hasta: null };

    // Paginación REAL (backend)
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalPages = 1;
    $scope.totalRegistros = 0;


    // ==========================
    // Alertas
    // ==========================
    $scope.showMessage = function(tipo, texto, duracion = 4000) {
        $scope.alerta = { tipo, texto, visible: true };
        $timeout(() => $scope.alerta.visible = false, duracion);
    };


    // ==========================
    // 🔄 Cargar estaciones dinámicamente
    // ==========================
    $scope.loadEstaciones = function() {
        const { desde, hasta } = $scope.ultimaImportacion;
        if (!desde || !hasta) return;

        $http.get(`${API_BASE}/Recaudo/reporte-diario?desde=${desde}&hasta=${hasta}`)
            .then(res => {
                const data = res.data || [];
                $scope.estaciones = [...new Set(data.map(r => r.estacionNombre).filter(Boolean))];
            })
            .catch(() => {
                // fallo silencioso permitido
            });
    };


    // ==========================
    // 1️⃣ Importar Datos
    // ==========================
    $scope.importarDatos = function() {
        if (!$scope.fechaInicio || !$scope.fechaFin) {
            $scope.showMessage("error", "⚠️ Selecciona ambas fechas.");
            return;
        }

        const from = moment($scope.fechaInicio).format('YYYY-MM-DD');
        const to = moment($scope.fechaFin).format('YYYY-MM-DD');

        $scope.loading = true;

        $http.post(`${API_BASE}/Import/fetch-range`, { from, to })
            .then(res => {
                $scope.ultimaImportacion.desde = from;
                $scope.ultimaImportacion.hasta = to;
                $scope.loadEstaciones();
                $scope.showMessage("success", `✅ Se importaron ${res.data.saved} registros.`);
            })
            .catch(err => {
                $scope.showMessage("error", err.data?.error || "❌ Error al importar.");
            })
            .finally(() => $scope.loading = false);
    };


    // ==========================
    // 2️⃣ Conteo Diario + filtros + paginación
    //     Soporta rango de horas
    // ==========================
    $scope.getConteoVehiculos = function(page = 1) {

        if (!$scope.conteoDate) {
            $scope.showMessage("error", "⚠️ Selecciona una fecha.");
            return;
        }

        $scope.currentPage = page;

        const fecha = moment($scope.conteoDate).format('YYYY-MM-DD');
        const { desde, hasta } = $scope.ultimaImportacion;

        const params = new URLSearchParams();
        params.append("page", page);
        params.append("pageSize", $scope.pageSize);

        if (desde && hasta) {
            params.append("desde", desde);
            params.append("hasta", hasta);
        }

        if ($scope.filtroEstacion) {
            params.append("estacion", $scope.filtroEstacion);
        }

        const hasHoraInicio = $scope.horaInicio && $scope.horaInicio !== "";
        const hasHoraFin = $scope.horaFin && $scope.horaFin !== "";

        if (hasHoraInicio || hasHoraFin) {
            if (hasHoraInicio) {
                let hi = $scope.horaInicio.toString();
                if (hi.includes(":")) hi = parseInt(hi.split(":")[0], 10);
                params.append("horaInicio", hi);
            }
            if (hasHoraFin) {
                let hf = $scope.horaFin.toString();
                if (hf.includes(":")) hf = parseInt(hf.split(":")[0], 10);
                params.append("horaFin", hf);
            }
        } else if ($scope.filtroHora) {
            let hora = $scope.filtroHora;
            if (typeof hora === "string" && hora.includes(":")) {
                hora = parseInt(hora.split(":")[0], 10);
            }
            params.append("hora", hora);
        }

        $scope.loading = true;

        $http.get(`${API_BASE}/Recaudo/conteo/${fecha}?${params.toString()}`)
            .then(res => {
                const result = res.data || {};

                $scope.conteoData = result.data || [];
                $scope.totalRegistros = result.total || 0;
                $scope.currentPage = result.page || page;
                $scope.totalPages = result.totalPages || Math.max(1, Math.ceil(($scope.totalRegistros || 0) / $scope.pageSize));

                // ✅ NUEVO: calcular totales visibles en la página
                $scope.totalPaginaCantidad = $scope.conteoData.reduce((s, x) => s + (x.totalVehiculos || 0), 0);
                $scope.totalPaginaValor = $scope.conteoData.reduce((s, x) => s + (x.totalValor || 0), 0);

                if ($scope.conteoData.length === 0) {
                    $scope.showMessage("info", "ℹ️ No hay datos para esa fecha.");
                }
            })
            .catch(err => {
                $scope.showMessage("error", err.data?.detail || "❌ No se pudo obtener el conteo.");
            })
            .finally(() => $scope.loading = false);
    };


    // ✅ Botón LIMPIAR
    $scope.limpiarFiltros = function(){
        $scope.filtroEstacion = "";
        $scope.filtroHora = "";
        $scope.horaInicio = "";
        $scope.horaFin = "";
        $scope.conteoDate = null;
        $scope.conteoData = [];
        $scope.currentPage = 1;
        $scope.totalRegistros = 0;
        $scope.totalPages = 1;
        $scope.totalPaginaCantidad = 0;
        $scope.totalPaginaValor = 0;
    };


    // ==========================
    // Botones de paginación
    // ==========================
    $scope.prevPage = function() {
        if ($scope.currentPage > 1) {
            $scope.getConteoVehiculos($scope.currentPage - 1);
        }
    };

    $scope.nextPage = function() {
        if ($scope.currentPage < $scope.totalPages) {
            $scope.getConteoVehiculos($scope.currentPage + 1);
        }
    };


    // ==========================
    // 3️⃣ Reporte Diario
    // ==========================
    $scope.getReporteDiario = function () {

        $scope.loading = true;
        $scope.reporteDiario = [];
        $scope.estaciones = [];
        $scope.fechas = [];
        $scope.totalesGlobales = {};

        const { desde, hasta } = $scope.ultimaImportacion;
        const params = (desde && hasta) ? `?desde=${desde}&hasta=${hasta}` : "";

        $http.get(`${API_BASE}/Recaudo/reporte-diario${params}`)
            .then(res => {
                const data = res.data || [];

                $scope.estaciones = [...new Set(data.map(d => d.estacionNombre).filter(Boolean))];
                $scope.fechas = [...new Set(data.map(d => moment(d.fecha).format("YYYY-MM-DD")))];

                $scope.reporteDiario = $scope.fechas.map(fecha => {
                    const fila = { fecha };

                    $scope.estaciones.forEach(est => {
                        const registro = data.find(
                            x => moment(x.fecha).format("YYYY-MM-DD") === fecha &&
                            x.estacionNombre === est
                        );

                        fila[est] = registro ?
                            { totalCantidad: registro.totalCantidad, totalValor: registro.totalValor } :
                            { totalCantidad: 0, totalValor: 0 };
                    });

                    return fila;
                });

                $scope.estaciones.forEach(est => {
                    const registros = data.filter(x => x.estacionNombre === est);

                    $scope.totalesGlobales[est] = {
                        totalCantidad: registros.reduce((a, b) => a + b.totalCantidad, 0),
                        totalValor: registros.reduce((a, b) => a + b.totalValor, 0)
                    };
                });

                $scope.totalGeneralCant = Object.values($scope.totalesGlobales).reduce((s, v) => s + (v.totalCantidad || 0), 0);
                $scope.totalGeneralValor = Object.values($scope.totalesGlobales).reduce((s, v) => s + (v.totalValor || 0), 0);

                $scope.showMessage("success", "📅 Reporte diario generado.");
            })
            .catch(err => {
                $scope.showMessage("error", err.data?.detail || "❌ Error.");
            })
            .finally(() => $scope.loading = false);
    };


    // ==========================
    // 4️⃣ Reporte Mensual
    // ==========================
    $scope.getReporteMensual = function () {

        const { desde, hasta } = $scope.ultimaImportacion;
        const params = (desde && hasta) ? `?desde=${desde}&hasta=${hasta}` : "";

        $scope.loading = true;

        $http.get(`${API_BASE}/Recaudo/reporte${params}`)
            .then(res => {
                $scope.reporteData = res.data || [];
                $scope.showMessage("success", "📊 Reporte mensual generado.");
            })
            .catch(err => {
                $scope.showMessage("error", err.data?.detail || "❌ Error.");
            })
            .finally(() => $scope.loading = false);
    };


    // ==========================
    // 5️⃣ Exportar PDF
    // ==========================
    $scope.exportarPDF = function () {

        if (!$scope.reporteData.length) {
            $scope.showMessage("error", "⚠️ No hay datos.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF("landscape");

        doc.setFontSize(18);
        doc.text("Reporte Mensual de Recaudos F2X", 14, 20);

        doc.setFontSize(11);
        doc.text("Generado: " + moment().format("DD/MM/YYYY HH:mm"), 14, 28);

        const columnas = ["Año", "Mes", "Estación", "Total Cant.", "Total Valor"];

        const filas = $scope.reporteData.map(i => [
            i.anio,
            $scope.getMonthName(i.mes),
            i.estacionNombre,
            i.totalCantidad,
            i.totalValor.toLocaleString("es-CO")
        ]);

        doc.autoTable({
            startY: 35,
            head: [columnas],
            body: filas,
            styles: { fontSize: 9 }
        });

        doc.save("Reporte.pdf");
    };


    // ==========================
    // Métodos auxiliares
    // ==========================
    $scope.getMonthName = m => moment().month(m - 1).format("MMMM");

    if ($scope.ultimaImportacion.desde && $scope.ultimaImportacion.hasta) {
        $scope.loadEstaciones();
    }

});
