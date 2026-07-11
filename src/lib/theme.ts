export const adjustColorBrightness = (hex: string, percent: number): string => {
  // strip hash if present
  const rawHex = hex.replace("#", "");
  let num = parseInt(rawHex, 16);
  if (isNaN(num)) return hex;

  let R = (num >> 16) + Math.round(2.55 * percent);
  let G = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  let B = (num & 0x0000FF) + Math.round(2.55 * percent);

  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  
  R = clamp(R);
  G = clamp(G);
  B = clamp(B);

  return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
};

export const applyThemeSettings = (settings: any) => {
  if (!settings) return;

  if (settings.primary_color) {
    document.documentElement.style.setProperty('--primary-color', settings.primary_color);
    try {
      const hoverColor = adjustColorBrightness(settings.primary_color, -12);
      document.documentElement.style.setProperty('--primary-hover', hoverColor);
    } catch (e) {
      document.documentElement.style.setProperty('--primary-hover', settings.primary_color);
    }
  } else {
    document.documentElement.style.setProperty('--primary-color', '#6366f1');
    document.documentElement.style.setProperty('--primary-hover', '#4f46e5');
  }

  if (settings.accent_color) {
    document.documentElement.style.setProperty('--accent-color', settings.accent_color);
  } else {
    document.documentElement.style.setProperty('--accent-color', '#10b981');
  }

  if (settings.font_main) {
    document.documentElement.style.setProperty('--font-main', settings.font_main);
  } else {
    document.documentElement.style.setProperty('--font-main', "'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif");
  }
};
