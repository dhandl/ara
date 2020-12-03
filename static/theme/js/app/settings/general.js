var General = (function (context) {


    return {
        
    }

}(DataContextBase));

$(document).ready(function () {

    
})

var onSuccess = function () {
    toastr["success"]("Welcome Message changed successfully", "Welcome Message", { timeOut: 2000 });
    
}

var onFailed = function () {
    toastr["error"]("Something went wrong", "Welcome Message", { timeOut: 2000 });
}