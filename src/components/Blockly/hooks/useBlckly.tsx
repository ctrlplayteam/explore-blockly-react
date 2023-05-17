import { useMemo, useRef } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import _ from "lodash";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

interface Props {
  initialBlock: {
    kind: string;
    x: number;
    y: number;
  };
  toolbox: Element | Blockly.utils.toolbox.ToolboxDefinition | undefined;
}
export default function useBlockly({ initialBlock, toolbox }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg>();

  // Since the deps are objects, we need to deep compare them
  useDeepCompareEffect(() => {
    // Inject the workspace
    workspaceRef.current = Blockly.inject(wrapperRef.current as Element, {
      // Unfortuntely Blockly mutates the toolbox object when initialising. This
      // means that the dep changes between renders, which in turn means that
      // the workspace is re-injected
      toolbox: _.cloneDeep(toolbox),
    });

    // Set the initial block in the workspace
    if (initialBlock) {
      const block = workspaceRef.current.newBlock(initialBlock.kind);
      block.moveBy(initialBlock.x, initialBlock.y);
      block.initSvg();

      workspaceRef.current.render();
    }

    return () => {
      workspaceRef.current && workspaceRef.current.dispose();
    };
  }, [toolbox, initialBlock]);

  return useMemo(
    () => ({
      // Return a component to inject the workspace
      BlocklyComponent: () => <div ref={wrapperRef} className="w-full h-96" />,
      // Generate code from the workspace
      generate: () => {
        return javascriptGenerator.workspaceToCode(workspaceRef.current);
      },
    }),
    []
  );
}
