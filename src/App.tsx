import BlocklyComponent, {
  Field,
  Shadow,
  Value,
  Block,
} from "./components/Blockly/blocks";
import "blockly/blocks";
import "./components/Blockly/costumBlocks";
import { ToSpaceship } from "./components/Blockly/Game/ToSpaceship";
import { useState } from "react";

function App() {
  return (
    <div className="flex flex-col gap-4">
      <ToSpaceship />
    </div>
  );
}

export default App;
