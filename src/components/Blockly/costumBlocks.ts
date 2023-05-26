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
    this.setStyle("move_blocks");
    this.setTooltip("ir para frente");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["jump"] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldLabelSerializable("pular"),
      "NAME"
    );
    this.setStyle("move_blocks");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip("pular");
    this.setHelpUrl("");
  },
};

javascriptGenerator["move"] = function () {
  return "move();\n";
};
javascriptGenerator["jump"] = function () {
  return "jump();\n";
};
