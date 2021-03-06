(function() {

  define(["libs/keymaster"], function(Keymaster) {
    var funcs, result;
    funcs = ["cut", "copy", "paste"];
    return result = {
      applyTo: function(obj, scope) {
        _.bindAll(obj, funcs);
        Keymaster("ctrl+x, ⌘+x", scope, obj.cut);
        Keymaster("ctrl+c, ⌘+c", scope, obj.copy);
        return Keymaster("ctrl+v, ⌘+v", scope, obj.paste);
      }
    };
  });

}).call(this);
