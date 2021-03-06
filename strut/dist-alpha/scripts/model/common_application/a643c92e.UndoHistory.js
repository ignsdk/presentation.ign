
/**
* @module model.common_application
* @author Matt Crinklaw-Vogt
*
*/


(function() {

  define(["common/EventEmitter", "common/collections/LinkedList"], function(EventEmitter, LinkedList) {
    /**
    	* Maintains a list of commands in an undo history.
    	* Drops commands when they should no longer be reachable
    	* via standard undo/redo semantics.
    	* @class model.common_application.UndoHistory
    	* @constructor
    	* @param {Integer} size Number of commands/actions to remember
    	*
    */

    var UndoHistory;
    return UndoHistory = (function() {

      function UndoHistory(size) {
        this.size = size;
        this.actions = new LinkedList();
        this.cursor = null;
        this.undoCount = 0;
        _.extend(this, new EventEmitter());
      }

      UndoHistory.prototype.clear = function() {
        this.cursor = null;
        this.undoCount = null;
        return this.actions = new LinkedList();
      };

      /**
      		* Adds a new command to the undo history.
      		* This re-sets the re-do history
      		* @method push
      		* @param {Command} command Command to be added to the history 
      		*
      */


      UndoHistory.prototype.push = function(action) {
        var node;
        if ((this.actions.length - this.undoCount) < this.size) {
          if (this.undoCount > 0) {
            node = {
              prev: null,
              next: null,
              value: action
            };
            if (!this.cursor) {
              this.actions.head = node;
              this.actions.length = 1;
            } else {
              node.prev = this.cursor;
              this.cursor.next.prev = null;
              this.cursor.next = node;
              this.actions.length += 1;
              this.actions.length = this.actions.length - this.undoCount;
            }
            this.actions.tail = node;
            this.undoCount = 0;
            this.cursor = null;
          } else {
            this.actions.push(action);
            this.cursor = null;
          }
        } else {
          this.actions.shift();
          this.actions.push(action);
        }
        this.emit("updated");
        return this;
      };

      UndoHistory.prototype.pushdo = function(action) {
        action["do"]();
        return this.push(action);
      };

      /**
      		* This is useful for telling the user what command would be undone
      		* if they pressed undo.
      		* @method undoName
      		* @returns {String} name of the next command to be undone
      		*
      */


      UndoHistory.prototype.undoName = function() {
        var node;
        if (this.undoCount < this.actions.length) {
          node = this.cursor || this.actions.tail;
          if (node != null) {
            return node.value.name;
          } else {
            return "";
          }
        } else {
          return "";
        }
      };

      /**
      		* This is useful for telling the user what command would be
      		* redone if they pressed redo
      		* @method redoName
      		* @returns {String} name of the next command to be redone
      		*
      */


      UndoHistory.prototype.redoName = function() {
        var node;
        if (this.undoCount > 0) {
          if (!(this.cursor != null)) {
            node = this.actions.head;
          } else {
            node = this.cursor.next;
          }
          if (node != null) {
            return node.value.name;
          } else {
            return "";
          }
        } else {
          return "";
        }
      };

      /**
      		* Undoes a command
      		* @method undo
      		* @returns {model.common_application.UndoHistory} this
      		*
      */


      UndoHistory.prototype.undo = function() {
        if (this.undoCount < this.actions.length) {
          if (!(this.cursor != null)) {
            this.cursor = this.actions.tail;
          }
          this.cursor.value.undo();
          this.cursor = this.cursor.prev;
          ++this.undoCount;
          this.emit("updated");
        }
        return this;
      };

      /**
      		* Redoes a command
      		* @method redo
      		* @returns {model.common_application.UndoHistory} this
      		*
      */


      UndoHistory.prototype.redo = function() {
        if (this.undoCount > 0) {
          if (!(this.cursor != null)) {
            this.cursor = this.actions.head;
          } else {
            this.cursor = this.cursor.next;
          }
          this.cursor.value["do"]();
          --this.undoCount;
          this.emit("updated");
        }
        return this;
      };

      return UndoHistory;

    })();
  });

}).call(this);
