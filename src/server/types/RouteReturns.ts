export type RouteReturn = { route: string; handler: (req: Request) => Response | Promise<Response> };
export type RouteReturns = RouteReturn[] | false;
