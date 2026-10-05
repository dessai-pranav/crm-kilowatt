import test from "node:test";
import assert from "node:assert";
import { POST as postNote, DELETE as deleteNote } from "../src/app/api/customers/[id]/notes/route.ts";
import { prisma } from "../src/lib/prisma.ts";

test("Customer Notes API creates and deletes internal notes", async () => {
  const customer = await prisma.customer.findFirst();
  assert.ok(customer);

  // 1. Create Note
  const req = new Request(`http://localhost:3000/api/customers/${customer.id}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: "Test operator internal note regarding custom quote",
      author: "Test Lead",
    }),
  });

  const res = await postNote(req, { params: Promise.resolve({ id: customer.id }) });
  assert.strictEqual(res.status, 201);
  const noteData = await res.json();
  assert.strictEqual(noteData.author, "Test Lead");
  assert.strictEqual(noteData.content, "Test operator internal note regarding custom quote");

  // Verify in DB
  const dbNote = await prisma.customerNote.findUnique({
    where: { id: noteData.id },
  });
  assert.ok(dbNote);

  // 2. Delete Note
  const deleteReq = new Request(
    `http://localhost:3000/api/customers/${customer.id}/notes?noteId=${noteData.id}`,
    { method: "DELETE" }
  );

  const deleteRes = await deleteNote(deleteReq);
  assert.strictEqual(deleteRes.status, 200);

  const deletedCheck = await prisma.customerNote.findUnique({
    where: { id: noteData.id },
  });
  assert.strictEqual(deletedCheck, null);
});
