(function() {

  define(["backbone"], function(Backbone) {
    var silent, toDeg;
    toDeg = 180 / Math.PI;
    silent = {
      silent: true
    };
    return Backbone.Model.extend({
      initialize: function() {
        var deck;
        deck = this.get("deck");
        deck.on("change:activeSlide", this._activeSlideChanged, this);
        this._lastActive = null;
        return this._activeSlideChanged(deck, deck.get("activeSlide"));
      },
      _activeSlideChanged: function(deck, slide) {
        if (this._lastActive != null) {
          this._lastActive.off(null, null, this);
        }
        return this._lastActive = slide;
      },
      _slideRotationChanged: function(slide, value) {
        return this.trigger("change:slideRotations", this, this.slideRotations());
      },
      slideRotations: function() {
        var slide;
        slide = this._lastActive;
        if (slide != null) {
          return [slide.get("rotateX") * toDeg, slide.get("rotateY") * toDeg, slide.get("rotateZ") * toDeg];
        } else {
          return [0, 0, 0];
        }
      },
      setInterval: function(i) {
        i = i * 1000;
        return this.get("deck").set("interval", i);
      },
      changeSlideRotations: function(x, y, z) {
        var slide, toSet;
        slide = this._lastActive;
        if (slide != null) {
          toSet = {};
          if (x != null) {
            toSet.rotateX = x / toDeg;
          }
          if (y != null) {
            toSet.rotateY = y / toDeg;
          }
          if (z != null) {
            toSet.rotateZ = z / toDeg;
          }
          slide.set(toSet, silent);
          return slide.trigger("rerender");
        }
      },
      constructor: function TransitionEditorButtonBarModel() {
			Backbone.Model.prototype.constructor.apply(this, arguments);
		}
    });
  });

}).call(this);
