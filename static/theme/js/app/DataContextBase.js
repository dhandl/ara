DataContextBase = (function () {
    var ajaxRequest = function (type, url, data, dataType, accept) { // Ajax helper
        var options = {
            dataType: dataType || 'json',
            contentType: 'application/json',
            cache: false,
            type: type,
            data: data ? data : null,
            accept: accept ? accept : null,
            async: true
        };
        return $.ajax(url, options);
    };

    var ajaxRequestSync = function (type, url, data, dataType) { // Ajax helper
        var options = {
            dataType: dataType || 'json',
            contentType: 'application/json',
            cache: false,
            type: type,
            data: data ? data : null,
            async: false
        };

        return $.ajax(url, options);
    };

    var datacontextbase = {
        ajaxRequest: ajaxRequest,
        ajaxRequestSync: ajaxRequestSync
    };

    return datacontextbase;
})();