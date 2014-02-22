$(document).ready(function(){

    $(window).resize(function()
    {
        if($(window).width() >= 765){
            $(".sidebar .sidebar-inner").slideDown(350);
        }
        else{
            $(".sidebar .sidebar-inner").slideUp(350);
        }
    });


    $(".sidebar-dropdown a").on('click',function(e){
        e.preventDefault();

        if(!$(this).hasClass("dropy")) {
            // hide any open menus and remove all other classes
            $(".sidebar .sidebar-inner").slideUp(350);
            $(".sidebar-dropdown a").removeClass("dropy");

            // open our new menu and add the dropy class
            $(".sidebar .sidebar-inner").slideDown(350);
            $(this).addClass("dropy");
        }

        else if($(this).hasClass("dropy")) {
            $(this).removeClass("dropy");
            $(".sidebar .sidebar-inner").slideUp(350);
        }
    });



    /* Widget close */

    $('.wclose').click(function(e){
        e.preventDefault();
        var $wbox = $(this).parent().parent().parent();
        $wbox.hide(100);
    });

    /* Widget minimize */

    $('.wminimize').click(function(e){
        e.preventDefault();
        var $wcontent = $(this).parent().parent().next('.widget-content');
        if($wcontent.is(':visible'))
        {
            $(this).children('i').removeClass('icon-chevron-up');
            $(this).children('i').addClass('icon-chevron-down');
        }
        else
        {
            $(this).children('i').removeClass('icon-chevron-down');
            $(this).children('i').addClass('icon-chevron-up');
        }
        $wcontent.toggle(500);
    });


    /* Support */

    $("#slist a").click(function(e){
        e.preventDefault();
        $(this).next('p').toggle(200);
    });

    /* Scroll to Top */


    $(".totop").hide();

    $(function(){
        $(window).scroll(function(){
            if ($(this).scrollTop()>300)
            {
                $('.totop').slideDown();
            }
            else
            {
                $('.totop').slideUp();
            }
        });

        $('.totop a').click(function (e) {
            e.preventDefault();
            $('body,html').animate({scrollTop: 0}, 500);
        });

    });


    /* Notification box */


    $('.slide-box-head').click(function() {
        var $slidebtn=$(this);
        var $slidebox=$(this).parent().parent();
        if($slidebox.css('right')=="-252px"){
            $slidebox.animate({
                right:0
            },500);
            $slidebtn.children("i").removeClass().addClass("icon-chevron-right");
        }
        else{
            $slidebox.animate({
                right:-252
            },500);
            $slidebtn.children("i").removeClass().addClass("icon-chevron-left");
        }
    });


    $('.sclose').click(function(e){
        e.preventDefault();
        var $wbox = $(this).parent().parent().parent();
        $wbox.hide(0);
    });


    $('.sminimize').click(function(e){
        e.preventDefault();
        var $wcontent = $(this).parent().parent().next('.slide-content');
        if($wcontent.is(':visible'))
        {
            $(this).children('i').removeClass('icon-chevron-down');
            $(this).children('i').addClass('icon-chevron-up');
        }
        else
        {
            $(this).children('i').removeClass('icon-chevron-up');
            $(this).children('i').addClass('icon-chevron-down');
        }
        $wcontent.toggle(0);
    });


});