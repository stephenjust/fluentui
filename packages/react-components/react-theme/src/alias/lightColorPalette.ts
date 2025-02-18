import { statusSharedColors, personaSharedColors, StatusSharedColors, PersonaSharedColors } from '../global/colors';
import { ColorPaletteTokens, GlobalSharedColors, PersonaColorPaletteTokens, StatusColorPaletteTokens } from '../types';

const statusColorPaletteTokens = (Object.keys(statusSharedColors) as Array<
  keyof Pick<GlobalSharedColors, StatusSharedColors>
>).reduce((acc, sharedColor) => {
  const color = sharedColor.slice(0, 1).toUpperCase() + sharedColor.slice(1);
  const sharedColorTokens = {
    [`colorPalette${color}Background1`]: statusSharedColors[sharedColor].tint60,
    [`colorPalette${color}Background2`]: statusSharedColors[sharedColor].tint40,
    [`colorPalette${color}Background3`]: statusSharedColors[sharedColor].primary,
    [`colorPalette${color}Foreground1`]: statusSharedColors[sharedColor].shade10,
    [`colorPalette${color}Foreground2`]: statusSharedColors[sharedColor].shade30,
    [`colorPalette${color}Foreground3`]: statusSharedColors[sharedColor].primary,
    [`colorPalette${color}BorderActive`]: statusSharedColors[sharedColor].primary,
    [`colorPalette${color}Border1`]: statusSharedColors[sharedColor].tint40,
    [`colorPalette${color}Border2`]: statusSharedColors[sharedColor].primary,
  };

  return { ...acc, ...sharedColorTokens };
}, {} as StatusColorPaletteTokens);

const personaColorPaletteTokens = (Object.keys(personaSharedColors) as Array<
  keyof Pick<GlobalSharedColors, PersonaSharedColors>
>).reduce((acc, sharedColor) => {
  const color = sharedColor.slice(0, 1).toUpperCase() + sharedColor.slice(1);
  const sharedColorTokens = {
    [`colorPalette${color}Background2`]: personaSharedColors[sharedColor].tint40,
    [`colorPalette${color}Foreground2`]: personaSharedColors[sharedColor].shade30,
    [`colorPalette${color}BorderActive`]: personaSharedColors[sharedColor].primary,
  };

  return { ...acc, ...sharedColorTokens };
}, {} as PersonaColorPaletteTokens);

export const colorPaletteTokens: ColorPaletteTokens = { ...statusColorPaletteTokens, ...personaColorPaletteTokens };
