import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { CustomError } from "../lib/utils";

interface CachedResponse {
  statusCode: number;
  body: unknown;
  timestamp: number;
}

// in-memory cache for idempotency keys
const idempotencyCache = new Map<string, CachedResponse>();
const pendingRequests = new Set<string>();

// time-to-live for cached responses (24 hours in ms)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// cleanup expired entries every hour
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of idempotencyCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        idempotencyCache.delete(key);
      }
    }
  },
  60 * 60 * 1000,
);

// idempotency middleware - prevents duplicate request processing
const idempotency = (req: Request, res: Response, next: NextFunction) => {
  const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];

  // skip non-mutating requests
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

  // skip if no idempotency key provided
  if (!idempotencyKey) {
    return next();
  }

  // create composite key with user context if available
  const userId = res.locals.user?.id || "anonymous";
  const cacheKey = `${userId}:${req.path}:${idempotencyKey}`;

  // check if request is already being processed
  if (pendingRequests.has(cacheKey)) {
    throw new CustomError(
      "Request is already being processed",
      status.CONFLICT,
      { idempotencyKey },
    );
  }

  // check for cached response
  const cachedResponse = idempotencyCache.get(cacheKey);
  if (cachedResponse) {
    // check if cache is still valid
    if (Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      res.setHeader("X-Idempotency-Replayed", "true");
      return res.status(cachedResponse.statusCode).json(cachedResponse.body);
    }
    // expired, remove from cache
    idempotencyCache.delete(cacheKey);
  }

  // mark request as pending
  pendingRequests.add(cacheKey);

  // intercept response to cache it
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    pendingRequests.delete(cacheKey);

    // only cache successful responses (2xx status codes)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(cacheKey, {
        statusCode: res.statusCode,
        body,
        timestamp: Date.now(),
      });
    }

    return originalJson(body);
  };

  // handle errors - remove from pending on error
  res.on("close", () => {
    pendingRequests.delete(cacheKey);
  });

  next();
};

export default idempotency;
