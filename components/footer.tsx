import Image from "next/image"
import { APPVERSION, config } from "@/lib/config"

const version = APPVERSION

export function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 
                 bg-white/30 backdrop-blur-md 
                 text-accent2 text-xs p-2 
                 flex justify-between items-center 
                 z-20"
    >
      <div className="text-left">v{version}</div>
      <div className="flex items-center gap-1 text-right">
        TICS | HOSPITAL VOZANDES QUITO
        {config.images.aplicativoLogo && (
          <Image
            src={config.images.aplicativoLogo}
            alt="Logo HTQ Pequeño"
            width={20}
            height={20}
            className="ml-1"
          />
        )}
      </div>
    </footer>
  )
}
