var util = require('util');

var sax = require('sax');

var sprintf = require('../sprintf').sprintf;

var TreeBuilder = require('./../treebuilder').TreeBuilder;

function XMLParser(target) {
  this.parser = sax.parser(true, {xmlns: true});

  this.target = (target) ? target : new TreeBuilder();

  this.parser.onopentag = this._handleOpenTag.bind(this);
  this.parser.ontext = this._handleText.bind(this);
  this.parser.oncdata = this._handleCdata.bind(this);
  this.parser.ondoctype = this._handleDoctype.bind(this);
  this.parser.oncomment = this._handleComment.bind(this);
  this.parser.onclosetag = this._handleCloseTag.bind(this);
  this.parser.onerror = this._handleError.bind(this);
}

XMLParser.prototype._handleOpenTag = function(tag) {
  var name = clarkEncode(tag),
      attributes = Object.keys(tag.attributes)
        .reduce(function(d, k) {
          var attr = tag.attributes[k];
          d[clarkEncode(attr)] = attr.value;
          return d;
        }, {});
  this.target.start(name, attributes);
};

XMLParser.prototype._handleText = function(text) {
  this.target.data(text);
};

XMLParser.prototype._handleCdata = function(text) {
  this.target.data(text);
};

XMLParser.prototype._handleDoctype = function(text) {
};

XMLParser.prototype._handleComment = function(comment) {
};

XMLParser.prototype._handleCloseTag = function(tag) {
  // We need the namespaced tag, not just the qname.
  // Since the parser is strict, this.parser.tag should be accurate.
  this.target.end(clarkEncode(this.parser.tag));
};

XMLParser.prototype._handleError = function(err) {
  throw err;
};

XMLParser.prototype.feed = function(chunk) {
  this.parser.write(chunk);
};

XMLParser.prototype.close = function() {
  this.parser.close();
  return this.target.close();
};

exports.XMLParser = XMLParser;

function clarkEncode(node) {
  return (node.local && node.uri) ? sprintf('{%s}%s', node.uri, node.local) : node.name;
}
