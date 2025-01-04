import { useEffect } from "react";
import { ReactDiagram } from "gojs-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { NodeForm } from "./components/diagram/NodeForm";
import { LinkForm } from "./components/diagram/LinkForm";
import { initDiagram } from "./components/diagram/DiagramConfig";
import { useDiagram } from "./hooks/useDiagram";
import { Loading } from "./components/loading";
import "./App.css";
import { ThemeSelect } from "./components/diagram/ThemeSelect";

function App() {
  const {
    theme,
    nodeDataArray,
    setNodeDataArray,
    linkDataArray,
    setLinkDataArray,
    newNodeText,
    setNewNodeText,
    newNodeTextDirection,
    setNewNodeTextDirection,
    newLink,
    setNewLink,
    showNodeIndex,
    diagramRef,
    handleAddNode,
    handleAddLink,
    handleToggleIndex,
    isLoading,
    setIsLoading,
    handleThemeChange,
    handleClearData,
  } = useDiagram();

  useEffect(() => {
    const handleDiagramLoaded = () => {
      setIsLoading(false);
    };
    window.addEventListener('diagramLoaded', handleDiagramLoaded);
    return () => {
      window.removeEventListener('diagramLoaded', handleDiagramLoaded);
    };
  }, [setIsLoading]);

  return (
    <main className="p-4">
      {isLoading && <Loading />}
      <h1 className="text-2xl font-bold mb-4">股权结构图</h1>

      <div className="mb-4 space-y-4">
        <NodeForm
          newNodeText={newNodeText}
          setNewNodeText={setNewNodeText}
          newNodeTextDirection={newNodeTextDirection}
          setNewNodeTextDirection={setNewNodeTextDirection}
          handleAddNode={handleAddNode}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleIndex}>
            {showNodeIndex ? "隐藏节点序号" : "显示节点序号"}
          </Button>
          <ThemeSelect handleThemeChange={handleThemeChange} />
          <Button variant="destructive" onClick={handleClearData}>
            清除数据
          </Button>
        </div>
        <LinkForm
          newLink={newLink}
          setNewLink={setNewLink}
          handleAddLink={handleAddLink}
        />
      </div>
      <ReactDiagram
        ref={diagramRef}
        initDiagram={() => initDiagram(showNodeIndex, theme)}
        divClassName="diagram-component"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
        onModelChange={(e) => {
          if (e.isTransactionFinished) {
            setNodeDataArray(e.model.nodeDataArray);
            setLinkDataArray(e.model.linkDataArray);
          }
        }}
      />
      <Toaster />
    </main>
  );
}

export default App;
