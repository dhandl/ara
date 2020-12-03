var SignIn = function () {

    var handleSignIn = function () {

        //Obsolete since the app is authenticate by the MS Provider

        //$("#signIn").click(function () {

        //    if ($('.login-form').valid()) {
        //        var email = $("#email").val();

        //        location.href = "/Dashboard
        //    }
        //});
    }

    return {

        init: function () {
            handleSignIn();
        }

    };

}();

jQuery(document).ready(function () {
    SignIn.init();
});