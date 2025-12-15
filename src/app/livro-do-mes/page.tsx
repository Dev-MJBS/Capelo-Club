import { redirect } from 'next/navigation'

export default function BookOfTheMonthRedirect() {
    redirect('/livro-do-mes/atual')
}
