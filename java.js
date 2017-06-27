$(function()
{
  setInterval(function(){
    var doRequest = false;
    var tCountHigh = $('div.offset.ticketlist-total-count > b:nth-child(2)');
    var tCountLow = $('div.offset.ticketlist-total-count > b:first');
    var ticketCount = parseInt($(tCountHigh).text()) 
                    - parseInt($(tCountLow).text()) + 1;
    for (var i = 0; i < ticketCount && !doRequest; ++i){
      var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
      var ticketInfo = elem.text().trim();
      if (ticketInfo.charAt(0) != 'C'){ 
        // TODO: optimize by keeping track of which tickets need updating to avoid loop later
        // either way, this script is not very heavy, and optimization won't really matter.
        // I also optimized by including "&& !doRequest" in this for loop. That way, italics
        // breaks out of the loop as soon as we know we need to update the HTML. This does 
        // not save much time, however, because there are only ever 30 elements max to iterate over.
        // :( I like optimization...
        doRequest = true;
      }
      elem.addClass('done');
    }
    $('div.info-data.hideForList > div.emphasize').removeClass('done');
    $.ajax({
      url: "https://msoe.freshservice.com/helpdesk/tickets.json",
      success: function(result){
        var currentTime = new Date();
        for (var i = 0; i < ticketCount; ++i){
          var elem = $('div.info-data.hideForList > div.emphasize:not(.done):first()');
          var ticketInfo = elem.text().trim();
          if (ticketInfo.charAt(0) != 'C'){
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
  }, 1000);
});