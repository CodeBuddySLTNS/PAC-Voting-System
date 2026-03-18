import { useCallback, useRef } from "react";

export const useIdempotencyKey = () => {
  const keyRef = useRef(crypto.randomUUID());

  const getKey = useCallback(() => keyRef.current, []);

  const resetKey = useCallback(() => {
    keyRef.current = crypto.randomUUID();
  }, []);

  return { getKey, resetKey };
};
