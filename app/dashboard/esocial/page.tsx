import { Suspense } from "react"
import ESocialContent from "./esocial-content"

export default function ESocialPage() {
  return (
    <Suspense fallback={null}>
      <ESocialContent />
    </Suspense>
  )
}
