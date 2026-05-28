"use server"
import db from "@/src/db";

export async function deleteUser(id: string) {
  return db.user.delete({
    where: { id },
  });
}
