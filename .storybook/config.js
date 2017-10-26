import { configure } from '@storybook/react';
import "loki/configure-react";

function loadStories() {
  require("../stories/victory-pie");
}

configure(loadStories, module);
