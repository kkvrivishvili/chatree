import AuthTabs from '@/features/auth/components/auth-tabs';

export const metadata = {
  title: 'Autenticación',
  description: 'Página de autenticación para ingresar o registrarse.'
};

async function getGitHubStars(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.github.com/repos/kkvrivishvili/chatree',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        next: {
          revalidate: 60, // revalidate every 60 seconds
        },
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.stargazers_count ?? 0;
  } catch (error) {
    return 0;
  }
}

export default async function AuthPage() {
  const stars = await getGitHubStars();
  return <AuthTabs stars={stars} />;
}
