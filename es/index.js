import React, { Component } from 'react';
import PropTypes from 'prop-types';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var partialCircle = function partialCircle(cx, cy, r, start, end) {
  var length = end - start;
  if (length === 0) return [];
  var fromX = r * Math.cos(start) + cx;
  var fromY = r * Math.sin(start) + cy;
  var toX = r * Math.cos(end) + cx;
  var toY = r * Math.sin(end) + cy;
  var large = Math.abs(length) <= Math.PI ? '0' : '1';
  var sweep = length < 0 ? '0' : '1';
  return [['M', fromX, fromY], ['A', r, r, 0, large, sweep, toX, toY]];
};

var svgPartialCircle = partialCircle;

var PI = Math.PI;
function degreesToRadians(degrees) {
  return degrees * PI / 180;
}
function evaluateViewBoxSize(ratio, baseSize) {
  // Wide ratio
  if (ratio > 1) {
    return "0 0 " + baseSize + " " + baseSize / ratio;
  } // Narrow/squared ratio


  return "0 0 " + baseSize * ratio + " " + baseSize;
}
function evaluateLabelTextAnchor(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      labelPosition = _ref.labelPosition,
      lineWidth = _ref.lineWidth,
      labelHorizontalShift = _ref.labelHorizontalShift;

  // Label in the vertical center
  if (labelHorizontalShift === 0) {
    return 'middle';
  } // Outward label


  if (labelPosition > 100) {
    return labelHorizontalShift > 0 ? 'start' : 'end';
  } // Inward label


  var innerRadius = 100 - lineWidth;

  if (labelPosition < innerRadius) {
    return labelHorizontalShift > 0 ? 'end' : 'start';
  } // Overlying label


  return 'middle';
}
function valueBetween(value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}
function extractPercentage(value, percentage) {
  return value * percentage / 100;
}

function makePathCommands(cx, cy, startAngle, lengthAngle, radius) {
  var patchedLengthAngle = valueBetween(lengthAngle, -359.999, 359.999);
  return svgPartialCircle(cx, cy, // center X and Y
  radius, degreesToRadians(startAngle), degreesToRadians(startAngle + patchedLengthAngle)).map(function (command) {
    return command.join(' ');
  }).join(' ');
}

function ReactMinimalPieChartPath(_ref) {
  var cx = _ref.cx,
      cy = _ref.cy,
      startAngle = _ref.startAngle,
      lengthAngle = _ref.lengthAngle,
      radius = _ref.radius,
      lineWidth = _ref.lineWidth,
      reveal = _ref.reveal,
      title = _ref.title,
      props = _objectWithoutPropertiesLoose(_ref, ["cx", "cy", "startAngle", "lengthAngle", "radius", "lineWidth", "reveal", "title"]);

  var actualRadio = radius - lineWidth / 2;
  var pathCommands = makePathCommands(cx, cy, startAngle, lengthAngle, actualRadio);
  var strokeDasharray;
  var strokeDashoffset; // Animate/hide paths with "stroke-dasharray" + "stroke-dashoffset"
  // https://css-tricks.com/svg-line-animation-works/

  if (typeof reveal === 'number') {
    var pathLength = degreesToRadians(actualRadio) * lengthAngle;
    strokeDasharray = Math.abs(pathLength);
    strokeDashoffset = pathLength - extractPercentage(pathLength, reveal);
  }

  return React.createElement("path", _extends({
    d: pathCommands,
    strokeWidth: lineWidth,
    strokeDasharray: strokeDasharray,
    strokeDashoffset: strokeDashoffset
  }, props), title && React.createElement("title", null, title));
}
ReactMinimalPieChartPath.displayName = 'ReactMinimalPieChartPath';
ReactMinimalPieChartPath.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  startAngle: PropTypes.number,
  lengthAngle: PropTypes.number,
  radius: PropTypes.number,
  lineWidth: PropTypes.number,
  reveal: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
ReactMinimalPieChartPath.defaultProps = {
  startAngle: 0,
  lengthAngle: 0,
  lineWidth: 100,
  radius: 100
};

var stylePropType = PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]));
var dataPropType = PropTypes.arrayOf(PropTypes.shape({
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.number.isRequired,
  color: PropTypes.string,
  key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: stylePropType
}));

function ReactMinimalPieChartLabel(_ref) {
  var data = _ref.data,
      dataIndex = _ref.dataIndex,
      color = _ref.color,
      props = _objectWithoutPropertiesLoose(_ref, ["data", "dataIndex", "color"]);

  return React.createElement("text", _extends({
    textAnchor: "middle",
    dominantBaseline: "middle",
    fill: color
  }, props));
}
ReactMinimalPieChartLabel.displayName = 'ReactMinimalPieChartLabel';
ReactMinimalPieChartLabel.propTypes = {
  data: dataPropType,
  dataIndex: PropTypes.number,
  color: PropTypes.string
};

var VIEWBOX_SIZE = 100;
var VIEWBOX_HALF_SIZE = VIEWBOX_SIZE / 2;

function sumValues(data) {
  return data.reduce(function (acc, dataEntry) {
    return acc + dataEntry.value;
  }, 0);
} // Append "percentage", "degrees" and "startOffset" into each data entry


function extendData(_ref) {
  var data = _ref.data,
      totalAngle = _ref.lengthAngle,
      totalValue = _ref.totalValue,
      paddingAngle = _ref.paddingAngle;
  var total = totalValue || sumValues(data);
  var normalizedTotalAngle = valueBetween(totalAngle, -360, 360);
  var numberOfPaddings = Math.abs(normalizedTotalAngle) === 360 ? data.length : data.length - 1;
  var singlePaddingDegrees = Math.abs(paddingAngle) * Math.sign(totalAngle);
  var degreesTakenByPadding = singlePaddingDegrees * numberOfPaddings;
  var degreesTakenByPaths = normalizedTotalAngle - degreesTakenByPadding;
  var lastSegmentEnd = 0;
  return data.map(function (dataEntry) {
    var valueInPercentage = dataEntry.value / total * 100;
    var degrees = extractPercentage(degreesTakenByPaths, valueInPercentage);
    var startOffset = lastSegmentEnd;
    lastSegmentEnd = lastSegmentEnd + degrees + singlePaddingDegrees;
    return _extends({
      percentage: valueInPercentage,
      degrees: degrees,
      startOffset: startOffset
    }, dataEntry);
  });
}

function makeSegmentTransitionStyle(duration, easing, furtherStyles) {
  if (furtherStyles === void 0) {
    furtherStyles = {};
  }

  // Merge CSS transition necessary for chart animation with the ones provided by "segmentsStyle"
  var transition = ["stroke-dashoffset " + duration + "ms " + easing, furtherStyles.transition].filter(Boolean).join(',');
  return {
    transition: transition
  };
}

function renderLabelItem(option, props, value) {
  if (React.isValidElement(option)) {
    return React.cloneElement(option, props);
  }

  var label = value;

  if (typeof option === 'function') {
    label = option(props);

    if (React.isValidElement(label)) {
      return label;
    }
  }

  return React.createElement(ReactMinimalPieChartLabel, props, label);
}

function renderLabels(data, props) {
  var labelPosition = extractPercentage(props.radius, props.labelPosition);
  return data.map(function (dataEntry, index) {
    var startAngle = props.startAngle + dataEntry.startOffset;
    var halfAngle = startAngle + dataEntry.degrees / 2;
    var halfAngleRadians = degreesToRadians(halfAngle);
    var dx = Math.cos(halfAngleRadians) * labelPosition;
    var dy = Math.sin(halfAngleRadians) * labelPosition; // This object is passed as props to the "label" component

    var labelProps = {
      key: "label-" + (dataEntry.key || index),
      x: props.cx,
      y: props.cy,
      dx: dx,
      dy: dy,
      textAnchor: evaluateLabelTextAnchor({
        lineWidth: props.lineWidth,
        labelPosition: props.labelPosition,
        labelHorizontalShift: dx
      }),
      data: data,
      dataIndex: index,
      color: dataEntry.color,
      style: props.labelStyle
    };
    return renderLabelItem(props.label, labelProps, dataEntry.value);
  });
}

function renderSegments(data, props, hide) {
  var style = props.segmentsStyle;
  var reveal;

  if (props.animate) {
    var transitionStyle = makeSegmentTransitionStyle(props.animationDuration, props.animationEasing, style);
    style = Object.assign({}, style, transitionStyle);
  } // Hide/reveal the segment?


  if (hide === true) {
    reveal = 0;
  } else if (typeof props.reveal === 'number') {
    reveal = props.reveal;
  } else if (hide === false) {
    reveal = 100;
  }

  var paths = data.map(function (dataEntry, index) {
    var startAngle = props.startAngle + dataEntry.startOffset;
    return React.createElement(ReactMinimalPieChartPath, {
      key: dataEntry.key || index,
      cx: props.cx,
      cy: props.cy,
      startAngle: startAngle,
      lengthAngle: dataEntry.degrees,
      radius: props.radius,
      lineWidth: extractPercentage(props.radius, props.lineWidth),
      reveal: reveal,
      title: dataEntry.title,
      style: Object.assign({}, style, dataEntry.style),
      stroke: dataEntry.color,
      strokeLinecap: props.rounded ? 'round' : undefined,
      fill: "none",
      onMouseOver: props.onMouseOver && function (e) {
        return props.onMouseOver(e, props.data, index);
      },
      onMouseOut: props.onMouseOut && function (e) {
        return props.onMouseOut(e, props.data, index);
      },
      onClick: props.onClick && function (e) {
        return props.onClick(e, props.data, index);
      }
    });
  });

  if (props.background) {
    paths.unshift(React.createElement(ReactMinimalPieChartPath, {
      key: "bg",
      cx: props.cx,
      cy: props.cy,
      startAngle: props.startAngle,
      lengthAngle: props.lengthAngle,
      radius: props.radius,
      lineWidth: extractPercentage(props.radius, props.lineWidth),
      stroke: props.background,
      strokeLinecap: props.rounded ? 'round' : undefined,
      fill: "none"
    }));
  }

  return paths;
}

var ReactMinimalPieChart =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(ReactMinimalPieChart, _Component);

  function ReactMinimalPieChart(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    if (_this.props.animate === true) {
      _this.hideSegments = true;
    }

    return _this;
  }

  var _proto = ReactMinimalPieChart.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this2 = this;

    if (this.props.animate === true && requestAnimationFrame) {
      this.initialAnimationTimerId = setTimeout(function () {
        _this2.initialAnimationTimerId = null;
        _this2.initialAnimationRAFId = requestAnimationFrame(function () {
          _this2.initialAnimationRAFId = null;

          _this2.startAnimation();
        });
      });
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    if (this.initialAnimationTimerId) {
      clearTimeout(this.initialAnimationTimerId);
    }

    if (this.initialAnimationRAFId) {
      cancelAnimationFrame(this.initialAnimationRAFId);
    }
  };

  _proto.startAnimation = function startAnimation() {
    this.hideSegments = false;
    this.forceUpdate();
  };

  _proto.render = function render() {
    if (this.props.data === undefined) {
      return null;
    }

    var extendedData = extendData(this.props);
    return React.createElement("div", {
      className: this.props.className,
      style: this.props.style
    }, React.createElement("svg", {
      viewBox: evaluateViewBoxSize(this.props.ratio, VIEWBOX_SIZE),
      width: "100%",
      height: "100%",
      style: {
        display: 'block'
      }
    }, renderSegments(extendedData, this.props, this.hideSegments), this.props.label && renderLabels(extendedData, this.props), this.props.injectSvg && this.props.injectSvg()), this.props.children);
  };

  return ReactMinimalPieChart;
}(Component);
ReactMinimalPieChart.displayName = 'ReactMinimalPieChart';
ReactMinimalPieChart.propTypes = {
  data: dataPropType,
  cx: PropTypes.number,
  cy: PropTypes.number,
  ratio: PropTypes.number,
  totalValue: PropTypes.number,
  className: PropTypes.string,
  style: stylePropType,
  segmentsStyle: stylePropType,
  background: PropTypes.string,
  startAngle: PropTypes.number,
  lengthAngle: PropTypes.number,
  paddingAngle: PropTypes.number,
  lineWidth: PropTypes.number,
  radius: PropTypes.number,
  rounded: PropTypes.bool,
  animate: PropTypes.bool,
  animationDuration: PropTypes.number,
  animationEasing: PropTypes.string,
  reveal: PropTypes.number,
  children: PropTypes.node,
  injectSvg: PropTypes.func,
  label: PropTypes.oneOfType([PropTypes.func, PropTypes.element, PropTypes.bool]),
  labelPosition: PropTypes.number,
  labelStyle: stylePropType,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func
};
ReactMinimalPieChart.defaultProps = {
  cx: VIEWBOX_HALF_SIZE,
  cy: VIEWBOX_HALF_SIZE,
  ratio: 1,
  startAngle: 0,
  lengthAngle: 360,
  paddingAngle: 0,
  lineWidth: 100,
  radius: VIEWBOX_HALF_SIZE,
  rounded: false,
  animate: false,
  animationDuration: 500,
  animationEasing: 'ease-out',
  label: false,
  labelPosition: 50,
  onMouseOver: undefined,
  onMouseOut: undefined,
  onClick: undefined
};

export default ReactMinimalPieChart;
//# sourceMappingURL=index.js.map
