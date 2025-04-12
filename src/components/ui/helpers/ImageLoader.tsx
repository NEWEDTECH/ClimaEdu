'use client';

import { useState, useEffect, ReactNode, useRef } from "react";

import { addCacheBuster } from "@/shared/helpers/utils";

interface ImageLoaderProps {
  src?: string;
  alt?: string;
  loadingComponent: ReactNode;
  errorComponent: ReactNode;
  useCache?: boolean;
  successComponent: (src?: string, alt?: string) => ReactNode;
  retry?: () => Promise<string | null>;
}

export function ImageLoader({
  src,
  alt,
  loadingComponent,
  errorComponent,
  useCache = true,
  successComponent,
  retry,
}: ImageLoaderProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const processedSrcRef = useRef<string | undefined>(undefined);

  // Adicionando um useEffect para atualizar currentSrc quando src mudar
  // e aplicar cache busting se necessário
  useEffect(() => {
    if (!src) {
      setCurrentSrc(undefined);
      return;
    }
    
    // Aplicar cache busting se useCache for false
    const finalSrc = useCache ? src : addCacheBuster(src);
    setCurrentSrc(finalSrc);
    processedSrcRef.current = finalSrc;
  }, [src, useCache]);

  useEffect(() => {
    const loadImage = async (imageSrc: string | undefined) => {
      if (!imageSrc) {
        setLoading(false);
        setError(true);
        return;
      }

      setLoading(true);
      setError(false);

      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setLoading(false);
      };
      img.onerror = async () => {
        setLoading(false);
        setError(true);

        if (retry) {
          try {
            setLoading(true); // Inicia o loading novamente para a nova tentativa
            const newSrc = await retry();
            if (newSrc) {
              setCurrentSrc(newSrc);
              setError(false); // Reset para o estado de erro
            } else {
              setError(true); // Mantém o erro se o retry falhar
            }
          } catch {
            setError(true);
          } finally {
            setLoading(false);
          }
        }
      };
    };

    loadImage(currentSrc);
  }, [currentSrc, retry]);

  if (loading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent}</>;
  }

  return <>{successComponent(currentSrc, alt)}</>;
}
