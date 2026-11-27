import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function google() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  async function credentials(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: "/",
      });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=credentials");
      throw e;
    }
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>
      {error && (
        <p className="error">
          No se pudo iniciar sesión. Verifica tus datos o tu dominio de correo.
        </p>
      )}
      <form action={google}>
        <button type="submit">Entrar con Google</button>
      </form>
      <form action={credentials}>
        <label>
          Correo <input name="email" type="email" required />
        </label>
        <label>
          Contraseña <input name="password" type="password" required />
        </label>
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
