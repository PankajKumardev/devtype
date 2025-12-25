import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'DevType - Master Your Coding Speed';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#323437',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: '#e2b714',
              marginBottom: 20,
            }}
          >
            devtype
          </h1>
          <p
            style={{
              fontSize: 36,
              color: '#d1d0c5',
              marginBottom: 40,
            }}
          >
            Master Your Coding Speed
          </p>
          <div
            style={{
              display: 'flex',
              gap: 20,
            }}
          >
            {['typescript', 'python', 'rust', 'go', 'java', 'c++'].map((lang) => (
              <span
                key={lang}
                style={{
                  fontSize: 24,
                  color: '#646669',
                  padding: '8px 16px',
                  backgroundColor: '#2c2e31',
                  borderRadius: 8,
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
