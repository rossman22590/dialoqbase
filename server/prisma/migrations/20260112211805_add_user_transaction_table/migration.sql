-- CreateTable
CREATE TABLE "UserTransaction" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,4) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSON DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTransaction" ADD CONSTRAINT "UserTransaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
