import React from "react";
import Dashboard from "@/components/Dashboard";
import AppLayout from "@/components/AppLayout";
import { MaterialSummary, PieceData } from "@/components/OptimizationResults";
import { useToast } from "@/hooks/use-toast";

const DashboardPage: React.FC = () => {
  const { toast } = useToast();

  // Mock data for demonstration
  const mockMaterials: MaterialSummary[] = [
    {
      material: "MDF",
      thickness: "15mm",
      color: "Branco",
      totalArea: 8500000,
      sheetCount: 4,
      totalEdgeBanding: 12000
    },
    {
      material: "MDF",
      thickness: "18mm",
      color: "Carvalho",
      totalArea: 3200000,
      sheetCount: 2,
      totalEdgeBanding: 5600
    },
    {
      material: "MDP",
      thickness: "15mm",
      color: "Cinza",
      totalArea: 2100000,
      sheetCount: 1,
      totalEdgeBanding: 3400
    }
  ];

  const mockPieces: PieceData[] = [
    {
      width: 670,
      depth: 320,
      quantity: 2,
      material: "MDF",
      thickness: "15mm",
      color: "Branco",
      edgeBottom: "X",
      edgeTop: "X",
      edgeRight: "",
      edgeLeft: "",
      family: "Armário"
    },
    {
      width: 450,
      depth: 520,
      quantity: 1,
      material: "MDF",
      thickness: "18mm",
      color: "Carvalho",
      edgeBottom: "X",
      edgeTop: "",
      edgeRight: "X",
      edgeLeft: "",
      family: "Gaveteiro"
    }
  ];

  const handleExportExcel = () => {
    toast({
      title: "Exportando para Excel",
      description: "Seu projeto está sendo exportado para o formato Excel.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Gerando PDF",
      description: "O relatório PDF está sendo gerado com os dados do projeto.",
    });
  };

  const handleSaveProject = () => {
    toast({
      title: "Projeto Salvo",
      description: "Seu projeto foi salvo com sucesso no sistema.",
    });
  };

  const handleShareProject = () => {
    toast({
      title: "Link Compartilhado",
      description: "Link de compartilhamento copiado para a área de transferência.",
    });
  };

  return (
    <AppLayout hideHeader={true}> {/* Esconder o cabeçalho do AppLayout para o Dashboard */}
      <Dashboard
        materials={mockMaterials}
        pieces={mockPieces}
        projectName="Projeto Cozinha Moderna"
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onSaveProject={handleSaveProject}
        onShareProject={handleShareProject}
      />
    </AppLayout>
  );
};

export default DashboardPage;