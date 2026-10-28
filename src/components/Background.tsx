export function Background() {
  return (
    <>
      <div className="bg" aria-hidden="true" />
      <div className="stars" aria-hidden="true" />
      <div className="floor" aria-hidden="true" />
      <div className="floats" aria-hidden="true">
        <i className="fl" style={{ left: '-140px', top: '18vh', width: 200, height: 130, ['--r' as any]: '-8deg' }} />
        <i className="fl" style={{ right: '-140px', top: '12vh', width: 170, height: 240, ['--r' as any]: '10deg', animationDelay: '-3s' }} />
        <i className="fl" style={{ right: '-160px', top: '62vh', width: 220, height: 140, ['--r' as any]: '6deg', animationDelay: '-5s' }} />
        <i className="fl" style={{ left: '-150px', top: '78vh', width: 180, height: 180, borderRadius: '50%', ['--r' as any]: '-12deg', animationDelay: '-2s' }} />
      </div>
    </>
  );
}