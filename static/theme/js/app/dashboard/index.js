var Dashboard = (function (context) {

    function openNewsDialog() {

        App.blockUI({
            //target: $('#news'),
            message: null,
            boxed: true
        });

        context.ajaxRequest("GET", "api/dashboard/getnews")
            .done(function (result) {

                $.get("/js/app/dashboard/newsModalContent.html", function (data) {
                    var compiled = _.template(data);
                    $("#news-container").empty();
                    $("#news-container").append(compiled({ "news": result }));
                })

                $('#newsModal').modal('toggle');

                App.unblockUI();
            })
            .fail(function (jqXHR) {
                toastr["error"]("Loading news failed", "An error occured");
                App.unblockUI();
            })
    }

    function setNewsAsRead() {
        $.get("api/dashboard/newsread", function (data) {
            $("#unreadNewsCount").html("0");
        })
    }

    function InitNotificationStatistics(componentId, container) {

        $(container).html('');
        mApp.block($(container).parent().parent(), {});

        var from = moment().subtract(10, "days").format('YYYY-MM-DD');
        var to = moment().format('YYYY-MM-DD');

        //var api = location.href.toLowerCase().includes("plants")
        //    ? '/api/Notification/GetNotificationStatisticsForComponent/plant/' + componentId + '/' + from + '/' + to
        //    : '/api/Notification/GetNotificationStatisticsForComponent/' + componentId + '/' + from + '/' + to;

        var api = '/api/Notification/GetNotificationStatisticsForComponent/' + componentId + '/' + from + '/' + to;

        $.getJSON(api, function (obj) {

            if (!obj || obj.length == 0) {
                $(container).html('<div class="text-center"><i class="la la-check m--font-success"></i> <i>No Notifications found</i></div>');
                $(container).removeClass('chart');
                $(container).css("height", "");
            }
            else {
                $(container).css("height", "255px");

                if (!_.any(obj, { "date": moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                    obj.push({ date: moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss"), componentUpdateMessageCount: 0 });

                if (!_.any(obj, { "date": moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                    obj.unshift({ date: moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss"), componentUpdateMessageCount: 0 });

                var chart = AmCharts.makeChart(container.slice(1, container.length), {
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
                    }
                });
            }

            mApp.unblock($(container).parent().parent());
        })
            .fail(function () {
                mApp.unblock($(container).parent().parent());


                $(container).html('<div class="text-center"><i class="la la-exclamation-circle m--font-danger"></i> <i>Sorry, something went wrong.</i></div>');
                $(container).removeClass('chart');
                $(container).css("height", "");
            })
    }

    function InitStatistics(componentId, container) {

        $(container).html('');

        mApp.block($(container).parent().parent(), {});

        var from = moment().subtract(10, "days").format('YYYY-MM-DD');
        var to = moment().format('YYYY-MM-DD');

        var api = '/api/Worldmap/GetStatistics/' + componentId + '/' + from + '/' + to + '/day';

        $.getJSON(api, function (obj) {

            if (!obj || obj.length == 0) {
                $(container).html('<div class="text-center"><i class="la la-exclamation-circle m--font-warning"></i> <i>Not enough data to display the chart</i></div>');
                $(container).removeClass('chart');
                $(container).css("height", "");
            }
            else {
                $(container).css("height", "255px");

                if (!_.any(obj, { "date": moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                    obj.push({ date: moment(to).format("YYYY-MM-DDTHH\\:mm\\:ss"), files: 0, values: 0, batches: 0 });

                if (!_.any(obj, { "date": moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss") }))
                    obj.unshift({ date: moment(from).format("YYYY-MM-DDTHH\\:mm\\:ss"), files: 0, values: 0, batches: 0 });

                var chart = AmCharts.makeChart(container.slice(1, container.length), {
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

            mApp.unblock($(container).parent().parent());
        })
            .fail(function () {
                mApp.unblock($(container).parent().parent());

                $(container).html('<div class="text-center"><i class="la la-exclamation-circle m--font-danger"></i> <i>Sorry, something went wrong.</i></div>');
                $(container).removeClass('chart');
                $(container).css("height", "");
            })
    }

    function InitDashboard() {

        mApp.blockPage({ message: 'Preparing your Dashboard' });

        $.getJSON("/api/Dashboard/FavoriteComponents", function (favs) {

            if (favs && favs.length > 0) {

                $.get("/js/app/dashboard/favoriteComponent.html", function (page) {

                    var compiled = _.template(page);
                    $(compiled({ "favorites": favs }))
                        .hide()
                        .appendTo('#container')
                        .fadeIn();

                    mApp.unblockPage();

                    $('[id^=favTabNotifications-]').click(function () {
                        var componentId = $(this).attr('id').split('-')[1];
                        var notificationContainer = "#notificationsContainer" + componentId;

                        InitNotificationStatistics(componentId, notificationContainer);
                    })

                    $('[id^=favTabStatistics-]').click(function () {
                        var componentId = $(this).attr('id').split('-')[1];
                        var statisticsContainer = "#statisticsContainer" + componentId;

                        InitStatistics(componentId, statisticsContainer);
                    })
                })

            }
            else {
                $.get("/js/app/dashboard/noFavoritesFoundAlert.html", function (page) {
                    var compiled = _.template(page);

                    $(compiled())
                        .hide()
                        .appendTo('#container')
                        .fadeIn();

                    mApp.unblockPage();
                })
            }
        })
    }

    return {
        OpenNewsDialog: openNewsDialog,
        SetNewsAsRead: setNewsAsRead,
        InitDashboard: InitDashboard
    }
}(DataContextBase));


$(document).ready(function () {

    $('#news').on('click', function () {
        Dashboard.OpenNewsDialog();
        Dashboard.SetNewsAsRead();
    })

    Dashboard.InitDashboard();
})

function setLastSelection(basetype) {
    $.getJSON("/api/Dashboard/SetLastSelection/" + basetype, function (data) {
        console.log('selection saved');
    })

}