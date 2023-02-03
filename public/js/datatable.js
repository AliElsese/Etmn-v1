$(document).ready(function(){
    $('.mydatatable').DataTable({
        lengthMenu : [ [ 10 , 25 , 50 , -1 ] , [ 10 , 25 , 50 , "All" ] ]
    });
    
    $('.popup').click(function(){
        var src = $(this).attr('src')
        $('.modal').modal('show')
        $('#popup-img').attr('src' , src)
    });
})