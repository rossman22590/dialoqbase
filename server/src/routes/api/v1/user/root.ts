import { FastifyPluginAsync } from "fastify";
import {
  isRegisterationAllowedHandler,
  meHandler,
  registerUserHandler,
  updatePasswordHandler,
  updateProfileHandler,
  userLoginHandler,
  createNewApiKey,
  deleteApiKey,
  getAllApiKeyByUser,
  getUserCreditsHandler,
  getUserTransactionsHandler
} from "../../../../handlers/api/v1/user";
import {
  isRegisterationAllowedSchema,
  updatePasswordSchema,
  updateProfileSchema,
  userLoginSchema,
  userRegisterSchema,
} from "../../../../schema/api/v1/user";

import {
  createNewApiKeySchema,
  deleteApiKeySchema,
  getAllApiKeyByUserSchema
} from "../../../../schema/api/v1/user/api";

const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.post(
    "/login",
    {
      schema: userLoginSchema,
    },
    userLoginHandler
  );

  fastify.post(
    "/me",
    {
      schema: updateProfileSchema,
      onRequest: [fastify.authenticate],
    },
    updateProfileHandler
  );

  fastify.post(
    "/update-password",
    {
      schema: updatePasswordSchema,
      onRequest: [fastify.authenticate],
    },
    updatePasswordHandler
  );

  fastify.get(
    "/info",
    {
      schema: isRegisterationAllowedSchema,
    },
    isRegisterationAllowedHandler
  );

  fastify.post(
    "/register",
    {
      schema: userRegisterSchema,
    },
    registerUserHandler
  );

  fastify.get(
    "/is-admin",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["User"],
        summary: "Check if user is admin",
        headers: {
          type: "object",
          properties: {
            Authorization: { type: "string" },
          },
          required: ["Authorization"],
        },
      },
    },
    async (request, reply) => {
      reply.send({ is_admin: request.user.is_admin });
    }
  );

  fastify.get(
    "/me",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["User"],
        summary: "Get user profile",
        headers: {
          type: "object",
          properties: {
            Authorization: { type: "string" },
          },
          required: ["Authorization"],
        },
      },
    },
    meHandler
  );


  fastify.post(
    "/api-key",
    {
      onRequest: [fastify.authenticate],
      schema: createNewApiKeySchema,
    },
    createNewApiKey
  );

  fastify.get(
    "/api-key",
    {
      onRequest: [fastify.authenticate],
      schema: getAllApiKeyByUserSchema,
    },
    getAllApiKeyByUser
  );

  fastify.delete(
    "/api-key/:id",
    {
      onRequest: [fastify.authenticate],
      schema: deleteApiKeySchema,
    },
    deleteApiKey
  );

  fastify.get(
    "/credits",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["User"],
        summary: "Get user credits",
        response: {
          200: {
            type: "object",
            properties: {
              balance: { type: "number" },
            },
          },
        },
      },
    },
    getUserCreditsHandler
  );

  fastify.get(
    "/transactions",
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ["User"],
        summary: "Get user transactions",
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                amount: { type: "number" },
                type: { type: "string" },
                description: { type: "string" },
                metadata: {
                  type: ["object", "null"],
                  additionalProperties: true,
                },
                createdAt: { type: "string" },
              },
            },
          },
        },
      },
    },
    getUserTransactionsHandler
  );

  fastify.get(
    "/sso",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            sso_token: { type: "string" },
            next: { type: "string" },
          },
          required: ["sso_token"],
        },
      },
    },
    async (request, reply) => {
      const ssoToken = (request.query as any).sso_token;
      
      // Enforce referer check for extra protection
      const referer = request.headers.referer || null;
      const isAllowedSSOReferrer = (ref: string | null): boolean => {
        if (!ref) return true; // Allow if referer is missing or stripped by window.open
        try {
          const url = new URL(ref);
          const hostname = url.hostname;
          const port = url.port;

          if (hostname === "localhost" || hostname === "127.0.0.1") {
            return port === "3000" || port === "3001";
          }

          return hostname === "myapps.ai" || hostname.endsWith(".myapps.ai");
        } catch {
          return false;
        }
      };

      if (!isAllowedSSOReferrer(referer)) {
        request.log.warn("SSO rejected: invalid referer domain: %s", referer);
        return reply.status(403).send({ message: "Access denied: invalid origin" });
      }

      try {
        // 1. Verify and parse signature-based SSO token
        const parts = ssoToken.split(".");
        if (parts.length !== 2) {
          return reply.status(400).send({ message: "Invalid SSO token format" });
        }

        const [subject, signature] = parts;
        const subParts = subject.split(":");
        if (subParts.length !== 2) {
          return reply.status(400).send({ message: "Invalid SSO token subject" });
        }

        const [userIdStr, issuedAtStr] = subParts;
        const userId = parseInt(userIdStr, 10);
        const issuedAt = parseInt(issuedAtStr, 10);

        if (isNaN(userId) || isNaN(issuedAt)) {
          return reply.status(400).send({ message: "Invalid SSO token parameter types" });
        }

        // Check token age (expiration limit: 5 minutes)
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - issuedAt) > 300) {
          return reply.status(401).send({ message: "SSO token expired" });
        }

        // Verify HMAC-SHA256 signature
        const crypto = require("crypto");
        const secret = process.env.DB_SECRET_KEY || "59mjub2c9bpbe6mwrs5s57m2dq3cn6vs";
        const expectedSignature = crypto.createHmac("sha256", secret).update(subject).digest("hex");

        if (signature !== expectedSignature) {
          return reply.status(401).send({ message: "Invalid SSO token signature" });
        }

        // 2. Fetch the user from the database
        const user = await fastify.prisma.user.findUnique({
          where: { user_id: userId },
        });

        if (!user) {
          return reply.status(404).send({ message: "User not found" });
        }

        if (user.isSuspended) {
          return reply.status(403).send({ message: "User account is suspended" });
        }

        // 3. Generate JWT token
        const token = fastify.jwt.sign({
          user_id: user.user_id,
          username: user.username,
          is_admin: user.isAdministrator,
        });

        // 4. Set cookie 'db_token'
        const isProd = process.env.NODE_ENV === "production" || request.headers["x-forwarded-proto"] === "https";
        reply.setCookie("db_token", token, {
          path: "/",
          httpOnly: false, // Must be accessible by React JS frontend useCookie hook
          secure: isProd,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days (matches signup/login handler)
        });

        // 5. Redirect back to destination or root
        const nextParam = (request.query as any).next || "/";
        return reply.redirect(nextParam);
      } catch (err: any) {
        request.log.error(err, "SSO login error");
        return reply.status(500).send({ message: err.message || "Internal Server Error" });
      }
    }
  );
};

export default root;
