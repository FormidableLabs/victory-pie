import omit from "lodash/object/omit";
import merge from "lodash/object/merge";
import React, { Component, PropTypes } from "react";
import Radium from "radium";
import { Chart } from "victory-util";


@Radium
export default class Slice extends Component {
  static propTypes = {
    slice: PropTypes.object,
    pathFunction: PropTypes.func,
    style: PropTypes.object
  };

  renderSlice(props) {
    const dataStyles = omit(props.slice.data, ["x", "y", "label"]);
    const style = merge({}, props.style, dataStyles);
    return (
      <path
        d={props.pathFunction(props.slice)}
        style={Chart.evaluateStyle(style)}
      />
    );
  }

  render() {
    return this.renderSlice(this.props);
  }
}
