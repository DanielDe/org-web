interface ColorObject {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Interpolates between two colors.
// interpolationFactor should be a number between 0 and 1 representing how far from colorA to
// colorB it should interpolate.
export const interpolateColors = (
  colorA: ColorObject,
  colorB: ColorObject,
  interpolationFactor: number
): ColorObject => {
  return {
    r: (colorB.r - colorA.r) * interpolationFactor + colorA.r,
    g: (colorB.g - colorA.g) * interpolationFactor + colorA.g,
    b: (colorB.b - colorA.b) * interpolationFactor + colorA.b,
    a: (colorB.a - colorA.a) * interpolationFactor + colorA.a,
  };
};

export const rgbaObject = (r: number, g: number, b: number, a: number): ColorObject => {
  return { r, g, b, a };
};

export const rgbaString = (rgba: ColorObject) => {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
};
