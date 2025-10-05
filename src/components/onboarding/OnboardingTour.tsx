import { useState, useEffect } from "react"
import Joyride, { Step, CallBackProps, STATUS, ACTIONS } from "react-joyride"
import { useTheme } from "@/components/ThemeProvider"

const steps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Bem-vindo ao PromobConverter! 🎉</h2>
        <p>Vamos fazer um tour rápido para você conhecer as funcionalidades principais.</p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "[data-tour='upload']",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Upload de Arquivos</h3>
        <p>Arraste e solte seus arquivos XML do Promob aqui, ou clique para selecionar.</p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: "[data-tour='convert-btn']",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Conversão Instantânea</h3>
        <p>Após fazer upload, clique aqui para converter seu arquivo em Excel formatado.</p>
      </div>
    ),
    placement: "top",
  },
  {
    target: "[data-tour='quick-actions']",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Ações Rápidas</h3>
        <p>Acesse rapidamente as funcionalidades mais usadas: converter, otimizar corte e gerar orçamentos.</p>
      </div>
    ),
    placement: "top",
  },
  {
    target: "[data-tour='theme-toggle']",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold">Tema Claro/Escuro</h3>
        <p>Alterne entre modo claro e escuro para trabalhar com conforto em qualquer ambiente.</p>
      </div>
    ),
    placement: "bottom",
  },
]

export function OnboardingTour() {
  const [run, setRun] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenOnboarding")
    if (!hasSeenTour) {
      // Small delay to ensure DOM is ready
      setTimeout(() => setRun(true), 1000)
    }
  }, [])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      localStorage.setItem("hasSeenOnboarding", "true")
      setRun(false)
    }

    if (action === ACTIONS.CLOSE) {
      localStorage.setItem("hasSeenOnboarding", "true")
      setRun(false)
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: theme === "dark" ? "hsl(200, 85%, 50%)" : "hsl(200, 85%, 45%)",
          backgroundColor: theme === "dark" ? "hsl(220, 20%, 12%)" : "hsl(0, 0%, 100%)",
          textColor: theme === "dark" ? "hsl(220, 10%, 95%)" : "hsl(220, 20%, 10%)",
          arrowColor: theme === "dark" ? "hsl(220, 20%, 12%)" : "hsl(0, 0%, 100%)",
          overlayColor: theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          fontSize: 14,
        },
        buttonNext: {
          backgroundColor: theme === "dark" ? "hsl(200, 85%, 50%)" : "hsl(200, 85%, 45%)",
          borderRadius: 8,
          padding: "8px 16px",
        },
        buttonBack: {
          color: theme === "dark" ? "hsl(220, 10%, 60%)" : "hsl(220, 10%, 45%)",
        },
        buttonSkip: {
          color: theme === "dark" ? "hsl(220, 10%, 60%)" : "hsl(220, 10%, 45%)",
        },
      }}
      locale={{
        back: "Anterior",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular",
      }}
    />
  )
}
