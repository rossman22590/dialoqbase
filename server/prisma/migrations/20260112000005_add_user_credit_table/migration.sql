-- CreateTable
CREATE TABLE IF NOT EXISTS "UserCredit" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "balance" DECIMAL(10,4) NOT NULL DEFAULT 500.0000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserCredit_user_id_key" ON "UserCredit"("user_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'UserCredit_user_id_fkey'
    ) THEN
        ALTER TABLE "UserCredit"
            ADD CONSTRAINT "UserCredit_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "User"("user_id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
