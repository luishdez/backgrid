/*
  backgrid
  http://github.com/wyuenho/backgrid

  Copyright (c) 2012 Jimmy Yuen Ho Wong
  Licensed under the MIT @license.
*/

/*global Backbone:false, Backgrid:false, Column:false, Formatter:false */

var Cell = Backgrid.Cell = Backbone.View.extend({

  tagName: "td",

  formatter: new Formatter,

  viewModeEvents: {
    "click": "enterEditMode"
  },

  editModeEvents: {
    "blur": "exitEditMode",
    "keydown": "saveAndExitEditMode"
  },

  echo: function (e) {
    console.dir(e);
  },

  initialize: function (options) {
    Backbone.View.prototype.initialize.apply(this, arguments);
    this.formatter = options && options.formatter || this.formatter;
    this.column = options && options.column;
  },

  // Given a column and a model instance, render() will output the formatted
  // value from the model keyed with the column name.
  render: function () {
    this.$el.empty();
    this.$el.text(this.formatter.fromRaw(this.model.get(this.column.get("name"))));
    this.delegateEvents(this.viewModeEvents);
    return this;
  },

  enterEditMode: function (e) {
    if (this.column.get("editable")) {
      e.preventDefault();
      e.stopPropagation();
      var $el = this.$el;
      this.delegateEvents(this.editModeEvents);
      $el.attr("contenteditable", "true").focus();
    }
  },

  saveAndExitEditMode: function (e) {
    // enter
    if (e.keyCode === 13) {
      e.preventDefault();
      var valueToSet = this.formatter.toRaw(this.$el.text());
      if (this.model.set(this.column.get("name"), valueToSet)) {
        this.exitEditMode();
      }
    }
    // esc
    else if (e.keyCode === 27) {
      // undo
      this.$el.text(this.formatter.fromRaw(this.model.get(this.column.get("name"))));
      this.exitEditMode();
    }
  },

  exitEditMode: function () {
    this.$el.removeAttr("contenteditable");
    this.delegateEvents(this.viewModeEvents);
  }

});

// StringCell displays HTML escaped data and accepts anything typed in.
var StringCell = Backgrid.StringCell = Cell.extend({

  className: "backgrid-string-cell",

  formatter: {
    fromRaw: function (rawData) {
      return _.escape(rawData);
    },
    toRaw: function (formattedData) {
      return formattedData;
    }
  }

});

// TODO: allow editing a uri cell
var URICell = Backgrid.URICell = StringCell.extend({

  className: "backgrid-uri-cell",

  render: function (model) {
    this.setElement(this.$el.clone(true, true)[0]);
    this.$el.empty();
    var formattedValue = this.formatter.fromRaw(model.get(this.column.get("name")));
    this.$el.text(formattedValue).children().wrap("<a>", {
      href: formattedValue
    });
    return this;
  }

});

var NumberCell = Backgrid.NumberCell = Cell.extend({

  className: "backgrid-number-cell",

  decimals: 2,
  decimalSeparator: '.',
  orderSeparator: ',',

  initialize: function (options) {
    var self = this;

    Cell.prototype.initialize.apply(self, arguments);

    if (options) {
      self.decimals = typeof options.decimals !== "undefined" ? options.decimals : self.decimals;
      self.decimalSeparator = options.decimalSeparator || self.decimalSeparator;
      self.orderSeparator = typeof options.orderSeparator !== "undefined" ? options.orderSeparator : self.orderSeparator;
    }

    self.formatter = options && options.formatter || {
      fromRaw: function (rawData) {
        var result = _.str.numberFormat(rawData, self.decimals, self.decimalSeparator);
        // underscore.string issue #154
        return result.replace(',', self.orderSeparator);
      },
      toRaw: function (formattedData) {
        return (formattedData.replace(self.orderSeparator, '').replace(self.decimalSeparator, '.') * 1 || 0).toFixed(~~self.decimals);
      }
    };
  }

});

// An IntegerCell is just a NumberCell with 0 decimals. If a floating point
// number is supplied, the number is simply rounded the usual way when
// displayed.
var IntegerCell = Backgrid.IntegerCell = NumberCell.extend({ decimals: 0 });

// DatetimeCell is a basic cell that accepts datetime string values in RFC-2822
// or W3C's subset of ISO-8601 and displays them in ISO-8601 format. Only works
// with EcmaScript 5 compliant browsers at the moment. For a much more
// sophisticated date time cell, the recommended way is to use the bundled
// kalendae-cell.js extension which supplies a KalendaeCell that renders a
// Kalendae widget and uses moment.js to parse the datetime values.
var DatetimeCell = Backgrid.DatetimeCell = Cell.extend({

  className: "backgrid-datetime-cell",

  formatter : {
    fromRaw: function (rawData) {
      return new Date(rawData).toISOString();
    },
    toRaw: function (formattedData) {
      return new Date(rawData).toISOString();
    }
  }

});