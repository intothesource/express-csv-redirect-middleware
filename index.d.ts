import { Request, Response, NextFunction } from 'express'

declare namespace csvRedirect {
    class MissingCsvError extends Error { }
    class UnsupportedInputError extends Error { }
}

interface CsvRedirectMiddleWareFunction {
    (req: Request, res: Response, next: NextFunction): void;
    readonly csv: string;
    readonly parsed: { [originalUrl: string]: [number, string] };
}

declare function csvRedirect(csv: string) {
    return <CsvRedirectMiddleWareFunction>function () { }
}

export = csvRedirect
