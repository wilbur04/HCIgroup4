/**
 * Created by Wilbur on 10/03/2017.
 */


//search  **********************************
$('#scroll').keyup(function () {
    if ($(this).val() != '') {
        $(this).css("border-bottom", "2px solid green");
    }
});
