import type { Request, Response, NextFunction } from 'express';

export function requestLog(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    req._durationMs = Date.now() - start;
    req._statusCode = res.statusCode;
  });
  next();
}
