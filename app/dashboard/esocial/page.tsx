import { Suspense } from "react"
import ESocialContent from "./esocial-content"
import { ambienteAtual } from "@/lib/esocial/events/common"

export const dynamic = "force-dynamic"

export default function ESocialPage() {
  return (
    <Suspense fallback={null}>
      <ESocialContent environment={ambienteAtual().environment} />
    </Suspense>
  )
}
