import { useEffect, useMemo, useRef } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import _ from "lodash";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { delay } from "../../../utils/delay";

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
  const workspaceKey = "@workspace";
  // Since the deps are objects, we need to deep compare them
  useDeepCompareEffect(() => {
    // Inject the workspace
    workspaceRef.current = Blockly.inject(wrapperRef.current as Element, {
      // Unfortuntely Blockly mutates the toolbox object when initialising. This
      // means that the dep changes between renders, which in turn means that
      // the workspace is re-injected

      toolbox: _.cloneDeep(toolbox),
      renderer: "zelos",
      grid: {
        spacing: 20,
        length: 3,
        colour: "#eee",
        snap: true,
      },
    });

    // Set the initial block in the workspace
    // if (initialBlock) {
    //   const block = workspaceRef.current.newBlock(initialBlock.kind);
    //   block.moveBy(initialBlock.x, initialBlock.y);
    //   block.initSvg();

    //   workspaceRef.current.render();
    // }

    return () => {
      workspaceRef.current && workspaceRef.current.dispose();
    };
  }, [toolbox, initialBlock]);

  useEffect(() => {
    const workspace = workspaceRef.current;
    const theme = workspace?.getTheme();
    console.log(workspaceRef.current?.getTheme());

    if (workspace && theme && theme.name !== "astro") {
      workspace.setTheme({
        ...theme,
        name: "astro",
        blockStyles: {
          move_blocks: {
            hat: "#000",
            colourPrimary: "#FD0F8F",
            colourSecondary: "#ddd",
            colourTertiary: "#eee",
          },
          logic_blocks: {
            hat: "#000",
            colourPrimary: "#FD8F8F",
            colourSecondary: "#ddd",
            colourTertiary: "#eee",
          },
          math_blocks: {
            hat: "",
            colourPrimary: "#26C5F3",
            colourSecondary: "#ddd",
            colourTertiary: "#eee",
          },
        },
        categoryStyles: {
          logic_category: {
            colour: "#FD8F8F",
          },
        },
        fontStyle: {
          family: "Courier New, serif",
          weight: "bold",
          size: 12,
        },
        componentStyles: {
          workspaceBackgroundColour: "#fafafa",
          toolboxBackgroundColour: "#eee",
        },
        getClassName: function (): string {
          return theme.getClassName();
        },
        setBlockStyle: function (
          blockStyleName: string,
          blockStyle: Blockly.Theme.BlockStyle
        ): void {
          return theme.setBlockStyle(blockStyleName, blockStyle);
        },
        setCategoryStyle: function (
          categoryStyleName: string,
          categoryStyle: Blockly.Theme.CategoryStyle
        ): void {
          theme.setCategoryStyle(categoryStyleName, categoryStyle);
        },
        getComponentStyle: function (componentName: string): string | null {
          return theme.getComponentStyle(componentName);
        },
        setComponentStyle: function (
          componentName: string,
          styleValue: unknown
        ): void {
          theme.setComponentStyle(componentName, styleValue);
        },
        setFontStyle: function (fontStyle: Blockly.Theme.FontStyle): void {
          theme.setFontStyle(fontStyle);
        },
        setStartHats: function (startHats: boolean): void {
          theme.setStartHats(startHats);
        },
      });
    }
  }, []);

  const saveWorkspace = async (level: number) => {
    const serializer = new Blockly.serialization.blocks.BlockSerializer();
    const state = serializer.save(workspaceRef.current as Blockly.Workspace);
    await delay(0.5);
    localStorage.setItem(`${workspaceKey}_${level}`, JSON.stringify(state));
  };

  const loadWorkspace = async (level: number) => {
    const workspace = workspaceRef.current as Blockly.Workspace;
    const serializer = new Blockly.serialization.blocks.BlockSerializer();
    await delay(0.5);
    const storage = localStorage.getItem(`${workspaceKey}_${level}`);
    const state = storage ? JSON.parse(storage) : null;
    if (workspaceRef.current && state) {
      workspace.clear();
      serializer.load(state, workspace);
    }
  };

  return useMemo(
    () => ({
      loadWorkspace,
      saveWorkspace,
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
