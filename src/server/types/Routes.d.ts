import type { RouterTypes } from "bun";

export declare type Routes = {
  [K in string]: RouterTypes.RouteValue<K>;
};
