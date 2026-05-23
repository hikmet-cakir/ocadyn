import { useEffect, useState } from 'react';

export function useStoreHydrated(check: () => boolean, onFinish: () => () => void) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (check()) {
      finish();
      return;
    }
    return onFinish();
  }, [check, onFinish]);

  return hydrated;
}
