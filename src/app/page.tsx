import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function databaseHostname(): string {
  try {
    return new URL(process.env.DATABASE_URL ?? "").hostname || "(desconocido)";
  } catch {
    return "(desconocido)";
  }
}

async function addNota(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/login");
  const texto = String(formData.get("texto") ?? "").trim();
  if (!texto) return;
  await db.nota.create({ data: { texto: texto.slice(0, 500) } });
  revalidatePath("/");
}

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [userCount, notas] = await Promise.all([
    db.user.count(),
    db.nota.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return (
    <main>
      <h1>Sandbox factory-light</h1>
      <p>
        Sesión: <strong>{session.user.email}</strong> ({session.user.role})
      </p>
      <form action={logout}>
        <button type="submit">Salir</button>
      </form>

      <section className="box">
        <h2>Entorno</h2>
        <ul>
          <li>VERCEL_ENV: {process.env.VERCEL_ENV ?? "(no definido)"}</li>
          <li>VERCEL_GIT_COMMIT_REF: {process.env.VERCEL_GIT_COMMIT_REF ?? "(no definido)"}</li>
          <li>Base de datos (host): {databaseHostname()}</li>
        </ul>
      </section>

      <section className="box">
        <h2>Datos</h2>
        <p>Usuarios: {userCount}</p>
        <ul>
          {notas.map((n) => (
            <li key={n.id}>
              {n.texto} <small>({n.createdAt.toISOString()})</small>
            </li>
          ))}
        </ul>
        <form action={addNota}>
          <input name="texto" placeholder="Nueva nota" required maxLength={500} />
          <button type="submit">Agregar nota</button>
        </form>
      </section>
    </main>
  );
}
