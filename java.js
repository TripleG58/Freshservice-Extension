$(function()
{
  var url = window.location.href;
  url = url.substring(4,url.length);
  if(url.charAt(0) == 's')
    url = url.substring(1,url.length);
  console.log(url);
  if(url == "://msoe.freshservice.com/helpdesk/tickets" || url.match("://msoe.freshservice.com/helpdesk/tickets/filter/(.*)") || url.match("://msoe.freshservice.com/helpdesk/tickets/view/(.*)")){
    // put the rest of the code here - ticket list view
    console.log("matched");
    $('.header-wrapper').append('<label class="switch" data-tip="Freshservice Helper"><input type="checkbox"><div class="slider round"><div class="slider_text" id="slider_on"><p>ON</p></div><div class="slider_text" id="slider_off"><p>OFF</p></div></div></label>');
    $('.switch').click(function(){
      var on = $('.switch > input').prop("checked");
      // on[0] == true ==> off
      // on[0] == false ==> on
      if (on){
        $('#slider_on').css("opacity", "1");
        $('#slider_off').css("opacity", "0");
      }
      else {
        $('#slider_off').css("opacity", "1");
        $('#slider_on').css("opacity", "0");
      }
    });
    // if (url == 
    //        "*://msoe.freshservice.com/helpdesk/tickets",
          //  "*://msoe.freshservice.com/helpdesk/tickets/view/*",
          //  "*://msoe.freshservice.com/helpdesk/tickets/filter/*"
    // TODO add URL switch here.
    // TODO use jquery .clone() method to make a dynamic copy of phone number field at the top of the page.
    // window.location.href returns the href (URL) of the current page - (Google)
    { // block is for scope management
      ///* Uncomment this line to eliminate this block of code for testing.
      var tCountHigh = $('div.offset.ticketlist-total-count > b:nth-child(2)');
      var tCountLow = $('div.offset.ticketlist-total-count > b:first');
      var ticketCount = parseInt($(tCountHigh).text()) 
                      - parseInt($(tCountLow).text()) + 1;
      $.ajax({
        url: "https://msoe.freshservice.com/helpdesk/tickets.json",
        success: function(result){
          console.log("did request");
          var currentTime = new Date();
          for (var i = 0; i < ticketCount; ++i){
            var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
            var ticketInfo = elem.text().trim();
            if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0,5) == 'Close'){
              var ticketTime = new Date(result[i].created_at);
              var tempDiff = 0;
              var createdStr = "Created: ";
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
              else if ((tempDiff = (currentTime.getDate() - ticketTime.getDate())) == 1)
                elem.text(createdStr + tempDiff + " day ago, " + elem.text());
              else if ((tempDiff = (currentTime.getHours() - ticketTime.getHours())) > 1)
                elem.text(createdStr + "about " + tempDiff + " hours ago, " + elem.text());
              else if((tempDiff = (currentTime.getHours() - ticketTime.getHours())) == 1)
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
      //*/
    }
    setInterval(function(){
      url = window.location.href;
      url = url.substring(4,url.length);
      if(url.charAt(0) == 's') // format https
        url = url.substring(1,url.length);
      console.log(url);
      // Here is where the real magic happens.
      var doRequest = false;
      var tCountHigh = $('div.offset.ticketlist-total-count > b:nth-child(2)');
      var tCountLow = $('div.offset.ticketlist-total-count > b:first');
      var ticketCount = parseInt($(tCountHigh).text()) 
                      - parseInt($(tCountLow).text()) + 1;
      // scan the page once every second to determine whether an http request is needed
      // #helpdesk_ticket_custom_field_phone_number_14966
    
      for (var i = 0; i < ticketCount; ++i){
        var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
        var ticketInfo = elem.text().trim();
        if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0,5) == 'Close')
          doRequest = true;
        elem.addClass('done');
      }
      $('div.info-data.hideForList > div.emphasize').removeClass('done');
      if (doRequest){
        $.ajax({
          url: "https://msoe.freshservice.com/helpdesk/tickets.json",
          success: function(result){
            console.log("did request");
            var currentTime = new Date();
            for (var i = 0; i < ticketCount; ++i){
              var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
              var ticketInfo = elem.text().trim();
              if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0,5) == 'Close'){
                var ticketTime = new Date(result[i].created_at);
                var tempDiff = 0;
                var createdStr = "Created: ";
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
                else if ((tempDiff = (currentTime.getDate() - ticketTime.getDate())) == 1)
                  elem.text(createdStr + tempDiff + " day ago, " + elem.text());
                else if ((tempDiff = (currentTime.getHours() - ticketTime.getHours())) > 1)
                  elem.text(createdStr + "about " + tempDiff + " hours ago, " + elem.text());
                else if((tempDiff = (currentTime.getHours() - ticketTime.getHours())) == 1)
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
    }, 1000);  
  }
});