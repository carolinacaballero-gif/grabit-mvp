import { redirect } from 'next/navigation'

// Redirigir la raíz al login
export default function Home() {
  redirect('/login')
}
