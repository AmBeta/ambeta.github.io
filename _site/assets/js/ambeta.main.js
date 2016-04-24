;(function($, window, document) {
  $(function() {

    addScrollTrigger();
    bindScrollEvent();

    function bindScrollEvent() {
      var tiktok = null;
      var $navbar = $('.navbar-custom, .navbar-header');

      $(window).on('ambeta.scrollUp ambeta.scrollDown', function(e) {
        e.scrollTop > 30 ? $navbar.addClass('fixed') : $navbar.removeClass('fixed');
      });

      $(window).on('ambeta.scrollUp', function(e) {
        $navbar.addClass('visible');
        // automatically hide the navbar
        clearTimeout(tiktok);
        tiktok = setTimeout(function() {
          $navbar.removeClass('visible');
        }, 3000);
      });

      $(window).on('ambeta.scrollDown', function(e) {
        $navbar.removeClass('visible');
      });
    }

    function addScrollTrigger(sense) {
      sense = sense || 0;

      // bind touch events on mobile devices
      if ('ontouchstart' in document) {
        var oldPosY, newPosY;

        $(document).on('touchstart', function(e) {
          oldPosY = e.originalEvent.changedTouches[0].pageY;
        });

        $(document).on('touchmove', function(e) {
          var myEvent = $.Event();
          myEvent.type = 'ambeta';
          myEvent.originalEvent = e;
          myEvent.scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : 
            (document.documentElement || document.body.parentNode || document.body).scrollTop;

          // trigger scrollUp and scrollDown events
          newPosY = e.originalEvent.changedTouches[0].pageY;
          if (newPosY - oldPosY > sense) {
            myEvent.namespace = 'scrollUp';
            $(window).trigger(myEvent);
          } else if (newPosY - oldPosY < sense) {
            myEvent.namespace = 'scrollDown'
            $(window).trigger(myEvent);
          }


        });
      }
      // bind window scroll events on normal screens 
      else {
        var oldPosY, newPosY;

        $(window).on('scroll', function(e) {
          newPosY = (window.pageYOffset !== undefined) ? window.pageYOffset : 
            (document.documentElement || document.body.parentNode || document.body).scrollTop;

          var myEvent = $.Event();
          myEvent.type = 'ambeta';
          myEvent.originalEvent = e;
          myEvent.scrollTop = newPosY;

          if (oldPosY - newPosY > sense) {
            myEvent.namespace = 'scrollUp';
            $(window).trigger(myEvent);
          } else if (newPosY > oldPosY) {
            myEvent.namespace = 'scrollDown';
            $(window).trigger(myEvent);
          }
          oldPosY = newPosY;
        });
      }
    }
  });
})(jQuery, window, document, undefined);