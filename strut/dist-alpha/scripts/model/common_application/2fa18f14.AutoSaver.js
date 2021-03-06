
/**
* @module model.common_application
* @author Matt Crinklaw-Vogt
*
*/


(function() {

  define(["storage/FileStorage"], function(FileStorage) {
    var AutoSaver, defaults;
    defaults = {
      interval: 10,
      onUnload: true
    };
    /**
    	* Auto saves a given model on a specified interval.
    	* The model is expected to have a fileName attribute.
    	* The model is saved by calling its toJSON method
    	* @class model.common_application.AutoSave
    	* @constructor
    	* @param {Object} model The model to be saved
    	* @param {Object} [options] Options specifying how the model should be saved
    	*	@param {Integer} [options.interval] Inteval, in seconds, that the model should be saved.
    	*
    */

    return AutoSaver = (function() {

      function AutoSaver(model, options) {
        var _this = this;
        this.model = model;
        this.options = options;
        this.options || (this.options = {});
        _.defaults(this.options, defaults);
        if (this.options.onUnload) {
          $(window).unload(function() {
            return _this._save();
          });
        }
      }

      /**
      		* Starts the auto save task if not already started
      		* @method start
      		*
      */


      AutoSaver.prototype.start = function() {
        var _this = this;
        if (!(this.handle != null)) {
          return this.handle = setInterval(function() {
            return _this._save();
          }, this.options.interval * 1000);
        }
      };

      /**
      		* Stops the auto save task if it is currently running
      		* @method stop
      		*
      */


      AutoSaver.prototype.stop = function() {
        if (this.handle != null) {
          clearInterval(this.handle);
          return this.handle = null;
        }
      };

      AutoSaver.prototype._save = function() {
        var fileName;
        fileName = this.model.get("fileName");
        if (!(fileName != null)) {
          fileName = "presentation-1";
          this.model.set("fileName", fileName);
        }
        if (fileName !== this._lastName) {
          this._lastName = fileName;
          localStorage.setItem("StrutLastPres", fileName);
        }
        return FileStorage.save(fileName, this.model.toJSON(false, true));
      };

      return AutoSaver;

    })();
  });

}).call(this);
