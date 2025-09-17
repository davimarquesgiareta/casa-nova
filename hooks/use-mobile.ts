// hooks/use-mobile.ts
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Começa como 'false' por padrão no servidor
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Esta função só roda no cliente, onde 'window' existe
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Roda uma vez na montagem do componente no cliente
    checkDevice()

    // Adiciona o listener para futuras mudanças de tamanho
    window.addEventListener("resize", checkDevice)

    // Limpa o listener quando o componente é desmontado
    return () => window.removeEventListener("resize", checkDevice)
  }, []) // O array vazio [] garante que o useEffect rode apenas uma vez

  return isMobile
}