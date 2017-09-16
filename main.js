$(function() {
  // extension on/off toggle switch 
  $('.header-wrapper').append('<label class="switch" data-tip="Freshservice Helper"><input type="checkbox"><div class="slider round"><div class="slider_text" id="slider_on"><p>ON</p></div><div class="slider_text" id="slider_off"><p>OFF</p></div></div></label>');

  // helper function for changing state of toggle switch
  function changeToggleSwitch() {
      var on = $('.switch > input').prop("checked");
      if (on) {
          $('#slider_on').fadeTo(100, 1);
          $('#slider_off').fadeTo(100, 0);
      } else {
          $('#slider_on').fadeTo(100, 0);
          $('#slider_off').fadeTo(100, 1);
      }
  }

  // set starting state of toggle switch
  chrome.storage.local.get('on', function(data) {
      $('.switch > input').prop('checked', data.on);
      changeToggleSwitch();
      if($('.switch > input').prop('checked'))
        main();
  });

  // runs every second
  // had to use setInterval b/c URL may change w/o refresh - this is weird
  setInterval(function() {
    if($('.switch > input').prop('checked'))
      main();
  }, 1000);

  // Toggle switch on/off handler
  $('.switch').click(function() {
      var on = $('.switch > input').prop("checked");
      chrome.storage.local.set({ "on": on });
      changeToggleSwitch();
  });

  // helper function for editing css of individual ticket view
  function redoCSS() {
      // move sidebar to left & stylize
      // Tested, injecting CSS gets overwritten - jQuery works
      $('div.tkt-wrapper-inner.clearfix').css('margin', '0px').css('padding', '0px');
      $('.tkt-sidebar').css('float', 'left').css('margin-right', '50px');
      $('#tkt-inner').css('padding-right', '0px');
      $('#Pagearea').width($('#Pagearea').width()); // set constant width
      $('.leftcontent').width($('#tkt-inner').width() - 370);
      $('a.avatar-wrap').css('position', 'relative').css('left', '-30px');
      // move ticket properties to top
      $('#ticket_details_sidebar').css('display', 'flex').css('flex-wrap', 'wrap');
      $('#TicketProperties').css('order', '-10').css('margin-top', '0px').css('border', 'none').css('padding-top', '4px');
      $('#due-by-element-parent').css('border-top', '1px solid #D9D9D9').css('width', '100%');
      // move required ticket properties to top
      $('#TicketPropertiesFields').css('display', 'flex').css('flex-wrap', 'wrap');
      $('li:has(.required_star)').css('order', '-10');
      // TODO: insert requester info
      $('.sticky_right').css('min-width', 'initial');
      $('#sticky_header').append('<div class="requesterInfoNew"><h3>Requester Info</h3></div>');
  }

  // helper function for requesting ajax via JSON
  function ajaxRequest(result, ticketCount) {
      // console helps debugging exceeded rate limit
      console.log("ajax request made");
      var currentTime = new Date();
      for (var i = 0; i < ticketCount; ++i) {
          var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
          var ticketInfo = elem.text().trim();
          if (ticketInfo.charAt(0) != 'C' || ticketInfo.substring(0, 5) == 'Close') {
              var ticketTime = new Date(result[i].created_at);
              var tempDiff = 0;
              var createdStr = "Created: ";
              // TODO: replace below nastiness with millisecond comparison (try to find library)
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

  ////////////////////////////////// MAIN ////////////////////////////////////
  function main() {
      // get & format current URL
      var url = window.location.href;
      url = url.substring(4, url.length);
      if (url.charAt(0) == 's') // format https
          url = url.substring(1, url.length);
      if (url.match("://helpdesk.msoe.edu/helpdesk/(.*)"))
          url = "://msoe.freshservice.com/" + url.substring(20, url.length);

      if (url == "://msoe.freshservice.com/helpdesk/tickets" ||
          url == "://msoe.freshservice.com/helpdesk/tickets/" ||
          url.match("://msoe.freshservice.com/helpdesk/tickets/filter/(.*)") ||
          url.match("://msoe.freshservice.com/helpdesk/tickets/view/(.*)")) {
          // ticket list view
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
                      // tested falsity of conditional if field doesn't exist
                      if (result.require_login)
                          $.ajax({
                              url: "https://helpdesk.msoe.edu/helpdesk/tickets.json",
                              success: function(res) { ajaxRequest(res, ticketCount); }
                          });
                      else
                          ajaxRequest(result, ticketCount);
                  }
              });
          }
      } else if (url.match("://msoe.freshservice.com/helpdesk/tickets/(.*)")) {
          // individual ticket view
          // if new html already inserted, don't redoCSS
          if(!$('.requesterInfoNew').length)
            redoCSS();
      }
  }
});
