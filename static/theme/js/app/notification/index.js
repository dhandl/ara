
var Notification = (function (context) {
    
    function InitNotificationsTable(api) {
        $('#_notificationsTable').bootstrapTable({
            url: api,
            striped: true,
            search: true,
            rememberOrder: true,
            sortName: 'created',
            sortOrder: "desc",
            pagination: true,
            paginationLoop: true,
            sidePagination: 'server',
            method: "post",
            formatNoMatches: function () {
                return 'No Notifications found';
            },
            pageList: [5, 10, 50, 100],
            columns: [{
                title: 'Created At',
                field: 'created',
                sortable: true,
                align: 'center',
                valign: 'middle',
                width: '20%',
                formatter: function (value, row, index, field) {
                    return moment(value).format("DD.MM.YYYY, HH:mm:ss");
                }
            },{
                title: 'Headline',
                field: 'headline',
                sortable: false,
                align: 'center',
                valign: 'middle',
                width: '20%'
            }, {
                title: 'Content',
                field: 'content',
                sortable: false,
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {
                    if (value) {
                        if (value.length > 100) {

                            return '<span title="' + value + '">' + value.slice(0, 100) + '... </span>';
                        }

                        return value;
                    }

                    return '<span class="label bg-grey-silver bg-grey-silver"> No Content </span>';
                }
            }, {
                title: '',
                field: 'id',
                sortable: false,
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {

                    if (row.readDate)
                        return '<button class="btn btn-sm btn-metal disabled" style="cursor:not-allowed"><i class="la la-check"></i></button>';

                    return '<button onclick="read(\'' + value + '\')" class="btn btn-sm btn-success"><i class="la la-check"></i></button>';
                }
            }]
        }).on('click-row.bs.table', function (row, rowData, field) {

            $.getJSON("/api/notification/" + rowData.id, function (notification) {

                $("#notificationTitle").html(notification.headline);
                $("#notificationContainer").html(notification.content);
                $("#notificationDate").html(moment(notification.created).format('DD MMMM YYYY : HH:mm'));
                $("#goToWorldmap").attr("href", "/apps/worldmap?id=" + JSON.parse(notification.sourceComponent).ComponentId);

                if (!notification.isActive)
                    $("#readNotification").attr("disabled", "disabled");
                else
                    $("#readNotification").removeAttr("disabled");

                $('#notificationModal').modal('toggle');
            })

        });
    }
    
    return {
        Init: function (api) {
            InitNotificationsTable(api);
        }
    }

}(DataContextBase));

$(document).ready(function () {


    Notification.Init(_notificationsApi);

    $(window).resize(function () {
        $('#_notificationsTable').bootstrapTable('resetView');
    });
})


function read(id) {

    $.getJSON("/api/notification/read/" + id, function () {
        initNotifications(true);
        $('#_notificationsTable').bootstrapTable('refresh');
    })
}

function readNotification(id) {

    $.getJSON("/api/notification/read/" + id, function () {

        $.getJSON("/api/notification/newNotificationsCount", function (newNotificationsCount) {
            $("#newNotificationsCount").html(newNotificationsCount)
            if (newNotificationsCount > 0)
                $("#notification-icon-wrapper").css({ "background-color": "#ffb822" })
            else
                $("#notification-icon-wrapper").removeAttr("style");
        })

        $("#" + id).parent().fadeOut();

        $('#_notificationsTable').bootstrapTable('refresh');
    })
}