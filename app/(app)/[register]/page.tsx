import { notFound } from "next/navigation"
import { RegisterTable } from "@/components/register-table"
import { REGISTER_NAMES, type RegisterName } from "@/lib/register-meta"

export function generateStaticParams() {
    return REGISTER_NAMES.map((register) => ({ register }))
}
export const dynamicParams = false

export default async function RegisterPage({ params }: { params: Promise<{ register: string }> }) {
    const { register } = await params
    if (!REGISTER_NAMES.includes(register as RegisterName)) notFound()
    return <RegisterTable name={register as RegisterName} page />
}
