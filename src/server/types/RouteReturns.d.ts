export declare type RouteReturn = { route: string; handler: (req: Request) => Response | Promise<Response> };
export declare type RouteReturns = RouteReturn[] | false;
