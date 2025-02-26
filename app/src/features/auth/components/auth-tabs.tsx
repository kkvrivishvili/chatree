'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserAuthForm from './user-auth-form';
import UserRegisterForm from './user-register-form';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { StarIcon } from 'lucide-react';
import Link from 'next/link';

export default function AuthTabs({ stars }: { stars: number }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('signin');
  const showRegistrationSuccess = searchParams.get('registered') === 'true';

  useEffect(() => {
    if (showRegistrationSuccess) {
      const toast = require('sonner').toast;
      toast.success('¡Gracias por registrarte! Por favor, inicia sesión.');
    }
  }, [showRegistrationSuccess]);

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Logo
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;This library helps you organize and share your knowledge in a tree-like structure, making it easy to navigate and understand complex topics.&rdquo;
            </p>
            <footer className='text-sm'>ChatreeAI Team</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          {/* github link  */}
          <Link
            className={cn(
              buttonVariants({
                variant: 'ghost'
              }),
              'group inline-flex hover:text-yellow-200'
            )}
            target='_blank'
            href={'https://github.com/kkvrivishvili/chatree'}
          >
            <div className='flex items-center'>
              <GitHubLogoIcon className='size-4' />
              <span className='ml-1 inline'>Star on GitHub</span>{' '}
            </div>
            <div className='ml-2 flex items-center gap-1 text-sm md:flex'>
              <StarIcon
                className='size-4 text-gray-500 transition-all duration-300 group-hover:text-yellow-300'
                fill='currentColor'
              />
              <span className='font-display font-medium'>{stars}</span>
            </div>
          </Link>

          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {activeTab === 'signin' ? 'Bienvenido de vuelta' : 'Crear una cuenta'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {activeTab === 'signin' 
                ? 'Ingresa tus credenciales para acceder'
                : 'Ingresa tus datos para crear una cuenta'}
            </p>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Ingresar</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <UserAuthForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <UserRegisterForm />
            </TabsContent>
          </Tabs>

          <p className='px-8 text-center text-sm text-muted-foreground'>
            Al continuar, aceptas nuestros{' '}
            <Link
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
