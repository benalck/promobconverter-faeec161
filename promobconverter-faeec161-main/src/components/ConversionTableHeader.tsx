
import React from "react";

const ConversionTableHeader: React.FC = () => {
  return (
    <tr>
      <th>NUM.</th>
      <th>MÓDULO</th>
      <th>CLIENTE</th>
      <th>AMBIENTE</th>
      <th className="piece-desc">DESC. DA PEÇA</th>
      <th className="piece-desc">OBSERVAÇÕES DA PEÇA</th>
      <th style={{ backgroundColor: "#F7CAAC" }} className="comp">COMP</th>
      <th style={{ backgroundColor: "#BDD6EE" }} className="larg">LARG</th>
      <th>QUANT</th>
      <th style={{ backgroundColor: "#F7CAAC" }} className="borda-inf">BORDA INF</th>
      <th style={{ backgroundColor: "#F7CAAC" }} className="borda-sup">BORDA SUP</th>
      <th style={{ backgroundColor: "#BDD6EE" }} className="borda-dir">BORDA DIR</th>
      <th style={{ backgroundColor: "#BDD6EE" }} className="borda-esq">BORDA ESQ</th>
      <th className="edge-color">COR FITA DE BORDA</th>
      <th className="material">CHAPA</th>
      <th className="material">ESP.</th>
    </tr>
  );
};

export default ConversionTableHeader;
