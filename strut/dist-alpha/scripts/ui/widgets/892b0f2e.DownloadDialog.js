
/*
@author Matt Crinklaw-Vot
*/


(function() {

  define(["backbone", 'common/FileUtils'], function(Backbone, FileUtils) {
    return Backbone.View.extend({
      className: "downloadDialog modal",
      events: {
        "click .ok": "okClicked",
        "hidden": "hidden"
      },
      initialize: function() {
        return this._dlSupported = ('download' in document.createElement('a'));
      },
      show: function(val, name) {
        if (val != null) {
          this._val = val;
          if (this._dlSupported) {
            this._makeDownloadable(name);
          } else {
            $('.download-txt').val(this._val);
          }
          this._val = '';
        }
        return this.$el.modal("show");
      },
      /**
      		Makes a download link for _val
      		*
      */

      _makeDownloadable: function(name) {
        /*
        			MIME_TYPE = 'application\/json'
        			blob = new Blob(@_val, type: MIME_TYPE)
        			a = @$download[0]
        			a.download = 'presentation.json' # needs a real name
        			a.href = window.URL.createObjectURL(blob)
        			a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':')
        */

        var a, attrs;
        attrs = FileUtils.createDownloadAttrs('application\/json', this._val, name + '.json');
        a = this.$download[0];
        a.download = attrs.download;
        a.href = attrs.href;
        return a.dataset.downloadurl = attrs.downloadurl;
      },
      okClicked: function() {
        return this.$el.modal("hide");
      },
      hidden: function() {
        this._val = '';
        return this._cleanUpDownloadLink();
      },
      _cleanUpDownloadLink: function() {
        if (this.$download != null) {
          return window.URL.revokeObjectURL(this.$download.attr('href'));
        }
      },
      render: function() {
        if (this._dlSupported) {
          this.$el.html(JST["widgets/DownloadDialog"]());
        } else {
          this.$el.html(JST['widgets/NoDownloadDialog']());
        }
        this.$el.modal();
        this.$el.modal("hide");
        this.$download = this.$el.find('.downloadLink');
        return this.$el;
      }
    });
  });

}).call(this);
