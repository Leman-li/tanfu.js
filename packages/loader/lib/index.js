"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var _require = require('@babel/parser'),
    parse = _require.parse;

var traverse = require('@babel/traverse').default;

var generate = require('@babel/generator').default;

var t = require('@babel/types');

var _require2 = require('@xmldom/xmldom'),
    DOMParser = _require2.DOMParser;

module.exports = function (source) {
  if (this.cacheable) {
    this.cacheable();
  }

  var ast = parse(source, {
    // parse in strict mode and allow module declarations
    sourceType: "module",
    plugins: [// enable jsx and flow syntax
    "jsx", "typescript", "decorators-legacy"]
  });
  traverse(ast, {
    ClassMethod: function ClassMethod(path) {
      if (t.isIdentifier(path.node.key) && path.node.key.name === 'template') {
        traverse(path.node, {
          TaggedTemplateExpression: function TaggedTemplateExpression(_path) {
            if (t.isIdentifier(_path.node.tag) && _path.node.tag.name === 'html') {
              var _path$node$quasi$quas, _path$node$quasi$quas2;

              var value = (_path$node$quasi$quas = _path.node.quasi.quasis) === null || _path$node$quasi$quas === void 0 ? void 0 : (_path$node$quasi$quas2 = _path$node$quasi$quas[0]) === null || _path$node$quasi$quas2 === void 0 ? void 0 : _path$node$quasi$quas2.value.raw;

              if (value) {
                _path.replaceWith(t.callExpression(t.identifier('html'), [html(value)]));
              } else {
                _path.replaceWith(t.callExpression(t.identifier('html'), [ObjectExpression({})]));
              }
            }
          }
        }, path.scope, null, path.parentPath);
      }
    },
    Decorator: function Decorator(path) {
      var _path$node, _path$node$expression;

      if (t.isIdentifier((_path$node = path.node) === null || _path$node === void 0 ? void 0 : (_path$node$expression = _path$node.expression) === null || _path$node$expression === void 0 ? void 0 : _path$node$expression.callee) && path.node.expression.callee.name === 'Component') {
        traverse(path.node, {
          ObjectProperty: function ObjectProperty(_path) {
            if (t.isIdentifier(_path.node.key) && _path.node.key.name === 'providers' && t.isArrayExpression(_path.node.value)) {
              var newValue = t.arrayExpression();

              _path.node.value.elements.forEach(function (v) {
                if (t.isIdentifier(v)) {
                  newValue.elements.push(ObjectExpression({
                    provide: v.name,
                    useClass: v
                  }));
                } else newValue.elements.push(v);
              });

              _path.node.value = newValue;
            }
          }
        }, path.scope, null, path.parentPath);
      }
    },
    ClassDeclaration: function ClassDeclaration(classPath) {
      var isControllerOrProvider = false;

      if (classPath.node.decorators) {
        classPath.node.decorators.forEach(function (decorator) {
          var _decorator$expression;

          if (t.isIdentifier(decorator === null || decorator === void 0 ? void 0 : (_decorator$expression = decorator.expression) === null || _decorator$expression === void 0 ? void 0 : _decorator$expression.callee) && ['Controller', 'Injectable'].includes(decorator.expression.callee.name)) {
            isControllerOrProvider = true;
          }
        });
      }

      if (isControllerOrProvider) {
        traverse(classPath.node, {
          ClassMethod: function ClassMethod(methodPath) {
            if (t.isIdentifier(methodPath.node.key) && methodPath.node.key.name === 'constructor') {
              var params = [];
              methodPath.node.params.forEach(function (param) {
                var _param$decorators, _ref, _ref$typeAnnotation, _param$parameter;

                // 是否存在Inject
                var existInject = false;
                (_param$decorators = param.decorators) === null || _param$decorators === void 0 ? void 0 : _param$decorators.forEach(function (decorator) {
                  var _decorator$expression2;

                  if (t.isIdentifier((_decorator$expression2 = decorator.expression) === null || _decorator$expression2 === void 0 ? void 0 : _decorator$expression2.callee) && decorator.expression.callee.name === 'Inject') {
                    existInject = true;
                  }
                });
                if (existInject) params.push(param); // 如果param是 Identifier类型则直接param.,如果是TSParameterProperty类型则使用param.parameter.
                else if (t.isTSTypeReference((_ref = (_param$parameter = param === null || param === void 0 ? void 0 : param.parameter) !== null && _param$parameter !== void 0 ? _param$parameter : param) === null || _ref === void 0 ? void 0 : (_ref$typeAnnotation = _ref.typeAnnotation) === null || _ref$typeAnnotation === void 0 ? void 0 : _ref$typeAnnotation.typeAnnotation)) {
                  var _param$parameter2;

                  if (t.isIdentifier(((_param$parameter2 = param.parameter) !== null && _param$parameter2 !== void 0 ? _param$parameter2 : param).typeAnnotation.typeAnnotation.typeName)) {
                    var _param$parameter3, _param$decorators2;

                    // 找到Inject token
                    var token = ((_param$parameter3 = param === null || param === void 0 ? void 0 : param.parameter) !== null && _param$parameter3 !== void 0 ? _param$parameter3 : param).typeAnnotation.typeAnnotation.typeName.name;
                    param.decorators = (_param$decorators2 = param.decorators) !== null && _param$decorators2 !== void 0 ? _param$decorators2 : []; // 在参数前加入 @Inject(token)

                    param.decorators.push(t.decorator(t.callExpression(t.identifier('Inject'), [t.stringLiteral(token)])));
                    params.push(param);
                  } else params.push(param);
                } else params.push(param);
              });
              methodPath.node.params = params;
            }
          }
        }, classPath.scope, null, classPath.parentPath);
      }
    }
  });

  var _generate = generate(ast, {
    /* options */
  }, source),
      code = _generate.code;

  return code;
};

var tNode = {
  TEXT_NODE: 3,
  ELEMENT_NODE: 1
};
/** 转换Nodes方法 */

function convertNodes(nodes) {
  var children = [];
  Object.values(nodes !== null && nodes !== void 0 ? nodes : {}).forEach(function (node) {
    var _node$nodeValue;

    switch (node.nodeType) {
      case tNode.TEXT_NODE:
        if ((node === null || node === void 0 ? void 0 : (_node$nodeValue = node.nodeValue) === null || _node$nodeValue === void 0 ? void 0 : _node$nodeValue.trim()) != '') {
          children.push({
            name: 'span',
            type: tNode.TEXT_NODE,
            value: node.nodeValue
          });
        }

        break;

      case tNode.ELEMENT_NODE:
        // @ts-ignore
        var attributes = node.attributes;
        var directives = [];
        var props = {};

        for (var i = 0; i < (attributes === null || attributes === void 0 ? void 0 : attributes.length); i++) {
          var _ref2 = attributes.item(i) || {},
              _ref2$name = _ref2.name,
              name = _ref2$name === void 0 ? '' : _ref2$name,
              value = _ref2.value; // 如果名称以 t- 开头 说明是指令


          if (name === null || name === void 0 ? void 0 : name.startsWith('t-')) {
            (function () {
              var _name$match, _name$match$, _name$match2, _name$match2$, _name$match3;

              var _name = name === null || name === void 0 ? void 0 : (_name$match = name.match(/t-(\w+)/g)) === null || _name$match === void 0 ? void 0 : (_name$match$ = _name$match[0]) === null || _name$match$ === void 0 ? void 0 : _name$match$.replaceAll("t-", "");

              var arg = name === null || name === void 0 ? void 0 : (_name$match2 = name.match(/\:(\w+)/g)) === null || _name$match2 === void 0 ? void 0 : (_name$match2$ = _name$match2[0]) === null || _name$match2$ === void 0 ? void 0 : _name$match2$.replaceAll(":", "");
              var modifiers = {};
              name === null || name === void 0 ? void 0 : (_name$match3 = name.match(/\.(\w+)/g)) === null || _name$match3 === void 0 ? void 0 : _name$match3.forEach(function (key) {
                modifiers[key.replaceAll(".", "")] = true;
              }); // 执行的描述

              var descriptor = {
                expression: value,
                arg: arg,
                modifiers: modifiers
              };
              var directive = directives.find(function (o) {
                return o.name === _name;
              }); // 如果存在，则直接推送

              if (directive) directive.descriptors.push(descriptor);else directives.push({
                name: _name,
                descriptors: [descriptor]
              });
            })();
          } else props["".concat(name)] = value;
        }

        var subChildren = convertNodes(node.childNodes);
        var $slot = {};
        subChildren.forEach(function (node) {
          var _node$props;

          if ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props['slot-name']) {
            var _node$props2;

            $slot[(_node$props2 = node.props) === null || _node$props2 === void 0 ? void 0 : _node$props2['slot-name']] = node;
          }
        });
        props['$slot'] = $slot;
        children.push({
          name: node.nodeName,
          directives: directives,
          props: props,
          children: subChildren,
          tId: props['t-id'],
          type: tNode.ELEMENT_NODE
        });
    }
  });
  return children;
}

function getLiteral(value) {
  var _Object$prototype$toS;

  if (value instanceof TanFuObjectExpression) return value.expression;
  if (value instanceof TanFuArrayExpression) return value.expression;
  if (t.isExpression(value)) return value;
  if (typeof value === 'string') return t.stringLiteral(value);
  if (typeof value === 'number') return t.numericLiteral(value);
  if (typeof value === 'boolean') return t.booleanLiteral(value);
  if ((_Object$prototype$toS = Object.prototype.toString.call(value)) === null || _Object$prototype$toS === void 0 ? void 0 : _Object$prototype$toS.includes('Object')) return ObjectExpression(value);
  if (Object.prototype.toString.call(value).includes('Array')) return ArrayExpression(value);
  return t.nullLiteral();
}

var TanFuObjectExpression = /*#__PURE__*/function () {
  function TanFuObjectExpression(object) {
    _classCallCheck(this, TanFuObjectExpression);

    this.expression = ObjectExpression(object);
  }

  _createClass(TanFuObjectExpression, [{
    key: "addProperty",
    value: function addProperty(key, value) {
      this.expression.properties.push(t.objectProperty(t.identifier(key), getLiteral(value)));
    }
  }, {
    key: "get",
    value: function get(key) {
      return this.expression.properties.find(function (item) {
        return item.key.name === key;
      });
    }
  }]);

  return TanFuObjectExpression;
}();

var TanFuArrayExpression = /*#__PURE__*/function () {
  function TanFuArrayExpression(arr) {
    _classCallCheck(this, TanFuArrayExpression);

    this.expression = ArrayExpression(arr || []);
  }

  _createClass(TanFuArrayExpression, [{
    key: "push",
    value: function push() {
      var _this$expression$elem;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_this$expression$elem = this.expression.elements).push.apply(_this$expression$elem, _toConsumableArray(args === null || args === void 0 ? void 0 : args.map(function (value) {
        return getLiteral(value);
      })));
    }
  }]);

  return TanFuArrayExpression;
}();

function ObjectExpression(object) {
  var expression = t.objectExpression([]);
  Object.keys(object).forEach(function (key) {
    expression.properties.push(t.objectProperty(t.identifier(key), getLiteral(object[key])));
  });
  return expression;
}

function ArrayExpression(arr) {
  var expression = t.arrayExpression();
  arr.forEach(function (item) {
    expression.elements.push(getLiteral(item));
  });
  return expression;
}
/** 将html字符串转换为 templateObject对象 */


function html(template) {
  var parser = new DOMParser();
  var doc = parser.parseFromString("<t-template>".concat(template, "</t-template>"), 'text/xml');
  var root = doc.getElementsByTagName('t-template')[0];
  var rootElements = {
    children: convertNodes(root.childNodes),
    name: 'template',
    props: {},
    type: tNode.ELEMENT_NODE
  };
  return ObjectExpression(rootElements);
}