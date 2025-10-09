import { auth } from "@/lib/firebase";

export async function getIdToken(): Promise<string> {
  const current = auth.currentUser;
  if (current) return current.getIdToken();

  const user = await new Promise<NonNullable<typeof auth.currentUser>>((resolve, reject) => {
    const unsub = auth.onAuthStateChanged(u => {
      unsub();
      if (u) resolve(u);
      else reject(new Error("Not signed in"));
    });
  });
  return user.getIdToken();
}