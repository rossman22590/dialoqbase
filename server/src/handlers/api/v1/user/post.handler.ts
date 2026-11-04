import { FastifyReply, FastifyRequest } from "fastify";
import {
  ChatRequestBody,
  ForgotPasswordRequestBody,
  RegisterUserRequestBody,
  ResetPasswordRequestBody,
  UpdatePasswordRequestBody,
  UpdateUsernameRequestBody,
} from "./types";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { getSettings } from "../../../../utils/common";
import { sendPasswordResetEmail } from "../../../../utils/mailer";

export const userLoginHandler = async (
  request: FastifyRequest<ChatRequestBody>,
  reply: FastifyReply,
) => {
  const { username, password } = request.body;

  const user = await request.server.prisma.user.findFirst({
    where: {
      username: username,
    },
  });

  if (!user) {
    return reply.status(404).send({
      message: "User not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return reply.status(400).send({
      message: "Invalid password",
    });
  }

  if (user.isSuspended) {
    return reply.status(403).send({
      message: "User account is suspended",
    });
  }

  const token = request.server.jwt.sign({
    user_id: user.user_id,
    username: user.username,
    is_admin: user.isAdministrator,
  });

  return reply.status(200).send({
    message: "Login successful",
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    },
    to: "/",
  });
};

export const updateProfileHandler = async (
  request: FastifyRequest<UpdateUsernameRequestBody>,
  reply: FastifyReply,
) => {
  const user = request.user;

  const isUsernameTaken = await request.server.prisma.user.findFirst({
    where: {
      user_id: {
        not: user.user_id,
      },
      username: request.body.username,
    },
  });

  if (isUsernameTaken) {
    return reply.status(400).send({
      message: "Username is already taken",
    });
  }

  const isEmailTaken = await request.server.prisma.user.findFirst({
    where: {
      user_id: {
        not: user.user_id,
      },
      email: request.body.email,
    },
  });

  if (isEmailTaken) {
    return reply.status(400).send({
      message: "Email is already taken",
    });
  }

  await request.server.prisma.user.update({
    where: {
      user_id: user.user_id,
    },
    data: {
      username: request.body.username,
      email: request.body.email,
    },
  });

  return reply.status(200).send({
    message: "Information updated successfully",
    user: {
      user_id: user.user_id,
      username: request.body.username,
      email: request.body.email,
    }
  });
};

export const updatePasswordHandler = async (
  request: FastifyRequest<UpdatePasswordRequestBody>,
  reply: FastifyReply,
) => {
  const user = request.user;

  const userDetails = await request.server.prisma.user.findFirst({
    where: {
      user_id: user.user_id,
    },
  });

  if (!userDetails) {
    return reply.status(404).send({
      message: "User not found",
    });
  }

  // The user is already authenticated (JWT), so changing the password from
  // settings no longer requires the current password. If an old password is
  // still supplied, we validate it as a courtesy.
  if (request.body.oldPassword) {
    const isPasswordValid = await bcrypt.compare(
      request.body.oldPassword,
      userDetails.password,
    );

    if (!isPasswordValid) {
      return reply.status(400).send({
        message: "Invalid password",
      });
    }
  }

  const hashedPassword = await bcrypt.hash(request.body.newPassword, 12);

  await request.server.prisma.user.update({
    where: {
      user_id: user.user_id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return reply.status(200).send({
    message: "Password updated successfully",
  });
};

const hashResetToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

const getAppBaseUrl = (request: FastifyRequest): string => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, "");
  }

  const proto =
    (request.headers["x-forwarded-proto"] as string) ||
    request.protocol ||
    "http";
  const host = request.headers.host;
  return `${proto}://${host}`;
};

export const forgotPasswordHandler = async (
  request: FastifyRequest<ForgotPasswordRequestBody>,
  reply: FastifyReply,
) => {
  const prisma = request.server.prisma;
  const email = request.body.email?.trim();

  // Generic response so we never reveal whether an email is registered.
  const genericResponse = {
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };

  if (!email) {
    return reply.status(200).send(genericResponse);
  }

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user || user.isSuspended) {
    return reply.status(200).send(genericResponse);
  }

  // Generate a random token; store only its hash so a DB leak can't be replayed.
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any previous unused tokens for this user.
  await prisma.passwordResetToken.updateMany({
    where: { user_id: user.user_id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      user_id: user.user_id,
      token: tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${getAppBaseUrl(request)}/#/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (e) {
    request.log.error(e, "Failed to send password reset email");
    return reply.status(500).send({
      message: "Failed to send reset email. Please try again later.",
    });
  }

  return reply.status(200).send(genericResponse);
};

export const resetPasswordHandler = async (
  request: FastifyRequest<ResetPasswordRequestBody>,
  reply: FastifyReply,
) => {
  const prisma = request.server.prisma;
  const { token, newPassword } = request.body;

  if (!token || !newPassword) {
    return reply.status(400).send({
      message: "Invalid or expired reset link",
    });
  }

  const tokenHash = hashResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now()
  ) {
    return reply.status(400).send({
      message: "Invalid or expired reset link",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { user_id: resetToken.user_id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return reply.status(200).send({
    message: "Password reset successfully. You can now log in.",
  });
};

export const registerUserHandler = async (
  request: FastifyRequest<RegisterUserRequestBody>,
  reply: FastifyReply,
) => {
  try {
    const prisma = request.server.prisma;
    const settings = await getSettings(prisma);
    if (!settings) {
      return reply.status(400).send({
        message: "Settings not found",
      });
    }

    if (!settings.allowUserToRegister) {
      return reply.status(400).send({
        message:
          "User registration is not allowed. Please contact the administrator",
      });
    }

    const isUsernameTaken = await prisma.user.findFirst({
      where: {
        username: request.body.username,
      },
    });

    if (isUsernameTaken) {
      return reply.status(400).send({
        message: "Username is already taken",
      });
    }

    const isEmailTaken = await prisma.user.findFirst({
      where: {
        email: request.body.email,
      },
    });

    if (isEmailTaken) {
      return reply.status(400).send({
        message: "Email is already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(request.body.password, 12);

    const user = await prisma.user.create({
      data: {
        username: request.body.username,
        email: request.body.email,
        password: hashedPassword,
        credit: {
          create: {
            balance: 100,
          },
        },
      },
    });

    const token = request.server.jwt.sign({
      user_id: user.user_id,
      username: user.username,
      is_admin: user.isAdministrator,
    });

    return reply.status(200).send({
      message: "Welcome to the Dialoqbase",
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
      to: "/",
    });
  } catch (e) {
    console.log(e);
    return reply.status(500).send({
      message: "Error registering user",
    });
  }
};
