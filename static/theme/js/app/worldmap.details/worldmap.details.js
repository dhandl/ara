
var WorldmapDetails = (function (context) {

    function InitNotificationsTable() {

        var from = $("#notificationrange").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var to = $("#notificationrange").data('daterangepicker').endDate.format('YYYY-MM-DD');

        //var api = location.href.toLowerCase().includes("plants") ? '/api/Notification/GetByComponentIdIncludeSubcomponentsNotifications/' + componentId + '/' + from + '/' + to
        //    : '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to;

        var api = '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to

        $('#_notificationsTable').bootstrapTable('refresh', { url: api });
    }

    function InitComponent() {
        $.get("/js/app/worldmap.details/loadingProfile.html", function (loadingPage) {
            $(loadingPage)
                .appendTo('#profileContainer');
        })

        var api = location.href.toLowerCase().includes("plants") ? "/api/worldmap/getplants/" + componentId : "/api/worldmap/getmachine/" + componentId;

        context.ajaxRequest("GET", api)
            .done(function (result) {

                var existingImgs = ["BALLMILL", "CONECRUSHER", "CRUSHER", "ROLLERMILL", "DOPPELWALZENBRECHER", "GYRATORY", "HAMMERBRECHER", "IMPACTCRUSHER", "JAWCRUSHER", "POLYCOM", "QUADROPOL", "ROWSIZER", "SAGMUEHLE"];;

                var value = result.properties.type.toUpperCase();
                var width = '80px';

                result.properties.typeImage = existingImgs.includes(value) ? '<img src="/images/machines/' + value + '.png" style="width:' + width + '" alt="' + value + '" title= "' + value + '" class="img-responsive" />'
                    : '<div><i class="fa fa-question-circle" style="font-size: 50px;color: darkorange;" aria-hidden="true" title="' + value + '"></i></div>';


                $.get("/js/app/worldmap.details/componentProfile.html", function (page) {
                    var compiled = _.template(page);

                    console.log(result);
                    $("#profileContainer").empty();

                    $(compiled(result.properties))
                        .hide()
                        .appendTo('#profileContainer')
                        .fadeIn();
                })


                if (result.properties.status.dashboard) {
                    $("#trendDashboard").attr("href", result.properties.status.dashboard);
                    $("#dashboard").click(function () { window.open(result.properties.status.dashboard, 'Dashboard') }).css("cursor", "pointer");
                }
                else {
                    $("#statisticsDashboard").addClass("link-disable");
                    $("#statisticsDashboard").parent().css("opacity", "0.3").css("cursor", "not-allowed");
                }

                if (result.properties.status.report) {
                    $("#reportDashboard").attr("href", result.properties.status.report);
                    $("#report").click(function () { window.open(result.properties.status.report, 'Report') }).css("cursor", "pointer");
                }
                else {
                    $("#reportDashboard").addClass("link-disable");
                    $("#reportDashboard").parent().css("opacity", "0.3").css("cursor", "not-allowed");
                }

                if (result.properties.status.statistics) {
                    $("#statisticsDashboard").attr("href", result.properties.status.statistics);
                    $("#analytics").click(function () { window.open(result.properties.status.statistics, 'Analytics') }).css("cursor", "pointer");
                }
                else {
                    $("#statisticsDashboard").addClass("link-disable");
                    $("#statisticsDashboard").parent().css("opacity", "0.3").css("cursor", "not-allowed");
                }

                if (result.properties.status.machineviews) {
                    $("#machineViewDashboard").attr("href", result.properties.status.machineviews);
                    $("#machines").click(function () { window.open(result.properties.status.machineviews, 'MachineView') }).css("cursor", "pointer");
                }
                else {
                    $("#machineViewDashboard").parent().css("opacity", "0.3").css("cursor", "not-allowed");
                    $("#machineViewDashboard").addClass("link-disable");
                }

            })
            .fail(function (jqXHR) {
                toastr["error"]("Loading component failed", "An error occured");
                mApp.unblock($('.dashboard-stat'));
            })
    }

    function InitSubComponentsTable() {

        $('#tableSubcomponents').bootstrapTable({
            url: '/api/Worldmap/GetSubcomponents/' + componentId,
            striped: true,
            search: true,
            rememberOrder: true,
            sortName: 'name',
            formatNoMatches: function () {
                return 'No Notifications found';
            },
            columns: [{
                title: 'Id',
                field: 'id',
                idField: 'id',
                visible: false
            }, {
                title: ' ',
                field: 'properties.onlinestate',
                sortable: false,
                width: '3%',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {

                    var pulsate = row.notificationsCount > 0 ? 'pulsate' + row.id : '';

                    switch (value) {
                        case "unknown":
                            return '<i id="' + pulsate + '" class="fa fa-circle font-grey-silver"></i>';
                        case "true":
                            return '<i id="' + pulsate + '" class="fa fa-circle font-green-jungle"></i>';
                        case "false":
                            return '<i id="' + pulsate + '" class="fa fa-circle font-red"></i>';
                        default:
                    }
                }
            }, {
                title: 'Name',
                field: 'name',
                sortable: true,
                align: 'center',
                valign: 'middle'
            }, {
                title: 'Type',
                field: 'type',
                sortable: true,
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {
                    var existingImgs = ["BALLMILL", "CONECRUSHER", "CRUSHER", "ROLLERMILL", "DOPPELWALZENBRECHER", "GYRATORY", "HAMMERBRECHER", "IMPACTCRUSHER", "JAWCRUSHER", "POLYCOM", "QUADROPOL", "ROWSIZER", "SAGMUEHLE"];

                    var width = '30px';

                    var image = existingImgs.includes(value.toUpperCase()) ? '<img src="/images/machines/' + value + '.png" width="' + width + '" alt="' + value + '" title= "' + value + '"  />'
                        : '<i class="fa fa-question-circle" style="font-size: 25px;color: darkorange;" aria-hidden="true" title="' + value + '"></i>';

                    return image;
                }
            }, {
                title: 'Last Update',
                field: 'lastUpdate',
                sortable: true,
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {
                    if (value)
                        return moment(value).format("DD.MM.YYYY, HH:mm:ss");

                    return '<span class="label bg-grey-silver bg-grey-silver"> Not known </span>';
                }
            }]
        });
    }

    function InitSubcomponentMetrics() {

        //App.block({
        //    target: $('.dashboard-stat2'),
        //    boxed: true
        //});

        context.ajaxRequest("GET", "/api/worldmap/GetSubcomponentsMetrics/" + componentId)
            .done(function (result) {
                $("#metricTotalMachines").html(result.total);
                $("#metricOnlineMachines").html(result.online);
                $("#metricOfflineMachines").html(result.offline);

                //$(".counter").counterUp();
            })
            .fail(function (jqXHR) {
                toastr["error"]("Loading metrics failed", "An error occured");
            })
    }

    function InitNotificationStatistics() {
        mApp.block($('#notificationsStatistics').parent(), {});

        var from = $("#notificationrange").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var to = $("#notificationrange").data('daterangepicker').endDate.format('YYYY-MM-DD');

        //var api = location.href.toLowerCase().includes("plants")
        //    ? '/api/Notification/GetNotificationStatisticsForComponent/plant/' + componentId + '/' + from + '/' + to
        //    : '/api/Notification/GetNotificationStatisticsForComponent/' + componentId + '/' + from + '/' + to;

        var api = '/api/Notification/GetNotificationStatisticsForComponent/' + componentId + '/' + from + '/' + to;

        $.getJSON(api, function (obj) {
            mApp.unblock($('#notificationsStatistics').parent());

            if (!obj || obj.length == 0) {
                $("#notificationsStatistics").html('<div class="text-center"><i class="la la-check m--font-success"></i> <i>No Notifications found</i></div>');
                $("#notificationsStatistics").removeClass('chart');
                $("#notificationsStatistics").css("height", "");
            }
            else {
                $("#notificationsStatistics").css("height", "300px");

                if (!_.any(obj, { "date": moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                    obj.push({ date: moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss"), componentUpdateMessageCount: 0 });

                if (!_.any(obj, { "date": moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                    obj.unshift({ date: moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss"), componentUpdateMessageCount: 0 });

                var chart = AmCharts.makeChart("notificationsStatistics", {
                    "type": "serial",
                    "theme": "light",
                    "legend": {
                        "useGraphSettings": true,
                        "valueText": ""
                    },
                    "dataProvider": obj,
                    "valueAxes": [{
                        "id": "v1",
                        "axisColor": "#FF6600",
                        "axisThickness": 2,
                        "axisAlpha": 1,
                        "position": "left"
                    }],
                    "graphs": [{
                        "valueAxis": "v1",
                        "lineColor": "#e87e04",
                        "fillColors": "#e87e04",
                        "fillAlphas": 1,
                        "title": "Onlinestate Changed",
                        "valueField": "componentUpdateMessageCount",
                        "balloonText": "<b>[[componentUpdateMessageCount]]</b>",
                        "type": "column",
                        "columnWidth": "0.8",
                        "clustered": false
                    }],
                    "chartCursor": {
                        "cursorPosition": "mouse"
                    },
                    "categoryField": "date",
                    "categoryAxis": {
                        "parseDates": true,
                        "axisColor": "#DADADA",
                        "minorGridEnabled": true
                    },
                    "listeners": [{
                        "event": "clickGraphItem",
                        "method": function (event) {
                            if (!document.getElementById("resetFilter")) {
                                $('#tableNotificationsContainer').find(".fixed-table-toolbar").append("<div class'pull-right button'><button id='resetFilter' class='btn red'><i class='fa fa-times'></i> Reset filter</button></div>");
                                $("#resetFilter").on("click", function (e) {

                                    var from = $("#notificationrange").data('daterangepicker').startDate.format('YYYY-MM-DD');
                                    var to = $("#notificationrange").data('daterangepicker').endDate.format('YYYY-MM-DD');

                                    //var api = location.href.toLowerCase().includes("plants")
                                    //    ? '/api/Notification/GetByComponentIdIncludeSubcomponentsNotifications/' + componentId + '/' + from + '/' + to
                                    //    : '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to;

                                    var api = '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to;

                                    $('#_notificationsTable').bootstrapTable('refresh', { url: api });

                                    console.log($("#resetFilter"));
                                    console.log($("#resetFilter").remove());
                                    console.log($("#resetFilter"));
                                })
                            }

                            //var url = location.href.toLowerCase().includes("plants")
                            //    ? '/api/Notification/GetByComponentIdIncludeSubcomponentsNotifications/' + componentId + '/' + event.item.dataContext.date + '/' + event.item.dataContext.date
                            //    : '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + event.item.dataContext.date + '/' + event.item.dataContext.date;

                            var url = '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + event.item.dataContext.date + '/' + event.item.dataContext.date;

                            $('#_notificationsTable').bootstrapTable('refresh', { url: url });
                        }
                    }, {
                        "event": "zoomed",
                        "method": function (e) {

                            var from = moment(e.startDate).format('YYYY-MM-DD');
                            var to = moment(e.endDate).format('YYYY-MM-DD');

                            var url = '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to;

                            $('#_notificationsTable').bootstrapTable('refresh', { url: url });
                        }
                    }]
                });
            }
        })
    }

    function InitJournal() {

        mApp.block($('#journalContainer'), {});

        var from = $("#journalrange").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var to = moment(addDays($("#journalrange").data('daterangepicker').endDate, 1)).format('YYYY-MM-DD');

        var api = "/api/Worldmap/GetJournal/" + componentId + "/" + from + "/" + to;

        context.ajaxRequest("GET", api)
            .done(function (result) {

                if (result && result.length > 0) {
                    $.get("/js/app/worldmap.details/journal.html", function (page) {
                        var compiled = _.template(page);

                        $("#journalContainer").empty();

                        $(compiled({ "journalItems": result }))
                            .hide()
                            .appendTo('#journalContainer')
                            .fadeIn();
                    })
                }
                else {
                    $("#journalContainer").empty();
                    $("#journalContainer").html('<div class="text-center"><i class="fa fa-info-circle m--font-warning"></i> <i>No entries found</i></div>');
                }


                mApp.unblock($('#journalContainer'));
            })
            .fail(function (jqXHR) {
                toastr["error"]("Loading journal failed", "An error occured");
                mApp.unblock($('#journalContainer'));

                $("#journalContainer").empty();
                $("#journalContainer").html('<div class="text-center"><i class="la la-exclamation-circle m--font-danger"></i> <i>Sorry something went wrong</i></div>');
            })

        $("#saveNewJournalEntry").off('click').click(function () {
            context.ajaxRequest("POST", "/api/Worldmap/SetJournalEntry", JSON.stringify({ "componentId": componentId, "entry": $("#journalEntry").val() }), "text")
                .done(function (result) {
                    $("#journalEntry").val("");
                    toastr["success"]("New journal entry created", "Request was successfull");
                    InitJournal();
                })
                .fail(function (jqXHR) {
                    toastr["error"]("Creating new journal entry failed", "An error occured");
                })
        })
    }

    function InitDateRangePicker(div) {
        $('#' + div).daterangepicker({
            format: 'DD, MM, YYYY',
            separator: ' to ',
            startDate: moment().subtract('days', 29),
            endDate: moment(),
            ranges: {
                'Last 7 Days': [moment().subtract('days', 6), moment()],
                'Last 30 Days': [moment().subtract('days', 29), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
            },
            maxDate: moment(),
        },
            function (start, end) {
                $('#' + div + ' input').val(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            }
        );

        $('#' + div + ' input').val(moment().subtract('days', 29).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

        $('#' + div).on('apply.daterangepicker', function (ev, picker) {

            switch (div) {

                case "defaultrange":
                    drawTheChart($("#defaultrange").data('daterangepicker').startDate.format('YYYY-MM-DD'),
                        $("#defaultrange").data('daterangepicker').endDate.format('YYYY-MM-DD'),
                        componentId,
                        'file');
                    break;
                case "notificationrange":
                    WorldmapDetails.InitNotificationStatistics();

                    var from = $("#notificationrange").data('daterangepicker').startDate.format('YYYY-MM-DD');
                    var to = $("#notificationrange").data('daterangepicker').endDate.format('YYYY-MM-DD');

                    //var api = location.href.toLowerCase().includes("plants") ? '/api/Notification/GetByComponentIdIncludeSubcomponentsNotifications/' + componentId + '/' + from + '/' + to : '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to;

                    var api = '/api/Notification/GetByComponentIdAndDateRange/' + componentId + '/' + from + '/' + to

                    $('#_notificationsTable').bootstrapTable('refresh', { url: api });
                    break;
                case "journalrange":
                    break;
                default:
            }

        });

    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    return {
        InitNotificationsTable: InitNotificationsTable,
        InitComponent: InitComponent,
        InitSubComponentsTable: InitSubComponentsTable,
        InitSubcomponentMetrics: InitSubcomponentMetrics,
        InitNotificationStatistics: InitNotificationStatistics,
        InitDateRangePicker: InitDateRangePicker,
        InitJournal: InitJournal
    }

}(DataContextBase));

$(document).ready(function () {

    WorldmapDetails.InitComponent();

    var daterangePicker = ["defaultrange", "notificationrange", "journalrange"]

    for (var i = 0; i < daterangePicker.length; i++) {
        WorldmapDetails.InitDateRangePicker(daterangePicker[i]);
    }

    WorldmapDetails.InitNotificationStatistics();
    WorldmapDetails.InitJournal();

    $('#tableSubcomponents').on('click-row.bs.table', function (row, rowData) {

        if (rowData.id) {
            location.href = "/Apps/Worldmap/Machines/" + rowData.id;
        }

    });

    $('#tableNotifications').on('click-row.bs.table', function (row, rowData, field) {

        if (!field.context.innerHTML.includes("button")) {

            $.getJSON("/api/notification/" + rowData.id, function (notification) {

                $("#notificationTitle").html(notification.headline);
                $("#notificationContainer").html(notification.content);
                $("#notificationDate").html(moment(notification.created).format('DD MMMM YYYY : HH:mm'));
                $("#goToWorldmap").attr("href", "/apps/worldmap?id=" + JSON.parse(notification.sourceComponent).ComponentId);

                $('#notificationModal').modal('toggle');
            })
        }

    });

    $(window).resize(function () {
        $('#tableSubcomponents').bootstrapTable('resetView');
    });

    drawTheChart($("#defaultrange").data('daterangepicker').startDate.format('YYYY-MM-DD'),
        $("#defaultrange").data('daterangepicker').endDate.format('YYYY-MM-DD'),
        componentId,
        'file');

})

function drawTheChart(from, to, componentId, type) {

    mApp.block($('#chart_2'), {});

    var api = '/api/Worldmap/GetStatistics/' + componentId + '/' + from + '/' + to + '/day';

    $.getJSON(api, function (obj) {
        mApp.unblock($('#chart_2'));

        if (!obj || obj.length == 0) {
            $("#chart_2").html('<div class="text-center"><i class="la la-exclamation-circle m--font-warning"></i> <i>Not enough data to display the chart</i></div>');
            $("#chart_2").removeClass('chart');
            $("#chart_2").css("height", "");
        }
        else {
            $("#chart_2").css("height", "400px");

            if (!_.any(obj, { "date": moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                obj.push({ date: moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss"), files: 0, values: 0, batches: 0 });

            if (!_.any(obj, { "date": moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                obj.unshift({ date: moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss"), files: 0, values: 0, batches: 0 });

            var chart = AmCharts.makeChart("chart_2", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true,
                    "valueText": ""
                },
                "dataProvider": obj,
                "valueAxes": [{
                    "id": "v1",
                    "bullet": "round",
                    "axisColor": "#FF6600",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }, {
                    "id": "v2",
                    "axisColor": "#67809f",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left",
                    "offset": 50
                }, {
                    "id": "v3",
                    "axisColor": "#26C281",
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "offset": 100,
                    "axisAlpha": 1,
                    "position": "left"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#e87e04",
                    "fillColors": "#e87e04",
                    "fillAlphas": 1,
                    "title": "Files",
                    "valueField": "files",
                    "balloonText": "Files: <b>[[files]]</b>",
                    "type": "column",
                    "columnWidth": "0.8", "clustered": false
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#67809f",
                    "fillColors": "#67809f",
                    "fillAlphas": 1,
                    "title": "Batches",
                    "valueField": "batches",
                    "balloonText": "Batches: <b>[[batches]]</b>",
                    "type": "column",
                    "clustered": false,
                    "columnWidth": "0.6"
                }, {
                    "valueAxis": "v3",
                    "lineColor": "#26C281",
                    "fillColors": "#26C281",
                    "fillAlphas": 1,
                    "title": "Values",
                    "balloonText": "Values: <b>[[values]]</b>",
                    "valueField": "values",
                    "type": "column",
                    "clustered": false,
                    "columnWidth": "0.3"
                }],
                "chartScrollbar": {
                    "oppositeAxis": false,
                    "offset": 30
                },
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true,

                    "minumum": from,
                    "maximum": to
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                },
            });

        }
    })
}