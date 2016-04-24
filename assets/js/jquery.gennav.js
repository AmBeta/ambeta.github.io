// generate document navigation sidebar
;(function($, window, document, undefined) {
  var GenDocNav = function(elem, options) {
    this.elem = elem;
    this.options = options;
    this.$elem = $(elem);
    this.$win = $(window);
    this.$doc = $(document);
  }

  // the plugin prototype
  GenDocNav.prototype = {
    defaults: {
      navItems: 'h1, h2, h3, h4, h5',
      navItemsId: 'post-nav-item', 
      offset: 10,
      scrollSpeed: 700,
      easing: 'swing'
    },

    init: function() {
      this.config = $.extend({}, this.defaults, this.options);

      // append the nav list to the navbar
      this.$elem.empty().html(this.genListHTML());

      // call OnePageNav plugin
      // this.$elem.onePageNav({
      //   currentClass: this.config.currentClass,
      //   changeHash: this.config.changeHash,
      //   scrollSpeed: this.config.scrollSpeed,
      //   filter: this.config.filter,
      //   easing: this.config.easing,
      //   begin: this.config.begin,
      //   end: this.config.end,
      //   scrollChange: this.config.scrollChange
      // });
      
      this.handleClick();
    },

    handleClick: function() {
      var self = this;
      this.$elem.on('click', 'a', function(e) {
        var target = this.href.match(/\#.*$/gi).toString();
        e.preventDefault();
        $('html, body').animate({
          scrollTop: $(target).offset().top - self.config.offset
        }, self.config.scrollSpeed, self.config.easing);
      });
    },

    genListHTML: function() {
      var self = this;
      var $eles = this.genIdEles();
      var list = '<ul class="nav nav-pills nav-stacked">';
      $.each($eles, function(idx, ele) {
        list += ['<li class="' + ele.tagName.toLowerCase() + ' ' + self.config.navItemsId + '">', 
                    '<a href="#' + ele.id + '">', 
                      $(ele).text(), 
                    '</a>',
                  '</li>'].join('');
      });
      list += '</ul>';
      return list;
    },

    genIdEles: function() {
      var id, n = 0;
      var self = this;
      return $(this.config.navItems).each(function(idx) {
        id = (self.config.navItemsId + '-' + this.tagName + '-' + n++).toLowerCase();
        return $(this).attr('id', id);
      });
    }
  };

  GenDocNav.defaults = GenDocNav.prototype.defaults;

  $.fn.genDocNav = function(options) {
    return this.each(function() {
      new GenDocNav(this, options).init();
    });
  }
})(jQuery, window, document);