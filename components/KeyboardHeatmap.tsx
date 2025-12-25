'use client';

interface KeyboardHeatmapProps {
  keyErrors: Record<string, number>;
}

const keyboardRows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const specialKeys = [' '];

export default function KeyboardHeatmap({ keyErrors }: KeyboardHeatmapProps) {
  const maxErrors = Math.max(...Object.values(keyErrors), 1);
  
  const getKeyColor = (key: string) => {
    const errors = keyErrors[key.toLowerCase()] || 0;
    if (errors === 0) return 'bg-bg-sub border-border';
    
    const intensity = Math.min(errors / maxErrors, 1);
    if (intensity < 0.3) return 'bg-yellow-900/30 border-yellow-700/50';
    if (intensity < 0.6) return 'bg-orange-900/40 border-orange-700/50';
    return 'bg-red-900/50 border-red-700/50';
  };

  const getKeyTextColor = (key: string) => {
    const errors = keyErrors[key.toLowerCase()] || 0;
    if (errors === 0) return 'text-sub';
    return 'text-text';
  };

  return (
    <div className="bg-bg-sub rounded-xl p-6 border border-border">
      <h3 className="text-lg text-text mb-4">keyboard heatmap</h3>
      <p className="text-sm text-sub mb-4">keys you often mistype are highlighted</p>
      
      <div className="flex flex-col gap-1.5 items-center">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5" style={{ marginLeft: rowIndex * 16 }}>
            {row.map((key) => (
              <div
                key={key}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border text-sm font-mono transition-colors
                  ${getKeyColor(key)} ${getKeyTextColor(key)}`}
              >
                {key}
                {keyErrors[key.toLowerCase()] > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs text-error font-medium">
                    {keyErrors[key.toLowerCase()]}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
        
        {/* Space bar */}
        <div className="flex gap-1.5 mt-1">
          <div
            className={`w-64 h-10 rounded-lg flex items-center justify-center border text-sm font-mono
              ${getKeyColor(' ')} ${getKeyTextColor(' ')}`}
          >
            space
            {keyErrors[' '] > 0 && (
              <span className="ml-2 text-xs text-error">({keyErrors[' ']})</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 justify-center text-xs text-sub">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-bg-sub border border-border" />
          <span>no errors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-900/30 border border-yellow-700/50" />
          <span>few</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-900/40 border border-orange-700/50" />
          <span>some</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-900/50 border border-red-700/50" />
          <span>many</span>
        </div>
      </div>
    </div>
  );
}
