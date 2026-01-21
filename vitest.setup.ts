import { beforeAll } from "vitest";

beforeAll(() => {
  const globalScope: any = globalThis as any;

  if (typeof globalScope.Range !== "undefined") {
    const rangeProto = globalScope.Range.prototype as any;

    if (typeof rangeProto.getClientRects !== "function") {
      Object.defineProperty(rangeProto, "getClientRects", {
        value: () => [],
        writable: true,
      });
    }

    if (typeof rangeProto.getBoundingClientRect !== "function") {
      Object.defineProperty(rangeProto, "getBoundingClientRect", {
        value: () => ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
          toJSON() {
            return this;
          },
        }),
        writable: true,
      });
    }
  }

  if (typeof globalScope.HTMLElement !== "undefined") {
    const elementProto = globalScope.HTMLElement.prototype as any;

    if (typeof elementProto.scrollIntoView !== "function") {
      elementProto.scrollIntoView = () => {};
    }
  }
});
