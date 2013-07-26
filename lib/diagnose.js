// Generated by CoffeeScript 1.6.3
(function() {
  var BufferStream, Diagnose, Evented, Simple, events, utils,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  events = require('events');

  Evented = require('./evented');

  BufferStream = require('../lib/BufferStream');

  Simple = require('../lib/simple');

  utils = require('../lib/utils');

  Diagnose = (function(_super) {
    __extends(Diagnose, _super);

    function Diagnose(parser, options) {
      this.parser = parser;
      this.on_end = __bind(this.on_end, this);
      this.on_stream_stop = __bind(this.on_stream_stop, this);
      this.on_stream_start = __bind(this.on_stream_start, this);
      this.on_map_stop = __bind(this.on_map_stop, this);
      this.on_map_start = __bind(this.on_map_start, this);
      this.on_array_stop = __bind(this.on_array_stop, this);
      this.on_array_start = __bind(this.on_array_start, this);
      this.on_value = __bind(this.on_value, this);
      this.on_error = __bind(this.on_error, this);
      this.options = utils.extend({
        separator: '\n',
        stream: process.stdout
      }, options);
      if (this.parser == null) {
        this.parser = new Evented(options);
      }
      this.listen();
    }

    Diagnose.prototype.stream_val = function(val) {
      return this.options.stream.write((function() {
        switch (false) {
          case val !== void 0:
            return 'undefined';
          case val !== null:
            return 'nil';
          case typeof val !== 'number':
            if (isNaN(val)) {
              return "NaN";
            } else if (!isFinite(val)) {
              if (val < 0) {
                return '-Infinity';
              } else {
                return 'Infinity';
              }
            } else {
              return JSON.stringify(val);
            }
            break;
          case !Simple.isSimple(val):
            return val.toString();
          case !Buffer.isBuffer(val):
            return "h'" + val.toString('hex') + "'";
          default:
            return JSON.stringify(val);
        }
      })());
    };

    Diagnose.prototype.on_error = function(er) {
      if (this.options.streamErrors) {
        this.options.stream.write(er.toString());
      }
      return this.emit('error', er);
    };

    Diagnose.prototype.fore = function(kind) {
      switch (kind) {
        case 'array':
        case 'key':
        case 'stream':
          return this.options.stream.write(', ');
      }
    };

    Diagnose.prototype.aft = function(kind) {
      switch (kind) {
        case 'key':
        case 'key first':
          return this.options.stream.write(': ');
        case null:
          if (this.options.separator != null) {
            this.options.stream.write(this.options.separator);
          }
          return this.emit('complete', this.options.stream);
      }
    };

    Diagnose.prototype.on_value = function(val, tags, kind) {
      var t, _i, _j, _len, _len1;
      this.fore(kind);
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write("" + t + "(");
        }
      }
      this.stream_val(val);
      if (tags) {
        for (_j = 0, _len1 = tags.length; _j < _len1; _j++) {
          t = tags[_j];
          this.options.stream.write(")");
        }
      }
      return this.aft(kind);
    };

    Diagnose.prototype.on_array_start = function(count, tags, kind) {
      var t, _i, _len;
      this.fore(kind);
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write("" + t + "(");
        }
      }
      this.options.stream.write("[");
      if (count === -1) {
        return this.options.stream.write("_ ");
      }
    };

    Diagnose.prototype.on_array_stop = function(count, tags, kind) {
      var t, _i, _len;
      this.options.stream.write("]");
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write(")");
        }
      }
      return this.aft(kind);
    };

    Diagnose.prototype.on_map_start = function(count, tags, kind) {
      var t, _i, _len;
      this.fore(kind);
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write("" + t + "(");
        }
      }
      this.options.stream.write("{");
      if (count === -1) {
        return this.options.stream.write("_ ");
      }
    };

    Diagnose.prototype.on_map_stop = function(count, tags, kind) {
      var t, _i, _len;
      this.options.stream.write("}");
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write(")");
        }
      }
      return this.aft(kind);
    };

    Diagnose.prototype.on_stream_start = function(mt, tags, kind) {
      var t, _i, _len;
      this.fore(kind);
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write("" + t + "(");
        }
      }
      return this.options.stream.write("(_ ");
    };

    Diagnose.prototype.on_stream_stop = function(count, mt, tags, kind) {
      var t, _i, _len;
      this.options.stream.write(")");
      if (tags) {
        for (_i = 0, _len = tags.length; _i < _len; _i++) {
          t = tags[_i];
          this.options.stream.write(")");
        }
      }
      return this.aft(kind);
    };

    Diagnose.prototype.on_end = function() {
      return this.emit('end');
    };

    Diagnose.prototype.listen = function() {
      this.parser.on('value', this.on_value);
      this.parser.on('array start', this.on_array_start);
      this.parser.on('array stop', this.on_array_stop);
      this.parser.on('map start', this.on_map_start);
      this.parser.on('map stop', this.on_map_stop);
      this.parser.on('stream start', this.on_stream_start);
      this.parser.on('stream stop', this.on_stream_stop);
      this.parser.on('end', this.on_end);
      return this.parser.on('error', this.on_error);
    };

    Diagnose.prototype.unlisten = function() {
      this.parser.removeListener('value', this.on_value);
      this.parser.removeListener('array start', this.on_array_start);
      this.parser.removeListener('array stop', this.on_array_stop);
      this.parser.removeListener('map start', this.on_map_start);
      this.parser.removeListener('map stop', this.on_map_stop);
      this.parser.removeListener('stream start', this.on_stream_start);
      this.parser.removeListener('stream stop', this.on_stream_stop);
      this.parser.removeListener('end', this.on_end);
      return this.parser.removeListener('error', this.on_error);
    };

    Diagnose.prototype.unpack = function(buf, offset, encoding) {
      return this.parser.unpack(buf, offset, encoding);
    };

    return Diagnose;

  })(events.EventEmitter);

  module.exports = Diagnose;

}).call(this);