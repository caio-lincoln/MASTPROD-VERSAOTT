import { ambienteAtual, LEIAUTE_VERSION } from "@/lib/esocial/events/common"
import SettingsContent from "./settings-content"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <SettingsContent
      environment={ambienteAtual().environment}
      leiaute={LEIAUTE_VERSION}
      verProc={process.env.ESOCIAL_VER_PROC || "1.0.0"}
    />
  )
}
