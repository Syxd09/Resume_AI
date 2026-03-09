import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Custom visual definitions for all 15 templates
  const visuals: Record<string, { bg: string, primary: string, secondary: string, layout: 'classic' | 'sidebar' | 'header' | 'split' | 'minimal' }> = {
    professional: { bg: '#ffffff', primary: '#2563eb', secondary: '#94a3b8', layout: 'classic' },
    modern: { bg: '#f8fafc', primary: '#10b981', secondary: '#cbd5e1', layout: 'sidebar' },
    minimal: { bg: '#ffffff', primary: '#0f172a', secondary: '#e2e8f0', layout: 'minimal' },
    executive: { bg: '#ffffff', primary: '#1e3a8a', secondary: '#64748b', layout: 'header' },
    creative: { bg: '#fffbeb', primary: '#f59e0b', secondary: '#fcd34d', layout: 'split' },
    tech: { bg: '#0f172a', primary: '#38bdf8', secondary: '#334155', layout: 'classic' },
    startup: { bg: '#ffffff', primary: '#f43f5e', secondary: '#fda4af', layout: 'sidebar' },
    academic: { bg: '#ffffff', primary: '#475569', secondary: '#e2e8f0', layout: 'classic' },
    classic: { bg: '#fefce8', primary: '#854d0e', secondary: '#d1d5db', layout: 'header' },
    bold: { bg: '#000000', primary: '#ec4899', secondary: '#3f3f46', layout: 'split' },
    elegant: { bg: '#fafafa', primary: '#6366f1', secondary: '#a5b4fc', layout: 'minimal' },
    compact: { bg: '#ffffff', primary: '#0ea5e9', secondary: '#cbd5e1', layout: 'split' },
    datascientist: { bg: '#f0fdf4', primary: '#22c55e', secondary: '#bbf7d0', layout: 'sidebar' },
    designer: { bg: '#faf5ff', primary: '#a855f7', secondary: '#e9d5ff', layout: 'split' },
    finance: { bg: '#ffffff', primary: '#0f766e', secondary: '#ccfbf1', layout: 'classic' },
  };

  const v = visuals[id] || visuals.professional;

  // Generate SVG blocks based on layout style
  let svgContent = '';

  if (v.layout === 'classic') {
    svgContent = `
      <rect x="20" y="20" width="170" height="25" fill="${v.primary}" rx="4"/>
      <rect x="20" y="55" width="220" height="10" fill="${v.secondary}" rx="2"/>
      <rect x="20" y="75" width="220" height="40" fill="${v.secondary}" opacity="0.5" rx="2"/>
      <rect x="20" y="130" width="100" height="15" fill="${v.primary}" rx="2"/>
      <rect x="20" y="155" width="220" height="8" fill="${v.secondary}" rx="2"/>
      <rect x="20" y="170" width="200" height="8" fill="${v.secondary}" rx="2"/>
      <rect x="20" y="185" width="210" height="8" fill="${v.secondary}" rx="2"/>
      <rect x="20" y="215" width="100" height="15" fill="${v.primary}" rx="2"/>
      <rect x="20" y="240" width="220" height="8" fill="${v.secondary}" rx="2"/>
      <rect x="20" y="255" width="200" height="8" fill="${v.secondary}" rx="2"/>
    `;
  } else if (v.layout === 'sidebar') {
    svgContent = `
      <rect x="0" y="0" width="80" height="360" fill="${v.primary}" opacity="0.1"/>
      <rect x="15" y="25" width="50" height="50" fill="${v.primary}" rx="25"/>
      <rect x="15" y="90" width="40" height="8" fill="${v.primary}" rx="2"/>
      <rect x="15" y="105" width="50" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="15" y="115" width="45" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="15" y="145" width="40" height="8" fill="${v.primary}" rx="2"/>
      <rect x="15" y="160" width="30" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="15" y="170" width="35" height="6" fill="${v.secondary}" rx="2"/>
      
      <rect x="100" y="25" width="130" height="20" fill="${v.primary}" rx="3"/>
      <rect x="100" y="55" width="140" height="7" fill="${v.secondary}" rx="2"/>
      <rect x="100" y="85" width="80" height="12" fill="${v.primary}" opacity="0.7" rx="2"/>
      <rect x="100" y="105" width="140" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="100" y="115" width="130" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="100" y="125" width="135" height="6" fill="${v.secondary}" rx="2"/>
    `;
  } else if (v.layout === 'header') {
    svgContent = `
      <rect x="0" y="0" width="260" height="80" fill="${v.primary}"/>
      <rect x="80" y="20" width="100" height="20" fill="#ffffff" rx="3"/>
      <rect x="60" y="50" width="140" height="8" fill="#ffffff" opacity="0.7" rx="2"/>
      
      <rect x="25" y="100" width="210" height="35" fill="${v.secondary}" opacity="0.3" rx="3"/>
      
      <rect x="25" y="150" width="80" height="12" fill="${v.primary}" rx="2"/>
      <rect x="25" y="170" width="210" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="25" y="180" width="190" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="25" y="190" width="200" height="6" fill="${v.secondary}" rx="2"/>
      
      <rect x="25" y="220" width="80" height="12" fill="${v.primary}" rx="2"/>
      <rect x="25" y="240" width="210" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="25" y="250" width="190" height="6" fill="${v.secondary}" rx="2"/>
    `;
  } else if (v.layout === 'split') {
    svgContent = `
      <rect x="15" y="20" width="120" height="25" fill="${v.primary}" rx="3"/>
      <rect x="15" y="55" width="230" height="8" fill="${v.secondary}" rx="2"/>
      
      <line x1="130" y1="80" x2="130" y2="340" stroke="${v.secondary}" stroke-width="2" opacity="0.3"/>
      
      <rect x="15" y="90" width="70" height="12" fill="${v.primary}" rx="2"/>
      <rect x="15" y="110" width="95" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="15" y="120" width="85" height="6" fill="${v.secondary}" rx="2"/>
      
      <rect x="145" y="90" width="70" height="12" fill="${v.primary}" rx="2"/>
      <rect x="145" y="110" width="100" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="145" y="120" width="90" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="145" y="130" width="95" height="6" fill="${v.secondary}" rx="2"/>
    `;
  } else {
    // Minimal
    svgContent = `
      <rect x="100" y="30" width="60" height="20" fill="${v.primary}" rx="2"/>
      <rect x="60" y="60" width="140" height="6" fill="${v.secondary}" rx="2"/>
      
      <rect x="30" y="100" width="200" height="1" fill="${v.secondary}"/>
      
      <rect x="105" y="115" width="50" height="10" fill="${v.primary}" rx="2"/>
      <rect x="40" y="140" width="180" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="50" y="152" width="160" height="6" fill="${v.secondary}" rx="2"/>
      
      <rect x="30" y="180" width="200" height="1" fill="${v.secondary}"/>
      
      <rect x="105" y="195" width="50" height="10" fill="${v.primary}" rx="2"/>
      <rect x="40" y="220" width="180" height="6" fill="${v.secondary}" rx="2"/>
      <rect x="50" y="232" width="160" height="6" fill="${v.secondary}" rx="2"/>
    `;
  }

  const svg = `<svg width="260" height="360" viewBox="0 0 260 360" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="260" height="360" fill="${v.bg}"/>
    ${svgContent}
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
