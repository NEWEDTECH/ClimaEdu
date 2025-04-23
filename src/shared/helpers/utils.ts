export const addCacheBuster = (urlString: string): string => {
    try {
      const url = new URL(urlString);
      url.searchParams.set("t", new Date().getTime().toString());
      return url.toString();
    } catch {
      return urlString;
    }
  };