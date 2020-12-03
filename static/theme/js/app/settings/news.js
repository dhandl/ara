var News = (function (context) {

    function initComponentsTable() {
        $('#tableNews').bootstrapTable({
            url: '/api/settings/getNewsTable',
            striped: true,
            search: true,
            rememberOrder: true,
            sortName: 'created',
            sortOrder: 'desc',
            columns: [{
                title: 'Created',
                field: 'created',
                sortable: true,
                valign: 'middle'
            },
            {
                title: 'Type',
                field: 'type',
                sortable: true,
                width: '3%',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {
                    switch (value) {
                        case "Info":
                            return '<i class="fa fa-circle font-green-jungle" title="Info"></i>';
                        case "Warning":
                            return '<i class="fa fa-exclamation-circle font-yellow" title="Warning"></i>';
                        case "Important":
                            return '<i class="fa fa-exclamation-circle font-red" title="Important"></i>';
                        default:
                    }
                }
            }, {
                title: 'Title',
                field: 'title',
                sortable: true,
                valign: 'middle'
            }, {
                title: '',
                field: 'id',
                idField: 'id',
                formatter: function (value, row, index, field) {
                    return '<a onclick="News.OnDelete(\'' + value + '\')" class="btn btn-icon-only red"> <i class="glyphicon glyphicon-trash"> </i> </a>';
                }
            }]
        });
    }

    function onDelete(id) {

        swal({
            title: "Delete News",
            text: "Are you sure?",
            type: "warning",
            allowOutsideClick: true,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
            confirmButtonClass: 'btn btn-danger'
        },
            function (isConfirm) {
                if (isConfirm) {
                    $.get("/api/settings/deleteNews/" + id, function (loadingPage) {
                        toastr["success"]("News is deleted", "Manage News", { timeOut: 2000 });
                        $('#tableNews').bootstrapTable('refresh');
                    })
                }
            }
        );
    }

    return {
        InitComponentsTable: initComponentsTable,
        OnDelete: onDelete
    }

}(DataContextBase));

$(document).ready(function () {

    News.InitComponentsTable();
    $(".select2-multiple").select2({
        placeholder: "Select Groups - If no selection is made, news will be send to all users",
        ajax: {
            url: '/api/settings/groups',
            dataType: 'json'
        },
        width: null
    });
})

var onSuccess = function () {
    toastr["success"]("News has been successfully created", "Manage News", { timeOut: 2000 });
    $('#tableNews').bootstrapTable('refresh');
    $("#createNewsForm")[0].reset();
    $("#groups").empty().trigger('change')
}

var onFailed = function () {
    toastr["error"]("Something went wrong", "Manage News", { timeOut: 2000 });
    $("#createNewsForm")[0].reset();
    $("#groups").empty().trigger('change')
}