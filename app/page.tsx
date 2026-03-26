import { redirect } from 'next/navigation'

// La raíz no tiene uso directo — redirige al portal demo
// En producción, esta página podría ser un login interno para Implant
export default function Home() {
  redirect('/portal/demo')
}
