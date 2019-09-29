export const guessTargetID_baseColor = 1;
export const guessTargetID_mixColor = 2;
export const guessTargetID_mixAlpha = 3;
export const guessTargetID_mixedColor = 4;

function clamp255(n) {
  if (isNaN(n)) return 0;
  n = Math.round(n);
  if (n < 0) return 0;
  if (n > 255) return 255;
  return n;
}

function clampRatio(n) {
  if (isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function filterValidAlpha(arr) {
  const strictValid = arr.filter(c => !isNaN(c) && 0 <= c && c <= 1);
  if (strictValid.length !== 0) return strictValid;
  const probablyValid = arr.filter(c => !isNaN(c) && c !== 0 && c !== 1);
  if (probablyValid.length !== 0) return probablyValid;
  const maybeValid = arr.filter(c => !isNaN(c));
  if (probablyValid.length !== 0) return probablyValid;
  return arr;
}

export const guessColor = (colors, type) => {
  try {
    const { base, mix, mixAlpha, mixed } = colors;
    if (type === guessTargetID_baseColor) {
      colors.base = mix
        .map((mixChunk, i) => {
          const mixedChunk = mixed[i];
          return (mixedChunk - mixChunk * mixAlpha) / (1 - mixAlpha);
        })
        .map(clamp255);
    } else if (type === guessTargetID_mixColor) {
      colors.mix = base
        .map((baseChunk, i) => {
          const mixedChunk = mixed[i];
          return baseChunk + (mixedChunk - baseChunk) / mixAlpha;
        })
        .map(clamp255);
    } else if (type === guessTargetID_mixAlpha) {
      const resultArray = filterValidAlpha(
        base.slice(0, 3).map((baseChunk, i) => {
          const mixChunk = mix[i];
          const mixedChunk = mixed[i];
          return (mixedChunk - baseChunk) / (mixChunk - baseChunk);
        })
      ).map(clampRatio);
      if (resultArray.length !== 0) {
        colors.mixAlpha =
          resultArray.reduce((a, c) => a + c, 0) / resultArray.length;
      }
    } else if (type === guessTargetID_mixedColor) {
      colors.mixed = base
        .map((baseChunk, i) => {
          const mixChunk = mix[i];
          return baseChunk + (mixChunk - baseChunk) * mixAlpha;
        })
        .map(clamp255);
    }
  } catch (e) {
    console.log(e);
  }
  return colors;
};
