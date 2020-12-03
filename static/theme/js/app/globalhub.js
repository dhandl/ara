$(document).ready(function () {

    var connection = new signalR.HubConnection("/globalhub", { transport: signalR.TransportType.WebSockets, logger: signalR.LogLevel.Trace });

    connection.start().catch(function (err) {
        return console.error;
    });

    connection.onclose(function () {
        setTimeout(function () {
            connection.start();
        }, 10000);
    })

    connection.on("NotificationRecevied", function (componentMessage, id) {
        console.log(componentMessage);

        addNewNotificationItem(componentMessage, id, "notificationNew");
        updateNotificationItems(true);

        if (Worldmap && Worldmap.GetMapObject().cluster.getLayers().length > 0) {
            var component = JSON.parse(componentMessage.sourceComponent)
            var m = _.find(Worldmap.GetMapObject().cluster.getLayers(), function (l) { return component.ComponentId == l.feature.properties.id; });

            if (m) {
                switch (component.Onlinestate) {
                    case 0:
                        m.setIcon(Worldmap.GetMapObject().pins.green);
                        m.feature.properties.status.onlinestate = "true";
                        break;
                    case 1:
                        m.setIcon(Worldmap.GetMapObject().pins.red);
                        m.feature.properties.status.onlinestate = "false";
                        break;
                    default:
                        m.setIcon(Worldmap.GetMapObject().pins.grey);
                        m.feature.properties.status.onlinestate = "unknown";
                        break;
                }

                Worldmap.GetMapObject().cluster.refreshClusters();

                $('#tableComponents').bootstrapTable('updateByUniqueId', {
                    id: component.ComponentId,
                    row: {
                        state: m.feature.properties.status.onlinestate,
                        notificationsCount: 10

                    }
                });

                $("#pulsate" + component.ComponentId).pulsate({
                    color: "#d93d5e",
                    reach: 7,
                    speed: 500,
                    pause: 50,
                    glow: true,
                    repeat: true,
                    onHover: false
                })
            }
        }

    });

    InitDatePicker("datepicker");

    initNotifications()

    $("#ackAllBtn").click(function () {

        mApp.block('#notification-container', {});

        $.getJSON("/api/notification/read/").done(function () {

            var greenSignButtons = $(".btn.btn-circle.btn-icon-only.green-jungle.pull-right");
            greenSignButtons.removeClass();
            greenSignButtons.addClass("btn btn-circle btn-icon-only grey-steel link-disable pull-right");

            mApp.unblock($('#notification-container'));
            toastr["success"]("Now you don't have any unread notifications", "Acknowledgment completed", { timeOut: 2000 });
            initNotifications(true);
            $('#tableNotifications').bootstrapTable('refresh');

        }).fail(function (d, textStatus, error) {

            mApp.unblock($('#notification-container'));
            toastr["error"](error, textStatus.toUpperCase());
        });
    })
})

function updateNotificationItems(isRecievedNotification) {
    mApp.block('#notification-container', {});

    if (!isRecievedNotification) {
        $("#notificationsHistory").empty();
        $("#notificationItems").empty();

        if (JSON.parse(sessionStorage.getItem('notification'))) {

            $.get("/js/app/globalhub/notificationItems.html", function (notificationTemplate) {

                var compiled = _.template(notificationTemplate);

                $(compiled({ "notifications": _.sortBy(JSON.parse(sessionStorage.notification), function (i) { JSON.parse(i.componentMessage).created }) }))
                    .appendTo('#notificationsHistory');


                attechClickEventToNotificationItems();
            })
        }
        else
            $("#notificationsHistory")
                .append("<div class='text-center'><i class='fa fa-info-circle m--font-info'></i> No Notifications found in the history</div>");

        if (JSON.parse(sessionStorage.getItem('notificationNew'))) {

            $.get("/js/app/globalhub/notificationItems.html", function (notificationTemplate) {

                var compiled = _.template(notificationTemplate);

                $(compiled({ "notifications": _.sortBy(JSON.parse(sessionStorage.notificationNew), function (i) { JSON.parse(i.componentMessage).created }) }))
                    .appendTo('#notificationItems');


                attechClickEventToNotificationItems();
            })
        } else
            $("#notificationItems")
                .append("<div class='text-center'><i class='fa fa-info-circle m--font-info'></i> No new Notifications found</div>");
    }
    else {

        $.get("/js/app/globalhub/notificationItems.html", function (notificationTemplate) {

            var compiled = _.template(notificationTemplate);
            var n = JSON.parse(sessionStorage.notificationNew);
            var lastElementAsArray = [n[n.length - 1]];

            var nElement = $(compiled({ "notifications": lastElementAsArray }));

            if ($("#notificationItems").children('.m-list-timeline__item').length < 1)
                $("#notificationItems").empty();

            $('#notificationItems').prepend(nElement);

            attechClickEventToNotificationItems();
        })

    }

    mApp.unblock($('#notification-container'));
}

function attechClickEventToNotificationItems() {
    var nhistory = JSON.parse(sessionStorage.getItem('notification'));
    if (nhistory)
        nhistory.forEach(function (n) {

            var notification = JSON.parse(n.componentMessage);

            $("#" + notification.id).unbind("click").click(function () {

                $("#notificationTitle").html(notification.headline);
                $("#notificationContainer").html(notification.content);
                $("#notificationDate").html(moment(notification.created).add(moment().utcOffset(), 'minutes').format('DD MMMM YYYY HH:mm'));
                $("#goToWorldmap").attr("href", "/apps/worldmap?id=" + notification.componentId);
                $("#readNotification").attr("disabled", "disabled");

                $('#notificationModal').modal('toggle');
            })
        });

    var nnew = JSON.parse(sessionStorage.getItem('notificationNew'));
    if (nnew)
        nnew.forEach(function (n) {

            var notification = JSON.parse(n.componentMessage);

            $("#" + notification.id).unbind("click").click(function () {

                $("#notificationTitle").html(notification.headline);
                $("#notificationContainer").html(notification.content);
                $("#notificationDate").html(moment(notification.created).add(moment().utcOffset(), 'minutes').format('DD MMMM YYYY : HH:mm'));
                $("#goToWorldmap").attr("href", "/apps/worldmap?id=" + notification.componentId);
                $("#readNotification").removeAttr("disabled");
                $("#readNotification").attr("onclick", "readNotification('" + notification.id + "')");

                $('#notificationModal').modal('toggle');
            })
        });
}

function setBatchNumber(n) {
    $("#totalNotifications").html(JSON.parse(sessionStorage.getItem('notification')).length);
    $("#notificationBadge").html(JSON.parse(sessionStorage.getItem('notification')).length);

    sessionStorage.setItem("notifyBatchNumber", n);
}

function addNewNotificationItem(componentMessage, id, storage) {
    var items = sessionStorage.getItem(storage);

    if (items) {
        var jsonItems = JSON.parse(items);
        jsonItems.push({ "componentMessage": JSON.stringify(componentMessage), "id": id });
        sessionStorage.setItem(storage, JSON.stringify(jsonItems));
    }
    else {
        var newNotification = [{ "componentMessage": JSON.stringify(componentMessage), "id": id }];
        sessionStorage.setItem(storage, JSON.stringify(newNotification));
    }

    return { "componentMessage": JSON.stringify(componentMessage), "id": id };
}

function openAllNotificationsModal() {
    //fetch from the api all Notifications here..

    mApp.blockPage();

    $.get("/js/app/globalhub/notificationContent.html", function (notificationContent) {

        $('#allNotificationsContainer').empty();

        var from = $("#datepicker").data('daterangepicker').startDate.format('YYYY-MM-DD');
        var to = $("#datepicker").data('daterangepicker').endDate.format('YYYY-MM-DD');


        $.getJSON("/api/notification/groupedNotifications/" + from + "/" + to, function (groupedNotifications) {

            mApp.unblockPage();

            if (groupedNotifications && groupedNotifications.length > 0) {
                console.log(groupedNotifications);

                var compiled = _.template(notificationContent);

                $(compiled({ "data": groupedNotifications }))
                    .appendTo('#allNotificationsContainer');

                NotificationTimeline.init();

                $('#allNotificationsModal').modal('toggle');
            }
            else {
                swal("Notifications", "No Notifications found for you.", "success");
            }



        }).fail(function (d, textStatus, error) {

            mApp.unblockPage();
            toastr["error"](error, textStatus.toUpperCase());
        });
    })
}

function initNotifications(force, takeHistory, takeNew) {

    takeHistory = takeHistory || 10;
    takeNew = takeNew || 10;

    $.getJSON("/api/notification/newNotificationsCount", function (newNotificationsCount) {
        $("#newNotificationsCount").html(newNotificationsCount)
        if (newNotificationsCount > 0)
            $("#notification-icon-wrapper").css({ "background-color": "#ffb822" })
        else
            $("#notification-icon-wrapper").removeAttr("style");
    })

    $.getJSON("/api/notification/takeHistory/" + takeHistory, function (notifications) {

        var items = JSON.parse(sessionStorage.getItem("notification"));

        if (force || !items || items.length !== notifications.length) {

            sessionStorage.removeItem("notification");

            for (var i = 0; i < notifications.length; i++) {
                addNewNotificationItem(notifications[i], notifications[i].id, "notification");
            }
        }

        $.getJSON("/api/notification/takeNew/" + takeNew, function (notificationsNew) {

            var items = JSON.parse(sessionStorage.getItem("notificationNew"));

            if (force || !items || items.length !== notificationsNew.length) {

                sessionStorage.removeItem("notificationNew");

                for (var i = 0; i < notificationsNew.length; i++) {
                    addNewNotificationItem(notificationsNew[i], notificationsNew[i].id, "notificationNew");
                }
            }

            updateNotificationItems();

            inView('.loadmorehistory')
                .on('enter', loadMoreNotificationsHistory);

            inView('.loadmorenew')
                .on('enter', loadMoreNotificationsNew);

        })
    })
}

function InitDatePicker(div) {
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

    $('#' + div + ' input').val(moment().subtract('days', 6).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

    $('#' + div).on('apply.daterangepicker', function (ev, picker) {

        $('#allNotificationsContainer').children().fadeOut("slow");

        mApp.block(".modal-content", {});

        $.get("/js/app/globalhub/notificationContent.html", function (notificationContent) {

            var from = $("#datepicker").data('daterangepicker').startDate.format('YYYY-MM-DD');
            var to = $("#datepicker").data('daterangepicker').endDate.format('YYYY-MM-DD');

            $.getJSON("/api/notification/groupedNotifications/" + from + "/" + to, function (groupedNotifications) {

                mApp.unblock(".modal-content");

                if (groupedNotifications && groupedNotifications.length > 0) {
                    console.log(groupedNotifications);

                    var compiled = _.template(notificationContent);

                    $(compiled({ "data": groupedNotifications }))
                        .appendTo('#allNotificationsContainer');

                    NotificationTimeline.init();
                }
                else {
                    $('#allNotificationsContainer').html('<p><div class="text-center"><i class="fa fa-check font-green"></i> <i>No Notifications found, try another date range</i></div></p>')
                }

            }).fail(function (d, textStatus, error) {

                mApp.unblock(".modal-content");
                toastr["error"](error, textStatus.toUpperCase());
            });
        })
    });
}

function loadMoreNotificationsHistory() {

    var offset = parseInt($(".loadmorehistory").attr('id')) + 10;
    if (!isNaN(offset)) {

        $(".loadmorehistory").remove();

        $.getJSON("/api/notification/takeHistory/" + offset, function (notifications) {

            var n = [];

            for (var i = 0; i < notifications.length; i++) {
                n.push(addNewNotificationItem(notifications[i], notifications[i].id, "notification"));
            }

            $.get("/js/app/globalhub/notificationItems.html", function (notificationTemplate) {

                var compiled = _.template(notificationTemplate);

                var nElement = $(compiled({ "notifications": n }));

                $('#notificationsHistory').append(nElement);

                attechClickEventToNotificationItems();

                $('#notificationsHistory').after('<div id="' + offset + '" class="loadmorehistory"></div>');

                inView('.loadmorehistory')
                    .on('enter', loadMoreNotificationsHistory);
            })

        })
    }
}

function loadMoreNotificationsNew() {

    var offset = parseInt($(".loadmorenew").attr('id')) + 10;
    if (!isNaN(offset)) {

        $(".loadmorenew").remove();

        $.getJSON("/api/notification/takeNew/" + offset, function (notifications) {

            var n = [];

            for (var i = 0; i < notifications.length; i++) {
                n.push(addNewNotificationItem(notifications[i], notifications[i].id, "notificationNew"));
            }

            $.get("/js/app/globalhub/notificationItems.html", function (notificationTemplate) {

                var compiled = _.template(notificationTemplate);
                
                var nElement = $(compiled({ "notifications": n }));

                $('#notificationItems').append(nElement);

                attechClickEventToNotificationItems();

                $('#notificationItems').after('<div id="' + offset + '" class="loadmorenew"></div>');

                inView('.loadmorenew')
                    .on('enter', loadMoreNotificationsNew);
            })

        })
    }
}