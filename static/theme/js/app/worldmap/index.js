var Worldmap = (function (context) {

    var WorldmapObjects = {
        map: null,
        cluster: null,
        data: null,
        geoJsonLayer: null,
        filteredGeoJsonLayer: null,
        filteredData: null,
        pins: {

            0: L.icon({
                iconUrl: '/images/0.png',
                iconSize: [40, 40], // size of the icon
                iconAnchor: [20, 40],
                popupAnchor: [1, -20]
            }),
            1: L.icon({
                iconUrl: '/images/1.png',
                iconSize: [40, 40], // size of the icon
                iconAnchor: [20, 40],
                popupAnchor: [1, -20]
            }),
            2: L.icon({
                iconUrl: '/images/2.png',
                iconSize: [40, 40], // size of the icon
                iconAnchor: [20, 40],
                popupAnchor: [1, -20]
            }),
            3: L.icon({
                iconUrl: '/images/3.png',
                iconSize: [40, 40], // size of the icon
                iconAnchor: [20, 40],
                popupAnchor: [1, -20]
            })
        },
        states: {
            0: '#25D366',
            1: '#20AB44',
            2: '#1A8120',
            3: '#6B6B6B',
        }
    }

    var Images = ["BALLMILL", "CONECRUSHER", "CRUSHER", "ROLLERMILL", "DOPPELWALZENBRECHER", "GYRATORY", "HAMMERBRECHER", "IMPACTCRUSHER", "JAWCRUSHER", "POLYCOM", "QUADROPOL", "ROWSIZER", "SAGMUEHLE"];

    var Pins = WorldmapObjects.pins;

    function onEachFeature(feature, layer) {

        var p = layer.bindPopup(function (current) {

            if (current.feature) {

                var existingImgs = Images;

                var value = current.feature.properties.type.toUpperCase();
                var width = '60px';

                current.feature.properties.typeImage = existingImgs.includes(value) ? '<img style="margin-top:4px" src="/images/machines/' + value + '.png" width="' + width + '" alt="' + value + '" title= "' + value + '"  />'
                    : '<div style="text-align:center;margin-top:4px"><i class="fa fa-question-circle" style="font-size: 50px;color: darkorange;" aria-hidden="true" title="' + value + '"></i></div>';

                var popup = document.createElement("div")

                switch (current.feature.properties.basetype) {
                    case 'PLANT':
                        popup.setAttribute("id", current.feature.properties.id);

                        $.get("/js/app/worldmap/popupLoading.html", function (loadingPage) {
                            $(loadingPage)
                                .appendTo('#' + current.feature.properties.id)

                        })

                        $.get("/js/app/worldmap/popupPlant.html", function (data) {

                            context.ajaxRequest("GET", "/api/Worldmap/GetSubcomponents/" + current.feature.properties.id)
                                .done(function (subcomponents) {

                                    if (current.feature.properties.status.onlinestate.lastUpdate) {
                                        current.feature.properties.status.onlinestate.lastUpdate = moment(moment.utc(current.feature.properties.status.onlinestate.lastUpdate).toDate()).local().format("DD.MM.YY, HH:mm:ss");
                                    }

                                    if (current.feature.properties.status.datastate.lastUpdate) {
                                        current.feature.properties.status.datastate.lastUpdate = moment(moment.utc(current.feature.properties.status.datastate.lastUpdate).toDate()).local().format("DD.MM.YY, HH:mm:ss");
                                    }

                                    current.feature.properties.subcomponents = subcomponents;

                                    var compiled = _.template(data);

                                    $('#' + current.feature.properties.id).empty();

                                    $(compiled(current.feature.properties))
                                        .hide()
                                        .appendTo('#' + current.feature.properties.id)
                                        .fadeIn();
                                })
                                .fail(function () { })
                        });
                        return popup;
                    default:
                        popup.setAttribute("id", current.feature.properties.id);

                        $.get("/js/app/worldmap/popupLoading.html", function (loadingPage) {
                            $(loadingPage)
                                .appendTo('#' + current.feature.properties.id)

                        })

                        $.get("/js/app/worldmap/popupMachine.html", function (data) {

                            context.ajaxRequest("GET", "/api/Worldmap/GetOnlinestates/" + current.feature.properties.id)
                                .done(function (onlinestates) {

                                    if (onlinestates)
                                        onlinestates = onlinestates[0];

                                    current.feature.properties.status = onlinestates;

                                    if (current.feature.properties.status.onlinestate.lastUpdate) {
                                        current.feature.properties.status.onlinestate.lastUpdate = moment(moment.utc(current.feature.properties.status.onlinestate.lastUpdate).toDate()).local().format("DD.MM.YY, HH:mm:ss");
                                    }

                                    if (current.feature.properties.status.datastate.lastUpdate) {
                                        current.feature.properties.status.datastate.lastUpdate = moment(moment.utc(current.feature.properties.status.datastate.lastUpdate).toDate()).local().format("DD.MM.YY, HH:mm:ss");
                                    }

                                    var compiled = _.template(data);

                                    $('#' + current.feature.properties.id).empty();

                                    $(compiled(current.feature.properties))
                                        .hide()
                                        .appendTo('#' + current.feature.properties.id)
                                        .fadeIn();

                                })
                                .fail(function () { })

                        })

                        return popup;
                }

            }
        }, { autoPanPadding: new L.Point(400, 400), className: 'popup-leaflet', minWidth: feature.properties.basetype === 'PLANT' ? 350 : 250 });
    }

    function createGeoJsonLayer(markers, url) {

        context.ajaxRequest("GET", url)
            .done(function (result) {

                if (!result || result.length === 0) {
                    toastr["warning"]("You don't have have permission to see any component or your favorite list is empty", "Nothing found");
                }

                var geoJsonLayer = L.geoJson(result, {
                    onEachFeature: onEachFeature,
                    pointToLayer: function (feature, latlng) {
                        return L.marker(latlng, { icon: Pins[feature.properties.status.datastate.state] })
                            .bindTooltip(feature.properties.name,
                                {
                                    permanent: false,
                                    direction: 'top',
                                    offset: L.point(0, -20)
                                });
                    }
                })

                markers.addLayer(geoJsonLayer);
                WorldmapObjects.map.addLayer(markers);

                WorldmapObjects.cluster = markers;
                WorldmapObjects.data = result;
                WorldmapObjects.geoJsonLayer = geoJsonLayer;
                WorldmapObjects.filteredData = markers;
                WorldmapObjects.filteredGeoJsonLayer = geoJsonLayer;

                initTypeFilter(result);

                mApp.unblock($('#container'));
                mApp.unblock($("#fitlerPortlet"));

                $('#tableComponents').bootstrapTable('hideLoading');

                $("[id^='pulsate']").pulsate({
                    color: "#d93d5e",
                    reach: 7,
                    speed: 500,
                    pause: 50,
                    glow: true,
                    repeat: true,
                    onHover: false
                })

                disableFilterComponent(false);

                if (selectedComponentId) {

                    var pin = _.find(Worldmap.GetMapObject().cluster.getLayers(), function (l) { return selectedComponentId == l.feature.properties.id; });

                    var visibleCluster = Worldmap.GetMapObject().cluster.getVisibleParent(pin);

                    if (visibleCluster && visibleCluster.spiderfy)
                        visibleCluster.spiderfy();

                    pin.openPopup();
                }
            })
            .fail(function (jqXHR) {
                toastr["error"]("Loading components and its state failed", "An error occured");
                mApp.unblock($('#container'));
            })
    }

    function defineMarkerCluster() {
        return L.markerClusterGroup({
            iconCreateFunction: bakeThePie,
            animateAddingMarkers: true,
            removeOutsideVisibleBounds: false
        });
    }

    function bakeThePie(cluster) {

        data = [{ "label": "TIMELEY", "value": 0, "color": WorldmapObjects.states["0"] },
        { "label": "DELATED", "value": 0, "color": WorldmapObjects.states["1"] },
        { "label": "DEFERRED", "value": 0, "color": WorldmapObjects.states["2"] },
        { "label": "MISSING", "value": 0, "color": WorldmapObjects.states["3"] }];


        for (var i = 0; i < cluster.getChildCount(); i++) {
            var currStatus = cluster.getAllChildMarkers()[i].feature.properties.status.datastate.state;
            if (currStatus === 3)
                data[3].value++;
            else if (currStatus === 2)
                data[2].value++;
            else if (currStatus === 1)
                data[1].value++;
            else
                data[0].value++;
        }

        var data = _.filter(data, function (d) { return d.value > 0; });

        var svgElement = document.createElementNS(d3.namespace("svg:svg"), 'svg')
        svgElement.setAttribute('style', 'height: 70px; width: 70px; margin: -25px;');

        var svg = d3.select(svgElement)
            .data([data]),
            width = 70,
            height = 70,
            radius = Math.min(width, height) / 2,
            g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var pie = d3.pie()
            .sort(null)
            .value(function (d) { return d.value; });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(radius - 22);

        var arc = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function (d, i) { return data[i].color });

        arc.append('text')
            .attr('x', radius - 35)
            .attr('y', radius - 35)
            //.attr('dominant-baseline', 'central')
            /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
            .attr('dy', '.3em')
            .text(cluster.getChildCount());

        var result = serializeXmlNode(svgElement);

        return new L.DivIcon({
            html: result,
            className: 'marker-cluster'
        });
    }

    function generateMap(div, url) {

        WorldmapObjects.map = L.map(div, { center: [22.4782393, 8.2634222], zoom: 2 });

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            noWrap: true,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Copyright © <a href="">thyssenkrupp</a>',
            id: 'mapbox.streets'
        }).addTo(WorldmapObjects.map);

        var markers = defineMarkerCluster();

        mApp.block("#container", {});
        mApp.block("#fitlerPortlet", {});

        disableFilterComponent(true);

        createGeoJsonLayer(markers, url);
    }

    function generateAmMap(div) {
        return AmCharts.makeChart(div, {
            "type": "map",
            "theme": "light",

            "dataProvider": {
                "map": "worldLow",
                "getAreasFromMap": true,
                "images": result
            },

            "imagesSettings": {
                "rollOverScale": 2,
                "selectedScale": 2
            },
            "areasSettings": {
                "autoZoom": true,
                "outlineThickness": 1,
            },
            "mouseWheelZoomEnabled": true,
            "listeners": [{
                "event": "descriptionClosed",
                "method": function (ev) {
                    ev.chart.selectObject();
                }
            }, {
                "event": "clickMapObject",
                "method": function (event) {
                    //if (event.mapObject.svgPath !== undefined) {
                    //    event.mapObject.svgPath = starSVG;
                    //    event.mapObject.validate();
                    //}
                }
            }]

        });
    }

    function mapToComponentsTable(data) {

        var d = _.map(data, function (d) { return { "id": d.feature.properties.id, "name": d.feature.properties.name, "state": d.feature.properties.status.datastate.state, "type": d.feature.properties.type.toUpperCase(), "notificationsCount": d.feature.properties.status.onlinestate.notificationsCount } });
        $('#tableComponents').bootstrapTable('load', d);
    }

    function initComponentsTable() {
        $('#tableComponents').bootstrapTable({
            striped: true,
            search: true,
            rememberOrder: true,
            sortName: 'name',
            uniqueId: 'id',
            columns: [{
                title: 'Id',
                field: 'id',
                idField: 'id',
                visible: false,
            }, {
                title: ' ',
                field: 'state',
                sortable: true,
                width: '3%',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index, field) {

                    var pulsate = row.notificationsCount > 0 ? 'pulsate' + row.id : '';
                    return '<i id="' + pulsate + '" class="fa fa-circle" style="color:' + WorldmapObjects.states[value] + '"></i>';
                }
            }, {
                title: 'Component',
                field: 'name',
                sortable: true,
                valign: 'middle'
            }, {
                title: 'Type',
                field: 'type',
                sortable: true,
                valign: 'middle',
                align: 'center',
                formatter: function (value, row, index, field) {
                    var existingImgs = Images;

                    var width = '30px';

                    var image = existingImgs.includes(value) ? '<img src="/images/machines/' + value + '.png" width="' + width + '" alt="' + value + '" title= "' + value + '"  />'
                        : '<i class="fa fa-question-circle" style="font-size: 25px;color: darkorange;" aria-hidden="true" title="' + value + '"></i>';

                    return image;
                }
            }]
        });

        $('#tableComponents').on('click-row.bs.table', function (row, rowData) {

            $("#pulsate" + rowData.id).pulsate("destroy");

            Worldmap.GetMapObject().map.closePopup();

            var pin = _.find(Worldmap.GetMapObject().cluster.getLayers(), function (l) { return rowData.id === l.feature.properties.id; });

            //Worldmap.GetMapObject().map.flyTo(pin.getLatLng(), 2);

            var visibleCluster = Worldmap.GetMapObject().cluster.getVisibleParent(pin);

            if (visibleCluster.spiderfy)
                visibleCluster.spiderfy();

            pin.openPopup();

        });

        $('#tableComponents').on('post-body.bs.table', function (data) {

            var trs = $('#tableComponents').find('tbody').children();

            for (var i = 0; i < trs.length; i++) {
                $(trs[i]).mouseover(function (e) {

                    var componentName = $(e.currentTarget).children()[1].textContent;

                    var pin = _.find(Worldmap.GetMapObject().cluster.getLayers(), function (l) { return componentName === l.feature.properties.name; });
                    var visibleCluster = Worldmap.GetMapObject().cluster.getVisibleParent(pin);
                    if (visibleCluster.spiderfy)
                        visibleCluster._icon.classList.add('cluster-highlight');
                    else
                        pin._icon.classList.add('pin-highlight');
                });

                $(trs[i]).mouseout(function (e) {

                    var componentName = $(e.currentTarget).children()[1].textContent

                    var pin = _.find(Worldmap.GetMapObject().cluster.getLayers(), function (l) { return componentName === l.feature.properties.name; });
                    var visibleCluster = Worldmap.GetMapObject().cluster.getVisibleParent(pin);

                    var visibleCluster = Worldmap.GetMapObject().cluster.getVisibleParent(pin);

                    if (visibleCluster.spiderfy)
                        visibleCluster._icon.classList.remove('cluster-highlight');
                    else
                        pin._icon.classList.remove('pin-highlight');
                });
            };
        });

        $(window).resize(function () {
            $('#tableComponents').bootstrapTable('resetView');
        });

        $('#tableComponents').on('search.bs.table', function (e, searchText) {

            if (!searchText)
                $("#filterComponentType").trigger("change");

            searchText = searchText.toUpperCase();

            var cluster = Worldmap.GetMapObject().cluster;

            _.each(cluster.getLayers(), function (l) {

                if (!(l.feature.properties.name.toUpperCase().includes(searchText) ||
                    l.feature.properties.type.toUpperCase().includes(searchText))) {

                    $(l._icon).css("display", "none");
                    cluster.removeLayer(l);
                }
            });

            Worldmap.MapToComponentsTable(cluster.getLayers());
        });
    }

    function refreshComponentsState() {

        var componentsIds = "";

        if (WorldmapObjects.cluster.getLayers().length > 0) {
            $.each(WorldmapObjects.cluster.getLayers(), function (ml) {
                componentsIds += "&component=" + this.feature.properties.id;
            })

            context.ajaxRequest("GET", "/api/Worldmap/GetOnlinestates/" + componentsIds)
                .done(function (data) {
                    _.forEach(data, function (marker) {
                        var m = _.find(WorldmapObjects.cluster.getLayers(), function (l) { return marker.id === l.feature.properties.id; });

                        if (m.feature.properties.status.onlinestate.state !== marker.onlinestate) {
                            m.feature.properties.status.onlinestate.state = marker.onlinestate;
                            switch (marker.onlinestate) {
                                case "true":
                                    m.setIcon(Pins.green);
                                    break;
                                case "false":
                                    m.setIcon(Pins.red);
                                    break;
                                default:
                                    m.setIcon(Pins.grey);
                                    break;
                            }
                        }
                    })

                    WorldmapObjects.cluster.refreshClusters();
                })
                .fail(function (jqXHR) {
                    toastr["error"]("Refreshing component states failed", "An error occured");
                })
        }
    }

    function initTypeFilter(data) {

        $("#filterComponentType")
            .find('option')
            .remove();

        var options = _.uniq(data, function (item, key, a) {
            return item.properties.type.toUpperCase();
        });

        _.forEach(options, function (d) { $("#filterComponentType").append(new Option(d.properties.type.toUpperCase(), d.properties.type.toUpperCase())); })
        $("#filterComponentType")
            .selectpicker('refresh')
            .selectpicker('selectAll');


    }

    function disableFilterComponent(state) {

        $("#filterComponent").prop('disabled', state);
        $('#filterComponent').selectpicker('refresh');
    }

    function serializeXmlNode(xmlNode) {
        if (typeof window.XMLSerializer != "undefined") {
            return (new window.XMLSerializer()).serializeToString(xmlNode);
        } else if (typeof xmlNode.xml != "undefined") {
            return xmlNode.xml;
        }
        return "";
    }

    return {
        CreateMap: function (div, url) {
            generateMap(div, url);
        },
        ReInit: function (div, url) {
            WorldmapObjects.map.remove();
            generateMap(div, url);
        },
        InitComponentsTable: initComponentsTable,
        GetMapObject: function () {
            return WorldmapObjects;
        },
        RefreshComponentsState: refreshComponentsState,
        DefineMarkerCluster: defineMarkerCluster,
        MapToComponentsTable: mapToComponentsTable

    }
}(DataContextBase));

$(document).ready(function () {

    $('#filterComponent').on('change', function () {
        Worldmap.ReInit("mapid", $('#filterComponent').val());

        var type = "Machine";
        switch ($('#filterComponent').val()) {
            case "/api/worldmap/getmachines":
                type = "Machine";
                break
            case "/api/worldmap/getplants":
                type = "Plant";
                break;
            case "/api/Worldmap/GetProcessUnit":
                type = "Process_Unit"
                break;
            default:
                type = "Favorite";
        }

        $.get("/api/Worldmap/SaveComponentType/" + type, function (data) { })
    })

    if (!selectedComponentType) {
        $.get("/api/Worldmap/GetLastSelection").done(function (data) {

            var type = "/api/worldmap/getmachines";
            switch (data) {
                case "Machine":
                    type = "/api/worldmap/getmachines";
                    break
                case "Plant":
                    type = "/api/worldmap/getplants";
                    break;
                case "Process_Unit":
                    type = "/api/Worldmap/GetProcessUnit";
                    break;
                default:
                    type = "/api/worldmap/GetFavoriteComponents";
            }

            $('#filterComponent').val(type)
            Worldmap.CreateMap("mapid", type);
        })
    }
    else {
        var type = "/api/worldmap/getmachines";

        switch (selectedComponentType) {
            case "MACHINE":
                type = "/api/worldmap/getmachines";
                break
            case "PLANT":
                type = "/api/worldmap/getplants";
                break;
            case "PROCESS_UNIT":
                type = "/api/Worldmap/GetProcessUnit";
                break;
        }

        $('#filterComponent').val(type)
        Worldmap.CreateMap("mapid", type);
    }

    $("#filterComponentType").selectpicker();

    $("#filterComponentType").change(function () {

        $('#tableComponents').bootstrapTable('resetSearch', '');

        var cluster = Worldmap.GetMapObject().cluster;
        cluster.clearLayers();

        var markers = Worldmap.DefineMarkerCluster();
        var data = Worldmap.GetMapObject().geoJsonLayer;

        markers.addLayer(data);
        Worldmap.GetMapObject().map.addLayer(markers);
        cluster = markers;

        _.each(cluster.getLayers(), function (l) {

            if ($("#filterComponentType").val()) {
                if (!$("#filterComponentType").val().includes(l.feature.properties.type.toUpperCase())) {
                    $(l._icon).css("display", "none");
                    cluster.removeLayer(l);
                }
            }
            else {
                $(l._icon).css("display", "none");
                cluster.clearLayers();
            }
        });

        Worldmap.GetMapObject().cluster = cluster;
        Worldmap.GetMapObject().filteredData = cluster;
        Worldmap.GetMapObject().filteredGeoJsonLayer = cluster;
        Worldmap.MapToComponentsTable(cluster.getLayers());
    });

    Worldmap.InitComponentsTable();

    $('#toggleFilterComponent').on('click', function () {

        var icon = $('#toggleComponentArrow');
        var cssClass = icon.attr('class') === 'la la-angle-double-left' ? 'la la-angle-double-right' : 'la la-angle-double-left';

        var filterContainer = $("#filterContainer");
        var mapContainer = $("#mapContainer");

        var duration = 500;

        if (icon.attr('class') === 'la la-angle-double-left') {

            filterContainer.animate({ left: '-=150px' }, duration, 'linear');
            filterContainer.removeClass("col-lg-4").addClass("col-lg-2");
            mapContainer.removeClass("col-lg-8").addClass("col-lg-10");
            mapContainer.animate({ left: '-=160px' }, duration, 'linear');

            icon.removeClass().addClass('la la-angle-double-right');

            $("#mapid").width('115%');
        }
        else {
            filterContainer.removeClass("col-lg-2").addClass("col-lg-4");
            mapContainer.removeClass("col-lg-10").addClass("col-lg-8");

            filterContainer.animate({ left: '+=150px' }, duration, 'linear');
            mapContainer.animate({ left: '+=160px' }, duration, 'linear');

            icon.removeClass().addClass('la la-angle-double-left');
            $("#mapid").width('100%');

        }
    })

})