(function() {

  define(["backbone", "css!styles/widgets/BackgroundPicker.css"], function(Backbone, empty) {
    var gradOptions;
    gradOptions = {
      type: function(value) {
        return this._updatePicker({
          type: value
        });
      },
      direction: function(value) {
        return this._updatePicker({
          fillDirection: value
        });
      }
    };
    return Backbone.View.extend({
      className: "backgroundPicker modal",
      events: {
        "click .ok": "okClicked",
        "click [data-option]": "optionChosen"
      },
      initialize: function() {},
      show: function(cb, bgOpts) {
        this.$el.modal("show");
        if (bgOpts != null) {
          this._updatePicker(bgOpts);
        }
        return this.cb = cb;
      },
      _updatePicker: function(bgOpts) {
        return this.$gradientPicker.gradientPicker("update", bgOpts);
      },
      _updateGradientPreview: function(styles) {
        this.$gradientPreview.css("background-image", styles[0]);
        return this.$gradientPreview.css("background-image", styles[1]);
      },
      okClicked: function() {
        this.$el.modal("hide");
        return this.cb(this.$gradientPicker.gradientPicker("currentState"));
      },
      optionChosen: function(e) {
        var option, value;
        option = e.currentTarget.dataset.option;
        value = e.target.dataset.value;
        return gradOptions[option].call(this, value);
      },
      render: function() {
        var bgOpts,
          _this = this;
        this.$el.html(JST["widgets/BackgroundPicker"]());
        this.$el.modal();
        this.$gradientPicker = this.$el.find(".gradientPicker");
        this.$gradientPreview = this.$el.find(".gradientPreview");
        this.$gradientPicker.css("width", 250);
        bgOpts = this.options.bgOpts || {};
        bgOpts.change = function(points, styles) {
          return _this._updateGradientPreview(styles);
        };
        this.$gradientPicker.gradientPicker(bgOpts);
        this.$el.modal("hide");
        this.$el.find(".dropdown-toggle").dropdown();
        return this.$el;
      }
    });
  });

}).call(this);
