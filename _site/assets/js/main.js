;(function($, window, document) {
  $(function() {

    bindScroll(10);

    $(window).on('ambeta.scrollUp', function(e) {
      console.log(e);
    });

    $(window).on('ambeta.scrollDown', function(e) {
      console.log(e);
    });


    function bindScroll(sense) {
      sense = sense || 10;

      // bind touch events on mobile devices
      if ('touchstart' in document) {
        var oldPosY, newPosY;

        $(document).on('touchstart', function(e) {
          oldPosY = e.originalEvent.changedTouches[0].pageY;
        });

        $(document).on('touchmove', function(e) {
          newPosY = e.originalEvent.changedTouches[0].pageY;
          if (newPosY - oldPosY > sense) {
            $(window).trigger('ambeta.scrollUp');
          } else if (newPosY - oldPosY < sense) {
            $(window).trigger('ambeta.scrollDown', e);
          }
        });
      }
      // bind window scroll events on normal screens 
      else {
        var oldPosY, newPosY;
        // show top navbar when scroll up
        $(window).on('scroll', function(e) {
          newPosY = (window.pageYOffset !== undefined) ? window.pageYOffset : 
            (document.documentElement || document.body.parentNode || document.body).scrollTop;
          if (newPosY < 0 || Math.abs(newPosY - oldPosY) < sense) return;
          if (oldPosY > newPosY) {
            $(window).trigger('ambeta.scrollUp', e);
          } else if (newPosY > oldPosY) {
            $(window).trigger('ambeta.scrollDown', e)
          }
        });
      }
    }
  });
})(jQuery, window, document, undefined);