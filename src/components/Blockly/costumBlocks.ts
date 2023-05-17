import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

Blockly.Blocks["move"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldLabelSerializable("caminhar"),
      "NAME"
    );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip("ir para frente");
    this.setHelpUrl("");
  },
};

javascriptGenerator["move"] = function () {
  return "move();\n";
};
