$(function() {
    var url = window.location.href;
    url = url.substring(4, url.length);
    if (url.charAt(0) == 's') // remove 's' from 'https'
        url = url.substring(1, url.length);
    if (url.match("://helpdesk.msoe.edu/helpdesk/(.*)"))
        url = "://msoe.freshservice.com/" + url.substring(20, url.length);

    // extension on/off toggle switch 
    // TODO code it so state is saved and meaningful (update on refresh is acceptable)
    $('.header-wrapper').append('<label class="switch" data-tip="Freshservice Helper"><input type="checkbox"><div class="slider round"><div class="slider_text" id="slider_on"><p>ON</p></div><div class="slider_text" id="slider_off"><p>OFF</p></div></div></label>');
    $('.switch').click(function() {
        var on = $('.switch > input').prop("checked");
        if (on) {
            $('#slider_on').fadeTo(100, 1);
            $('#slider_off').fadeTo(100, 0);
        } else {
            $('#slider_on').fadeTo(100, 0);
            $('#slider_off').fadeTo(100, 1);
        }
    });


    // helper function for requesting ajax via JSON
    function ajaxRequest(result) {
        var currentTime = new Date();
        for (var i = 0; i < ticketCount; ++i) {
            var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
            var ticketInfo = elem.text().trim();
            if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0, 5) == 'Close') {
                var ticketTime = new Date(result[i].created_at);
                var tempDiff = 0;
                var createdStr = "Created: ";
                // TODO: replace below nastiness
                // Yeah, this next part was never meant to be read. Have fun debugging! ;D
                // 1 is a special case in English... :(
                if ((tempDiff = (currentTime.getFullYear() - ticketTime.getFullYear())) > 1)
                    elem.text(createdStr + "over " + tempDiff + " years ago, " + elem.text());
                else if ((tempDiff = (currentTime.getFullYear() - ticketTime.getFullYear())) == 1)
                    elem.text(createdStr + "over " + tempDiff + " year ago, " + elem.text());
                else if ((tempDiff = ((currentTime.getMonth() + 1) - (ticketTime.getMonth() + 1))) > 1)
                    elem.text(createdStr + tempDiff + " months ago, " + elem.text());
                else if ((tempDiff = ((currentTime.getMonth() + 1) - (ticketTime.getMonth() + 1))) == 1)
                    elem.text(createdStr + tempDiff + " month ago, " + elem.text());
                else if ((tempDiff = (currentTime.getDate() - ticketTime.getDate())) > 1)
                    elem.text(createdStr + tempDiff + " days ago, " + elem.text());
                else if ((tempDiff = (currentTime.getDate() - ticketTime.getDate())) == 1) {
                    if (currentTime.getHours() > ticketTime.getHours())
                        elem.text(createdStr + tempDiff + " day ago, " + elem.text());
                    else
                        elem.text(createdStr + (24 - (ticketTime.getHours() - currentTime.getHours()) +
                            " hours ago, " + elem.text()));
                } else if ((tempDiff = (currentTime.getHours() - ticketTime.getHours())) > 1)
                    elem.text(createdStr + "about " + tempDiff + " hours ago, " + elem.text());
                else if ((tempDiff = (currentTime.getHours() - ticketTime.getHours())) == 1)
                    elem.text(createdStr + "about " + tempDiff + " hour ago, " + elem.text());
                else if ((tempDiff = (currentTime.getMinutes() - ticketTime.getMinutes())) > 1)
                    elem.text(createdStr + tempDiff + " minutes ago, " + elem.text());
                else if ((tempDiff = (currentTime.getMinutes() - ticketTime.getMinutes())) == 1)
                    elem.text(createdStr + tempDiff + " minute ago, " + elem.text());
                else if ((tempDiff = (currentTime.getSeconds() - ticketTime.getSeconds())) > 0)
                    elem.text(createdStr + "less than a minute ago, " + elem.text());
            }
            elem.addClass('done');
        }
        $('div.info-data.hideForList > div.emphasize').removeClass('done');
    }

    if (url == "://msoe.freshservice.com/helpdesk/tickets" ||
        url.match("://msoe.freshservice.com/helpdesk/tickets/filter/(.*)") ||
        url.match("://msoe.freshservice.com/helpdesk/tickets/view/(.*)")) {

        // in the ticket list view, show date created 
        // along with time agent responded, etc.
        var tCountHigh = $('div.offset.ticketlist-total-count > b:nth-child(2)');
        var tCountLow = $('div.offset.ticketlist-total-count > b:first');
        var ticketCount = parseInt($(tCountHigh).text()) -
            parseInt($(tCountLow).text()) + 1;
        $.ajax({
            url: "https://msoe.freshservice.com/helpdesk/tickets.json",
            success: function(result) { ajaxRequest(result); }
        });

    } else if (url.match("://msoe.freshservice.com/helpdesk/tickets/(.*)")) {
        // individual ticket view
        // TODO use jquery .clone() method to make a dynamic copy of required fields at the top of the page.

        // move sidebar to left & stylize
        // Tested, injecting CSS gets overwritten - jQuery works
        $('div.tkt-wrapper-inner.clearfix').css('margin', '0px').css('padding', '0px');
        $('.tkt-sidebar').css('float', 'left');
        $('.tkt-sidebar').css('margin-right', '50px');
        $('#tkt-inner').css('padding-right', '0px');
        $('#Pagearea').width($('#Pagearea').width()); // set constant width
        $('.leftcontent').width($('#tkt-inner').width() - 370);
        $('a.avatar-wrap').css('position', 'relative');
        $('a.avatar-wrap').css('left', '-30px');
    }

    // do this last 
    // had to use setInterval b/c url may change w/o refresh - this is weird
    setInterval(function() {
        url = window.location.href;
        url = url.substring(4, url.length);
        if (url.charAt(0) == 's') // format https
            url = url.substring(1, url.length);
        console.log(url);
        if (url.match("://helpdesk.msoe.edu/helpdesk/(.*)"))
            url = "://msoe.freshservice.com/" + url.substring(20, url.length);
        if (url == "://msoe.freshservice.com/helpdesk/tickets" ||
            url == "://msoe.freshservice.com/helpdesk/tickets/" ||
            url.match("://msoe.freshservice.com/helpdesk/tickets/filter/(.*)") ||
            url.match("://msoe.freshservice.com/helpdesk/tickets/view/(.*)")) {
            // ticket list view
            // Here is where the real magic happens.  
            var doRequest = false;
            var tCountHigh = $('div.offset.ticketlist-total-count > b:nth-child(2)');
            var tCountLow = $('div.offset.ticketlist-total-count > b:first');
            var ticketCount = parseInt($(tCountHigh).text()) - parseInt($(tCountLow).text()) + 1;

            // scan the page once every second to determine whether an http request is needed
            for (var i = 0; i < ticketCount; ++i) {
                var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
                var ticketInfo = elem.text().trim();
                if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0, 5) == 'Close')
                    doRequest = true;
                elem.addClass('done');
            }
            $('div.info-data.hideForList > div.emphasize').removeClass('done');

            if (doRequest) {
                $.ajax({
                    url: "https://msoe.freshservice.com/helpdesk/tickets.json",
                    success: function(result) {
                        console.log("did request - setInterval");
                        var currentTime = new Date();
                        for (var i = 0; i < ticketCount; ++i) {
                            var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
                            var ticketInfo = elem.text().trim();
                            if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0, 5) == 'Close') {
                                var ticketTime = new Date(result[i].created_at);
                                var tempDiff = 0;
                                var createdStr = "Created: ";
                                // Yeah, this next part was never meant to be read. Have fun debugging! ;D
                                // 1 is a special case in English... :(
                                if ((tempDiff = (currentTime.getFullYear() - ticketTime.getFullYear())) > 1)
                                    elem.text(createdStr + "over " + tempDiff + " years ago, " + elem.text());
                                else if ((tempDiff = (currentTime.getFullYear() - ticketTime.getFullYear())) == 1)
                                    if (currentTime.getMonth() > ticketTime.getMonth())
                                        elem.text(createdStr + "over " + tempDiff + " year ago, " + elem.text());
                                    else
                                        elem.text(createdStr + " about " (12 - (ticketTime.getMonth() - currentTime.getMonth()) +
                                            " months ago, " + elem.text()));
                                else if ((tempDiff = ((currentTime.getMonth() + 1) - (ticketTime.getMonth() + 1))) > 1)
                                    elem.text(createdStr + " about " + tempDiff + " months ago, " + elem.text());
                                else if ((tempDiff = ((currentTime.getMonth() + 1) - (ticketTime.getMonth() + 1))) == 1)
                                    if (currentTime.getDate() > ticketTime.getDate())
                                        elem.text(createdStr + " about " + tempDiff + " month ago, " + elem.text());
                                    else {
                                        var currentMonthTotalDays = 31;
                                        // TODO set the above variable according to the appropriate month
                                        var daysAgo = currentMonthTotalDays - (ticketTime.getDate() - currentTime.getDate());
                                        if (daysAgo > 1)
                                            elem.text(createdStr + daysAgo + " days ago, " + elem.text());
                                        else
                                            elem.text(createdStr + daysAgo + " day ago, " + elem.text());
                                    }
                                else if ((tempDiff = (currentTime.getDate() - ticketTime.getDate())) > 1)
                                    elem.text(createdStr + tempDiff + " days ago, " + elem.text());
                                else if ((tempDiff = (currentTime.getDate() - ticketTime.getDate())) == 1) {
                                    if (currentTime.getHours() > ticketTime.getHours())
                                        elem.text(createdStr + tempDiff + " day ago, " + elem.text());
                                    else {
                                        if (24 - (ticketTime.getHours() - currentTime.getHours()) > 1)
                                            elem.text(createdStr + (24 - (ticketTime.getHours() - currentTime.getHours()) +
                                                " hours ago, " + elem.text()));
                                        else
                                            elem.text(createdStr + (24 - (ticketTime.getHours() - currentTime.getHours()) +
                                                " hour ago, " + elem.text()));
                                    }
                                } else if ((tempDiff = (currentTime.getHours() - ticketTime.getHours())) > 1)
                                    elem.text(createdStr + "about " + tempDiff + " hours ago, " + elem.text());
                                else if ((tempDiff = (currentTime.getHours() - ticketTime.getHours())) == 1)
                                    elem.text(createdStr + "about " + tempDiff + " hour ago, " + elem.text());
                                else if ((tempDiff = (currentTime.getMinutes() - ticketTime.getMinutes())) > 1)
                                    elem.text(createdStr + tempDiff + " minutes ago, " + elem.text());
                                else if ((tempDiff = (currentTime.getMinutes() - ticketTime.getMinutes())) == 1)
                                    elem.text(createdStr + tempDiff + " minute ago, " + elem.text());
                                else if ((tempDiff = (currentTime.getSeconds() - ticketTime.getSeconds())) > 0)
                                    elem.text(createdStr + "less than a minute ago, " + elem.text());
                            }
                            elem.addClass('done');
                        }
                        $('div.info-data.hideForList > div.emphasize').removeClass('done');
                    }
                });
            }
        } else if (url.match("://msoe.freshservice.com/helpdesk/tickets/(.*)")) {
            // individual ticket view
            // move sidebar to left & stylize
            $('div.tkt-wrapper-inner.clearfix').css('margin', '0px').css('padding', '0px');
            $('.tkt-sidebar').css('float', 'left');
            $('.tkt-sidebar').css('margin-right', '50px');
            $('#tkt-inner').css('padding-right', '0px');
            $('#Pagearea').width($('#Pagearea').width()); // set constant width - this might break
            $('.leftcontent').width($('#tkt-inner').width() - 370);
            $('a.avatar-wrap').css('position', 'relative');
            $('a.avatar-wrap').css('left', '-30px');
        }



    }, 1000);
});