/**
 * @license
 *
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blockly React Component.
 * @author samelh@google.com (Sam El-Husseini)
 */

import React, { forwardRef } from "react";
import { useEffect, useRef } from "react";

import Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blockly";
import { moveset } from "../../movesets/movesets";
import { usePlayer } from "../../data/hooks/usePlayer";

Blockly.setLocale(locale);

interface Props extends Blockly.BlocklyOptions {
  initialXml?: string;
  children: React.ReactNode;
}

const BlocklyComponent = forwardRef(
  ({ children, initialXml, ...props }: Props, ref) => {
    const { createPlayer } = usePlayer();
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const toolbox = useRef<HTMLDivElement>(null);
    const primaryWorkspace = useRef<Blockly.WorkspaceSvg>();

    function replaceMoves(code: string) {
      for (const move in moveset) {
        const regex = new RegExp(move.replace(/\(\)/g, "\\(\\)"), "g");

        code = code.replace(regex, moveset[move as keyof typeof moveset]);
      }
      return code;
    }

    const generateCode = () => {
      const code = javascriptGenerator.workspaceToCode(
        primaryWorkspace.current
      );
      return replaceMoves(code);
    };

    const run = () => {
      createPlayer(generateCode());
    };

    useEffect(() => {
      if (!primaryWorkspace.current && toolbox.current) {
        primaryWorkspace.current = Blockly.inject(
          blocklyDiv.current as Element,
          {
            toolbox: toolbox.current,
            ...props,
          }
        );
      }

      if (initialXml && primaryWorkspace.current) {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(initialXml),
          primaryWorkspace.current
        );
      }
    }, [initialXml, props]);

    return (
      <React.Fragment>
        <button onClick={run}>RODAR</button>
        <div ref={blocklyDiv} className="w-full h-[400px]" id="blocklyDiv" />
        <div ref={toolbox}>{children}</div>
      </React.Fragment>
    );
  }
);

export default BlocklyComponent;
