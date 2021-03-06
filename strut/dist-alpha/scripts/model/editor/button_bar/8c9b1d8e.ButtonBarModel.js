
/**
* @module model.editor
* @author Matt Crinklaw-Vogt / Tantaman
*
*/


(function() {

  define(["backbone"], function(Backbone) {
    var fontMethods, fontSettings, longSetting, setting, toggleable, _i, _len;
    fontSettings = ["size", "family", "color", "style", "weight", "decoration"];
    toggleable = function(setting) {
      return fontSettings.indexOf(setting) > 2;
    };
    fontMethods = {};
    for (_i = 0, _len = fontSettings.length; _i < _len; _i++) {
      setting = fontSettings[_i];
      longSetting = "font" + setting.substr(0, 1).toUpperCase() + setting.substr(1);
      fontMethods[longSetting] = (function() {
        var _longSetting, _setting;
        _longSetting = longSetting;
        _setting = setting;
        return function(value) {
          var currentValue;
          if (this._activeIsTextbox()) {
            console.log("Setting: " + _longSetting + " " + _setting + " " + value);
            currentValue = this.get(_longSetting);
            if (currentValue === value && toggleable(_setting)) {
              value = "";
            }
            if (_setting === "size") {
              value |= 0;
            }
            this.set(_longSetting, value);
            return this.activeComponent.set(_setting, value);
          }
        };
      })();
    }
    /**
    	* Maintains the state of the button bar and notifies interested
    	* parties of changes.  The ButtonBarModel also listens to the
    	* currently selected component in the slide editor and passes
    	* along the relevant changes that occur to that component.
    	* @class model.editor.button_bar.ButtonBarModel
    	* @constructor
    	*
    */

    return Backbone.Model.extend({
      initialize: function() {
        this.fetch({
          keyTrail: ["editor", "slideEditor", "buttonBar"]
        });
        return _.extend(this, fontMethods);
      },
      /**
      		* Creates an object containing the currently
      		* selected font settings
      		* @method fontConfig
      		* @returns {Object} currently selected font settings
      		*
      */

      fontConfig: function() {
        return {
          size: this.get("fontSize"),
          family: this.get("fontFamily"),
          color: this.get("fontColor"),
          style: this.get("fontStyle"),
          weight: this.get("fontWeight"),
          decoration: this.get("fontDecoration")
        };
      },
      /**
      		* Why does this method even exist?
      		* @method imgConfig
      		*
      */

      itemConfig: function(src) {
        return {
          src: src
        };
      },
      iframeConfig: function(src) {
        return {
          src: src,
          scale: {
            x: 0.75,
            y: 0.75
          }
        };
      },
      /**
      		* Sets the text alignment
      		* @method textAlign
      		* @param {String} value css text-align property value
      		*
      */

      textAlign: function(value) {
        this.set("textAlign", value);
        if (this._activeIsTextbox()) {
          return this.activeComponent.set("align", value);
        }
      },
      _activeIsTextbox: function() {
        return this.activeComponent && this.activeComponent.get("type") === "TextBox";
      },
      _pullFontSettings: function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = fontSettings.length; _j < _len1; _j++) {
          setting = fontSettings[_j];
          _results.push(this.set("font" + setting.substr(0, 1).toUpperCase() + setting.substr(1), this.activeComponent.get(setting)));
        }
        return _results;
      },
      _bindActiveText: function() {
        return this.activeComponent.on("change:size", this._activeFontSizeChanged, this);
      },
      _activeFontSizeChanged: function(model, value) {
        return this.set("fontSize", value);
      },
      /**
      		* Sets the font color (and eventually shape color?)
      		* @method colorSelected
      		* @param {String} hex CSS hex string
      		*
      */

      colorSelected: function(hex) {
        this.set("fontColor", hex);
        if (this._activeIsTextbox()) {
          return this.activeComponent.set("color", hex);
        }
      },
      /**
      		* Sets what the ButtonBar knows as the active component
      		* @method activeComponentChanged
      		* @param {Object} component
      		*
      */

      activeComponentChanged: function(component) {
        if ((this.activeComponent != null)) {
          this.activeComponent.off(null, null, this);
        }
        this.activeComponent = component;
        if (this._activeIsTextbox()) {
          this._pullFontSettings();
          return this._bindActiveText();
        }
      },
      /**
      		* The following are auto-generated methods for
      		* setting the various font peroprties AND updating
      		* the active component with that setting.
      		* @method fontSize
      		*
      */

      /**
      		* @method fontFamily
      		*
      */

      /**
      		* @method fontColor
      		*
      */

      /**
      		* @method fontStyle
      		*
      */

      /**
      		* @method fontWeight
      		*
      */

      /**
      		* @method fontDecoration
      		*
      */

      constructor: function ButtonBarModel() {
			Backbone.Model.prototype.constructor.apply(this, arguments);
		}
    });
  });

}).call(this);
