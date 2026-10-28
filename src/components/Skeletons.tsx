const SkeletonBlock = ({ width = '100%', height = '20px', borderRadius = '6px', style = {} }: { width?: string; height?: string; borderRadius?: string; style?: React.CSSProperties }) => (
  <div style={{ width, height, borderRadius, backgroundColor: 'rgba(20, 26, 51, 0.08)', ...style }} />
);

export function PortfolioSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <div className="bg" />
      
      {/* Navigation Skeleton */}
      <nav className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5,6].map(i => <SkeletonBlock key={i} width="70px" height="24px" borderRadius="12px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />)}
        </div>
        <SkeletonBlock width="130px" height="32px" borderRadius="16px" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      </nav>

      {/* Paper Skeleton */}
      <main className="scroll-area">
        <div className="paper-stage">
          <div className="paper" style={{ minHeight: '80vh' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'clamp(64px, 12vw, 112px) 1fr', gap: 24, marginBottom: 40, alignItems: 'center' }}>
              <SkeletonBlock width="100%" height="100%" borderRadius="50%" style={{ aspectRatio: 1 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <SkeletonBlock width="80px" height="12px" />
                <SkeletonBlock width="60%" height="40px" />
                <SkeletonBlock width="40%" height="18px" />
                <SkeletonBlock width="55%" height="14px" />
              </div>
            </div>
            
            {/* Sections */}
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderTop: '1px solid var(--ln)', padding: '16px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
                <SkeletonBlock width="24px" height="16px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SkeletonBlock width="30%" height="20px" />
                  <SkeletonBlock width="60%" height="14px" />
                </div>
                <SkeletonBlock width="44px" height="44px" borderRadius="50%" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export function EditorSkeleton() {
  const darkBlock = { backgroundColor: 'rgba(255,255,255,0.06)' };
  
  return (
    <div className="editor-shell">
      <header className="editor-bar">
        <div className="editor-brand">
          <SkeletonBlock width="120px" height="24px" style={darkBlock} />
          <SkeletonBlock width="100px" height="14px" style={darkBlock} />
        </div>
        <div className="editor-actions">
          {[1,2,3,4,5,6].map(i => <SkeletonBlock key={i} width="80px" height="32px" borderRadius="8px" style={darkBlock} />)}
        </div>
      </header>
      
      <nav className="editor-tabs" style={{ gap: 8, paddingBottom: 12 }}>
        {[1,2,3,4,5,6,7].map(i => <SkeletonBlock key={i} width="90px" height="40px" borderRadius="8px 8px 0 0" style={darkBlock} />)}
      </nav>
      
      <main className="editor-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <SkeletonBlock width="200px" height="32px" style={darkBlock} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[1,2].map(i => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <SkeletonBlock width="32px" height="32px" style={darkBlock} />
                  <SkeletonBlock width="120px" height="20px" style={darkBlock} />
                </div>
                <SkeletonBlock width="100%" height="40px" borderRadius="8px" style={darkBlock} />
                <SkeletonBlock width="100%" height="80px" borderRadius="8px" style={darkBlock} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}