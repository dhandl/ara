
var UserManagement = (function (context) {

    var selectedFavorites = [];

    function InitFavoriteTable() {
        $('#tableFavorites').bootstrapTable({
            url: '/api/settings/getFavoritesTable',
            striped: true,
            search: true,
            rememberOrder: true,
            sortName: 'created',
            sortOrder: "desc",
            pagination: true,
            toolbar: "#toolbar",
            paginationLoop: true,
            formatNoMatches: function () {
                return '<i class"fas fa-info-circle"></i>No favorites found';
            },
            pageList: [5, 10, 50, 100],
            columns: [{
                title: 'Name',
                field: 'name',
                sortable: false,
                align: 'center',
                valign: 'middle'
            }, {
                title: 'Id',
                field: 'id',
                sortable: false,
                align: 'center',
                valign: 'middle'
            }]
        })
            .on('post-body.bs.table', function (data) {

                var favorites = $("#tableFavorites").bootstrapTable('getData');

                selectedFavorites = [];

                _.each(favorites, function (fav) {
                    selectedFavorites.push(fav.id);
                });
            });
    }

    function InitSelectComponent() {
        $('#selectBasecomponent').select2({
            placeholder: "Select a Basetype"
        });

        $('#selectBasecomponent').on('select2:select', function (e) {
            $('#componentsTableByBasetype').bootstrapTable('refresh', {
                url: $('#selectBasecomponent').val()
            });
        });
    }

    function saveFav(id) {
        $.get("/api/settings/UpdateComponentFavoriteList/" + id + "/true", function () {
            $('#tableFavorites').bootstrapTable('refresh');
        })
    }

    function InitSaveButton() {
        $("#saveBtn").click(function () {
            context.ajaxRequest("POST", "/api/settings/UpdateComponentFavoriteList", JSON.stringify(selectedFavorites))
                .always(function (data) {
                    $('#tableFavorites').bootstrapTable('refresh');
                    $('#favBlockDialog').modal('hide');
                });
        })
    }

    function InitManageFavoritesTable() {

        var api = $('#selectBasecomponent').val();

        $('#componentsTableByBasetype').bootstrapTable({
            url: api,
            striped: true,
            search: true,
            rememberOrder: true,
            clickToSelect: true,
            checkboxHeader: false,
            sortName: 'properties.name',
            sortOrder: "asc",
            pagination: true,
            paginationLoop: true,
            formatNoMatches: function () {
                return '<i class"fas fa-info-circle"></i>No components found';
            },
            pageList: [5, 10, 50, 100],
            columns: [
                {
                    field: 'properties.selected',
                    title: 'ID',
                    sortable: false,
                    align: 'center',
                    valign: 'middle',
                    checkbox: true,
                    width: '5%'
                }, {
                    field: 'properties.name',
                    title: 'Name',
                    sortable: true,
                    align: 'center',
                    valign: 'middle',
                    width: '85%'
                }, {
                    field: 'properties.geoinfo.country',
                    title: 'Country',
                    sortable: true,
                    align: 'center',
                    valign: 'middle'
                }]
        })
            .on('check.bs.table', function (e, args) {
                selectedFavorites.indexOf(args.properties.id) === -1 ? selectedFavorites.push(args.properties.id) : console.log("");
            })
            .on('uncheck.bs.table', function (e, args) {
                var itemIndex = selectedFavorites.indexOf(args.properties.id);
                if (itemIndex > -1)
                    selectedFavorites.splice(itemIndex, 1);
            });
    }

    return {
        Init: function () {
            InitFavoriteTable();
            InitSelectComponent();
            InitManageFavoritesTable();
            InitSaveButton();
        }
    }

}(DataContextBase));

$(document).ready(function () {

    UserManagement.Init();

    $(window).resize(function () {
        $('#tableFavorites').bootstrapTable('resetView');
        $('#componentsTableByBasetype').bootstrapTable('resetView');
    });

    $("#favBtn").click(function () {
        $('#favBlockDialog').modal('toggle');
    })

    $("#blockBtn").click(function () {
        $('#favBlockDialog').modal('toggle');
    })
})