'use client';
import { useTransition } from 'react';

export default function GithubSignInButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      // Lógica de inicio de sesión eliminada
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      Iniciar sesión con GitHub
    </button>
  );
}
