-- CreateTable
CREATE TABLE "Subtask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "taskId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "Subtask_taskId_tenantId_fkey" FOREIGN KEY ("taskId", "tenantId") REFERENCES "Task" ("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subtask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Subtask_taskId_tenantId_idx" ON "Subtask"("taskId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_tenantId_key" ON "Task"("id", "tenantId");
