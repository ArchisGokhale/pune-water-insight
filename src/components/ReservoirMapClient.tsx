import { useEffect, useState, type ComponentType } from "react";

/**
 * Client-only wrapper around ReservoirMap. We avoid statically importing
 * ReservoirMap (which pulls in react-leaflet/@react-leaflet/core, both of
 * which touch `window` at module init) so the SSR bundle never reaches them.
 */
export default function ReservoirMapClient() {
  const [Comp, setComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./ReservoirMap").then((m) => {
      if (!cancelled) setComp(() => m.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Comp) {
    return (
      <div className="glass flex h-[480px] items-center justify-center rounded-3xl text-sm text-muted-foreground">
        Loading interactive map…
      </div>
    );
  }
  return <Comp />;
}
