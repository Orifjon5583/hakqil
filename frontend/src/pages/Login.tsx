import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem("robbit_token", result.token);
      navigate("/");
    } catch {
      setError("Login yoki parol noto'g'ri");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded border border-line bg-white p-6">
        <h1 className="text-xl font-semibold">Robbit Monitor v1</h1>
        <div className="mt-6 space-y-4">
          <input className="h-11 w-full rounded border border-line px-3" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="h-11 w-full rounded border border-line px-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="text-sm text-coral">{error}</div>}
          <button className="h-11 w-full rounded bg-ink text-sm font-medium text-white">Login</button>
        </div>
      </form>
    </main>
  );
}

