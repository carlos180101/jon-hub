"use server";
export async function verificarPassword(password: string) {
  return password === process.env.ADMIN_PASSWORD || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
}
