import { useState } from 'react';
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./App.css";

function initDiagram() {
  const $ = go.GraphObject.make;
  const diagram = new go.Diagram({
    "undoManager.isEnabled": true,
    initialContentAlignment: go.Spot.Center,
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 35,
      alignment: go.TreeLayout.AlignmentStart,
      arrangement: go.TreeLayout.ArrangementHorizontal,
    }),
    model: new go.GraphLinksModel({
      linkKeyProperty: "key",
      // 添加股权比例属性
      linkFromPortIdProperty: "fromPort",
      linkToPortIdProperty: "toPort",
    }),
  });

  // 节点模板
  diagram.nodeTemplate = $(
    go.Node,
    "Auto",
    $(go.Shape, "RoundedRectangle", {
      fill: "white",
      stroke: "#1890ff",
      strokeWidth: 2,
    }),
    $(go.TextBlock, {
      margin: 8,
      font: "bold 14px 微软雅黑",
      stroke: "#333",
      editable: true,
      textAlign: "center",
      isMultiline: false,
    }).bind(new go.Binding("text").makeTwoWay())
  );

  // 连接线模板
  diagram.linkTemplate = $(
    go.Link,
    {
      routing: go.Link.Orthogonal,
      corner: 5,
      selectable: true
    },
    $(go.Shape, { strokeWidth: 1.5, stroke: "#999" }),
    $(go.Shape, { toArrow: "Standard" }),
    $(go.TextBlock, {
      segmentOffset: new go.Point(0, -10),
      font: "12px 微软雅黑",
      editable: true,  // 启用文本编辑
    }, new go.Binding("text", "shareRatio", ratio => ratio + "%").makeTwoWay(text => 
      parseInt(text.replace("%", "")) || 0
    ))
  );

  diagram.addModelChangedListener(function (evt) {
    if (evt.isTransactionFinished) {
      const data = evt.model.toJson();
      console.log("图表数据已更新:", data);
      // 这里可以添加您的数据保存逻辑
    }
  });

  return diagram;
}

function App() {
  // 状态管理
  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 0, text: "控股公司" },
    { key: 1, text: "子公司A" },
    { key: 2, text: "子公司B" },
    { key: 3, text: "参股公司" },
  ]);
  
  const [linkDataArray, setLinkDataArray] = useState([
    { key: -1, from: 0, to: 1, shareRatio: 100 },
    { key: -2, from: 0, to: 2, shareRatio: 100 },
    { key: -3, from: 1, to: 3, shareRatio: 51 },
    { key: -4, from: 2, to: 3, shareRatio: 49 },
  ]);

  // 新增节点的表单状态
  const [newNodeText, setNewNodeText] = useState('');
  
  // 新增连接的表单状态
  const [newLink, setNewLink] = useState({
    from: '',
    to: '',
    shareRatio: ''
  });

  // 添加新节点
  const handleAddNode = () => {
    if (!newNodeText) return;
    const newKey = Math.max(...nodeDataArray.map(node => node.key)) + 1;
    setNodeDataArray([
      ...nodeDataArray,
      { key: newKey, text: newNodeText }
    ]);
    setNewNodeText('');
  };

  const handleAddLink = () => {
    const { from, to, shareRatio } = newLink;
    if (!from || !to || !shareRatio) return;
    
    const newKey = Math.min(...linkDataArray.map(link => link.key)) - 1;
    setLinkDataArray([
      ...linkDataArray,
      {
        key: newKey,
        from: parseInt(from),
        to: parseInt(to),
        shareRatio: parseInt(shareRatio)
      }
    ]);
    
    setNewLink({ from: '', to: '', shareRatio: '' });
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">股权结构图</h1>
      
      <div className="mb-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="输入节点名称"
            value={newNodeText}
            onChange={(e) => setNewNodeText(e.target.value)}
          />
          <Button onClick={handleAddNode}>添加节点</Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="从节点(key)"
            value={newLink.from}
            onChange={(e) => setNewLink({...newLink, from: e.target.value})}
          />
          <Input
            placeholder="到节点(key)"
            value={newLink.to}
            onChange={(e) => setNewLink({...newLink, to: e.target.value})}
          />
          <Input
            placeholder="股权比例"
            value={newLink.shareRatio}
            onChange={(e) => setNewLink({...newLink, shareRatio: e.target.value})}
          />
          <Button onClick={handleAddLink}>添加连接</Button>
        </div>
      </div>
      <ReactDiagram
        initDiagram={initDiagram}
        divClassName="diagram-component"
        nodeDataArray={nodeDataArray}
        linkDataArray={linkDataArray}
      />
    </main>
  );
}

export default App;
