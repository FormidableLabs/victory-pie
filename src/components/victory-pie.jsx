import _ from "lodash";
import React, { Component, PropTypes } from "react";
import Radium from "radium";
import d3Shape from "d3-shape";
import { PropTypes as CustomPropTypes, Style, Chart } from "victory-util";
import Slice from "./slice";
import SliceLabel from "./slice-label";
import { VictoryAnimation } from "victory-animation";

const defaultStyles = {
  data: {
    padding: 5,
    stroke: "white",
    strokeWidth: 1
  },
  labels: {
    padding: 10,
    fill: "black",
    strokeWidth: 0,
    stroke: "transparent",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: 10,
    textAnchor: "middle"
  }
};

const defaultData = [
  { x: "A", y: 1 },
  { x: "B", y: 2 },
  { x: "C", y: 3 },
  { x: "D", y: 1 },
  { x: "E", y: 2 }
];

const defaultColorScale = [
  "#75C776",
  "#39B6C5",
  "#78CCC4",
  "#62C3A4",
  "#64A8D1",
  "#8C95C8",
  "#3BAF74"
];

@Radium
export default class VictoryPie extends Component {
  static propTypes = {
    /**
     * The animate prop specifies props for victory-animation to use. If this prop is
     * not given, the pie chart will not tween between changing data / style props.
     * Large datasets might animate slowly due to the inherent limits of svg rendering.
     * @examples {velocity: 0.02, onEnd: () => alert("done!")}
     */
    animate: PropTypes.object,
    /**
     * The colorScale prop is an optional prop that defines the color scale the pie
     * will be created on. This prop should be given as an array of CSS colors, or as a string
     * corresponding to one of the built in color scales. VictoryPie will automatically assign
     * values from this color scale to the pie slices unless colors are explicitly provided in the
     * data object
     */
    colorScale: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.oneOf([
        "greyscale", "qualitative", "heatmap", "warm", "cool", "red", "green", "blue"
      ])
    ]),
    /**
     * Objects in the data array must be of the form { x: <x-val>, y: <y-val> }, where <x-val>
     * is the slice label (string or number), and <y-val> is the corresponding number
     * used to calculate arc length as a proportion of the pie's circumference.
     * If the data prop is omitted, the pie will render sample data.
     */
    data: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      y: PropTypes.number
    })),
    /**
     * The overall end angle of the pie in degrees. This prop is used in conjunction with
     * startAngle to create a pie that spans only a segment of a circle.
     */
    endAngle: PropTypes.number,
    /**
     * The height props specifies the height of the chart container element in pixels
     */
    height: CustomPropTypes.nonNegative,
    /**
     * When creating a donut chart, this prop determines the number of pixels between
     * the center of the chart and the inner edge of a donut. When this prop is set to zero
     * a regular pie chart is rendered.
     */
    innerRadius: CustomPropTypes.nonNegative,
    /**
     * This prop specifies the labels that will be applied to your data. This prop can be
     * passed in as an array of values, in the same order as your data, or as a function
     * to be applied to each data point. If this prop is not specified, the x value
     * of each data point will be used as a label.
     */
    labelComponent: PropTypes.element,
    /**
     * The padAngle prop determines the amount of separation between adjacent data slices
     * in number of degrees
     */
    padAngle: CustomPropTypes.nonNegative,
    /**
     * The padding props specifies the amount of padding in number of pixels between
     * the edge of the chart and any rendered child components. This prop can be given
     * as a number or as an object with padding specified for top, bottom, left
     * and right.
     */
    padding: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.shape({
        top: PropTypes.number,
        bottom: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number
      })
    ]),
    /**
     * The standalone prop determines whether VictoryPie should render as a standalone
     * svg, or in a g tag to be included in an svg
     */
    standalone: PropTypes.bool,
    /**
     * The overall start angle of the pie in degrees. This prop is used in conjunction with
     * endAngle to create a pie that spans only a segment of a circle.
     */
    startAngle: PropTypes.number,
    /**
     * The style prop specifies styles for your pie. VictoryPie relies on Radium,
     * so valid Radium style objects should work for this prop. Height, width, and
     * padding should be specified via the height, width, and padding props.
     * @examples {data: {stroke: "black"}, label: {fontSize: 10}}
     */
    style: PropTypes.shape({
      parent: PropTypes.object,
      data: PropTypes.object,
      labels: PropTypes.object
    }),
    /**
     * The width props specifies the width of the chart container element in pixels
     */
    width: CustomPropTypes.nonNegative
  }

  static defaultProps = {
    data: defaultData,
    endAngle: 360,
    height: 400,
    innerRadius: 0,
    padAngle: 0,
    padding: 30,
    colorScale: defaultColorScale,
    startAngle: 0,
    standalone: true,
    width: 400
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  getCalculatedValues(props) {
    this.style = Chart.getStyles(props, defaultStyles);
    this.padding = Chart.getPadding(props);
    this.radius = this.getRadius(props);
  }

  getRadius(props) {
    return Math.min(
      props.width - this.padding.left - this.padding.right,
      props.height - this.padding.top - this.padding.bottom
    ) / 2;
  }

  getLabelPosition(props) {
    // TODO: better label positioning
    const innerRadius = props.innerRadius ?
      props.innerRadius + this.style.labels.padding :
      this.style.labels.padding;
    return d3Shape.arc()
      .outerRadius(this.radius)
      .innerRadius(innerRadius);
  }

  renderSlice(slice, index, props) {
    const sliceFunction = d3Shape.arc()
      .outerRadius(this.radius)
      .innerRadius(props.innerRadius);
    const colorScale = Array.isArray(props.colorScale) ?
        props.colorScale : Style.getColorScale(props.colorScale);
    const fill = colorScale[index % colorScale.length];
    const style = { ...this.style.data, ...{ fill } };
    return (
      <Slice
        slice={slice}
        pathFunction={sliceFunction}
        style={style}
      />
    );
  }

  renderSliceLabel(slice, props) {
    const labelPosition = this.getLabelPosition(props)
    return (
      <SliceLabel
        labelComponent={props.labelComponent}
        style={this.style.labels}
        positionFunction={labelPosition.centroid}
        slice={slice}
      />
    );
  }

  renderData(props) {
    const pie = d3Shape.pie()
      .sort(null)
      .startAngle(this.degreesToRadians(props.startAngle))
      .endAngle(this.degreesToRadians(props.endAngle))
      .padAngle(this.degreesToRadians(props.padAngle))
      .value((data) => { return data.y; });
    const slices = pie(props.data);
    const sliceComponents = slices.map((slice, index) => {
      return (
        <g key={index}>
          {this.renderSlice(slice, index, props)}
          {this.renderSliceLabel(slice, props)}
        </g>
      );
    });

    return (<g>{sliceComponents}</g>);
  }

  render() {
    if (this.props.animate) {
      // Do less work by having `VictoryAnimation` tween only values that
      // make sense to tween. In the future, allow customization of animated
      // prop whitelist/blacklist?
      const animateData = _.pick(this.props, [
        "data", "endAngle", "height", "innerRadius", "padAngle", "padding",
        "colorScale", "startAngle", "style", "width"
      ]);
      return (
        <VictoryAnimation {...this.props.animate} data={animateData}>
          {(props) => <VictoryPie {...this.props} {...props} animate={null}/>}
        </VictoryAnimation>
      );
    } else {
      this.getCalculatedValues(this.props);
    }
    const style = Chart.getStyles(this.props, defaultStyles);

    const xOffset = this.radius + this.padding.left;
    const yOffset = this.radius + this.padding.top;
    const group = (
      <g style={style.parent} transform={`translate(${xOffset}, ${yOffset})`}>
        {this.renderData(this.props)}
      </g>
    );

    return this.props.standalone ? <svg style={style.parent}>{group}</svg> : group;
  }
}
