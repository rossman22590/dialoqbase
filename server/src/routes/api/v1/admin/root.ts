import { FastifyPluginAsync } from "fastify";
import {
  dialoqbaseSettingsHandler,
  updateDialoqbaseSettingsHandler,
  getAllUsersHandler,
  registerUserByAdminHandler,
  resetUserPasswordByAdminHandler,
  fetchModelFromInputedUrlHandler,
  getAllModelsHandler,
  saveModelFromInputedUrlHandler,
  deleteModelHandler,
  hideModelHandler,
  saveEmbedddingModelFromInputedUrlHandler,
  updateDialoqbaseRAGSettingsHandler,
  adminDeleteUserHandler,
  updateUserCreditsHandler,
  adminOverviewHandler,
  adminUsageHandler,
  adminUsersHandler,
  adminSetUserSuspendedHandler,
  adminSetUserAdminHandler,
  adminBotsHandler,
  adminTransactionsHandler,
  adminQueueHandler,
  adminQueueJobsHandler,
  adminQueueJobActionHandler,
  adminQueueActionHandler,
} from "../../../../handlers/api/v1/admin";
import {
  dialoqbaseSettingsSchema,
  updateDialoqbaseSettingsSchema,
  getAllUsersSchema,
  registerUserByAdminSchema,
  resetUserPasswordByAdminSchema,
  updateDialoqbaseRAGSettings,
  deleteUserSchema,
  updateUserCreditsSchema
} from "../../../../schema/api/v1/admin";

import {
  fetchModelFromInputedUrlSchema,
  getAllModelsSchema,
  saveModelFromInputedUrlSchema,
  toogleModelSchema,
  saveEmbeddingModelSchema,
} from "../../../../schema/api/v1/admin/model";

const root: FastifyPluginAsync = async (fastify, _): Promise<void> => {
  fastify.get(
    "/dialoqbase-settings",
    {
      schema: dialoqbaseSettingsSchema,
      onRequest: [fastify.authenticate],
    },
    dialoqbaseSettingsHandler
  );

  fastify.post(
    "/dialoqbase-settings",
    {
      schema: updateDialoqbaseSettingsSchema,
      onRequest: [fastify.authenticate],
    },
    updateDialoqbaseSettingsHandler
  );

  fastify.post(
    "/rag-settings",
    {
      schema: updateDialoqbaseRAGSettings,
      onRequest: [fastify.authenticate],
    },
    updateDialoqbaseRAGSettingsHandler
  );

  fastify.get(
    "/users",
    {
      schema: getAllUsersSchema,
      onRequest: [fastify.authenticate],
    },
    getAllUsersHandler
  );

  fastify.post(
    "/register-user",
    {
      schema: registerUserByAdminSchema,
      onRequest: [fastify.authenticateAdmin],
    },
    registerUserByAdminHandler
  );

  fastify.post(
    "/reset-user-password",
    {
      schema: resetUserPasswordByAdminSchema,
      onRequest: [fastify.authenticateAdmin],
    },
    resetUserPasswordByAdminHandler
  );

  fastify.get(
    "/models",
    {
      schema: getAllModelsSchema,
      onRequest: [fastify.authenticate],
    },
    getAllModelsHandler
  );

  fastify.post(
    "/models",
    {
      schema: saveModelFromInputedUrlSchema,
      onRequest: [fastify.authenticate],
    },
    saveModelFromInputedUrlHandler
  );

  fastify.post(
    "/models/fetch",
    {
      schema: fetchModelFromInputedUrlSchema,
      onRequest: [fastify.authenticate],
    },
    fetchModelFromInputedUrlHandler
  );


  fastify.post(
    "/models/delete",
    {
      schema: toogleModelSchema,
      onRequest: [fastify.authenticate],
    },
    deleteModelHandler
  );


  fastify.post(
    "/models/hide",
    {
      schema: toogleModelSchema,
      onRequest: [fastify.authenticate],
    },
    hideModelHandler
  );

  fastify.post(
    "/models/embedding",
    {
      schema: saveEmbeddingModelSchema,
      onRequest: [fastify.authenticate],
    },
    saveEmbedddingModelFromInputedUrlHandler
  );

  // api for admin to delete user
  fastify.delete(
    "/user/delete",
    {
      schema: deleteUserSchema,
      onRequest: [fastify.authenticateAdmin],
    },
    adminDeleteUserHandler
  );

  fastify.post(
    "/user-credits",
    {
      schema: updateUserCreditsSchema,
      onRequest: [fastify.authenticateAdmin],
    },
    updateUserCreditsHandler
  );

  // Oversight panel (admin only)
  const adminOnly = { schema: { tags: ["Admin"] }, onRequest: [fastify.authenticateAdmin] };
  const adminBody = (properties: Record<string, any>, required: string[]) => ({
    schema: { tags: ["Admin"], body: { type: "object", properties, required } },
    onRequest: [fastify.authenticateAdmin],
  });

  fastify.get("/oversight/overview", adminOnly, adminOverviewHandler);
  fastify.get("/oversight/usage", adminOnly, adminUsageHandler);
  fastify.get("/oversight/users", adminOnly, adminUsersHandler);
  fastify.post(
    "/oversight/users/suspend",
    adminBody({ user_id: { type: "number" }, suspended: { type: "boolean" } }, ["user_id", "suspended"]),
    adminSetUserSuspendedHandler
  );
  fastify.post(
    "/oversight/users/admin",
    adminBody({ user_id: { type: "number" }, is_admin: { type: "boolean" } }, ["user_id", "is_admin"]),
    adminSetUserAdminHandler
  );
  fastify.get("/oversight/bots", adminOnly, adminBotsHandler);
  fastify.get("/oversight/transactions", adminOnly, adminTransactionsHandler);
  fastify.get("/oversight/queue", adminOnly, adminQueueHandler);
  fastify.get("/oversight/queue/jobs", adminOnly, adminQueueJobsHandler);
  fastify.post(
    "/oversight/queue/jobs/action",
    adminBody(
      { job_id: { type: "string" }, action: { type: "string", enum: ["retry", "remove"] } },
      ["job_id", "action"]
    ),
    adminQueueJobActionHandler
  );
  fastify.post(
    "/oversight/queue/action",
    adminBody(
      {
        action: { type: "string", enum: ["pause", "resume", "clean"] },
        status: { type: "string", enum: ["completed", "failed"] },
      },
      ["action"]
    ),
    adminQueueActionHandler
  );
};

export default root;
