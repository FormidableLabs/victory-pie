import merge from "lodash/object/merge";
import React, { Component, PropTypes } from "react";
import Radium from "radium";
import { VictoryLabel } from "victory-label";
import { Chart } from "victory-util";

@Radium
export default class SliceLabel extends Component {
  static propTypes = {
    labelComponent: PropTypes.any,
    positionFunction: PropTypes.func,
    slice: PropTypes.object,
    style: PropTypes.object
  };

  renderLabelComponent(props, position, label) {
    const component = props.labelComponent;
    const style = Chart.evaluateStyle(merge({padding: 0}, props.style, component.props.style));
    const children = component.props.children || label;
    const newProps = {
      x: component.props.x || position[0],
      y: component.props.y || position[1],
      data: props.slice.data, // Pass data for custom label component to access
      textAnchor: component.props.textAnchor || "start",
      verticalAnchor: component.props.verticalAnchor || "middle",
      style
    };
    return React.cloneElement(component, newProps, children);
  }

  renderVictoryLabel(props, position, label) {
    const style = Chart.evaluateStyle({ padding: 0, ...props.style });
    return (
      <VictoryLabel
        x={position[0]}
        y={position[1]}
        data={props.slice.data}
        style={style}
      >
        {label}
      </VictoryLabel>
    );
  }

  renderLabel(props) {
    const position = props.positionFunction(props.slice);
    const data = props.slice.data;
    const label = data.label ?
      `${Chart.evaluateProp(data.label)}` : `${data.x}`;
    return props.labelComponent ?
      this.renderLabelComponent(props, position, label) :
      this.renderVictoryLabel(props, position, label);
  }

  render() {
    return this.renderLabel(this.props);
  }
}
