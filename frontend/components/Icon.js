import React from 'react';
import { icons } from './icons';

const Icon = ({ name, ...props }) => {
  const SvgComponent = icons[name];

  if (!SvgComponent) {
    return null;
  }

  return <SvgComponent {...props} />;
};

export default Icon;
