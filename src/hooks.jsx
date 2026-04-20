function useDwell(ms) {
  const ref = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [dwelling, setDwelling] = React.useState(false);
  const startRef = React.useRef(null);
  const rafRef = React.useRef(null);

  const cancel = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
    setDwelling(false);
  }, []);

  const tick = React.useCallback((now) => {
    if (!startRef.current) startRef.current = now;
    const elapsed = now - startRef.current;
    const p = Math.min(elapsed / ms, 1);
    setProgress(p);
    if (p < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setDwelling(true);
      rafRef.current = null;
    }
  }, [ms]);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onEnter = () => { rafRef.current = requestAnimationFrame(tick); };
    const onLeave = cancel;
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      cancel();
    };
  }, [tick, cancel]);

  return { ref, dwelling, progress };
}

Object.assign(window, { useDwell });
