import "blockly";
import "./components/Blockly/costumBlocks";
import useBlockly from "./components/Blockly/hooks/useBlckly";
import { ToSpaceship } from "./components/Blockly/Game/ToSpaceship";

function App() {
  // const { BlocklyComponent, generate } = useBlockly({
  //   initialBlock: {
  //     kind: "controls_if",
  //     x: 10,
  //     y: 10,
  //   },
  //   toolbox: {
  //     kind: "categoryToolbox",
  //     contents: [
  //       {
  //         kind: "category",
  //         name: "Control",
  //         contents: [
  //           {
  //             kind: "block",
  //             type: "controls_if",
  //           },
  //           {
  //             kind: "block",
  //             type: "move",
  //           },
  //         ],
  //       },
  //       {
  //         kind: "category",
  //         name: "Logic",
  //         contents: [
  //           {
  //             kind: "block",
  //             type: "logic_compare",
  //           },
  //           {
  //             kind: "block",
  //             type: "logic_operation",
  //           },
  //           {
  //             kind: "block",
  //             type: "logic_boolean",
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // });
  return <ToSpaceship />;
}

export default App;
