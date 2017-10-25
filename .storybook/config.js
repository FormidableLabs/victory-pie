import { configure } from '@storybook/react';

function loadStories() {
  require("../stories/victory-pie");
}

configure(loadStories, module);
