"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/createEmotionCache";

interface AppRouterCacheProviderProps {
  children: React.ReactNode;
}

export default function AppRouterCacheProvider({
  children,
}: AppRouterCacheProviderProps) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = createEmotionCache();
    cache.compat = true;

    type InsertFn = typeof cache.insert;
    const prevInsert: InsertFn = cache.insert;
    let inserted: string[] = [];

    cache.insert = function insertEmotion(
      selector: Parameters<InsertFn>[0],
      serialized: Parameters<InsertFn>[1],
      sheet: Parameters<InsertFn>[2],
      shouldCache?: Parameters<InsertFn>[3],
    ) {
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      const cacheFlag = shouldCache ?? true;
      return prevInsert.call(cache, selector, serialized, sheet, cacheFlag);
    };

    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache, flush } as const;
  });

  useServerInsertedHTML(() => {
    const names = flush();

    if (names.length === 0) {
      return null;
    }

    let styles = "";
    for (const name of names) {
      const style = cache.inserted[name];
      if (typeof style === "string") {
        styles += style;
      }
    }

    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
