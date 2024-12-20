import { useState, useRef } from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./App.css";

function initDiagram(showIndex, theme) {
  const $ = go.GraphObject.make;
  const diagram = new go.Diagram({
    "undoManager.isEnabled": true,
    initialContentAlignment: go.Spot.Center,
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 80, // 增加层间距
      nodeSpacing: 50, // 增加同层节点间距
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
      name: "Shape",
      fill: "white",
      stroke: theme.nodeStroke,
      strokeWidth: 2,
    }),
    $(
      go.Panel,
      "Vertical",
      {
        defaultAlignment: go.Spot.Center,
      },
      $(go.TextBlock, {
        margin: 8,
        font: "bold 14px 微软雅黑",
        stroke: "#333",
        editable: true,
        textAlign: "center",
        isMultiline: true,
      }).bind(new go.Binding("text").makeTwoWay()),
      $(go.TextBlock, {
        name: "INDEX",
        margin: new go.Margin(0, 0, 4, 0),
        font: "12px 微软雅黑",
        stroke: "#666",
        visible: showIndex, // 根据状态控制显示
      }).bind("text", "key", (key) => `(${key})`)
    )
  );

  // 连接线模板
  diagram.linkTemplate = $(
    go.Link,
    {
      routing: go.Link.Orthogonal,
      corner: 10, // 增加圆角
      selectable: true,
      shadowOffset: new go.Point(0, 0),
      shadowBlur: 3,
      shadowColor: "rgba(0, 0, 0, 0.2)", // 添加阴影效果
      cursor: "pointer",
      mouseEnter: (e, link) => {
        // 鼠标悬停效果
        const shape = link.findObject("SHAPE"); // 需要给 Shape 添加 name
        if (shape) {
          // 获取当前主题的颜色，并调整透明度
          const currentColor = shape.stroke;
          const opaqueColor = currentColor.replace(/[\d.]+\)$/g, "1)");
          shape.stroke = opaqueColor;
          shape.strokeWidth = 3;
        }
      },
      mouseLeave: (e, link) => {
        // 鼠标离开效果
        const shape = link.findObject("SHAPE");
        if (shape) {
          // 恢复到当前主题的颜色
          const currentColor = shape.stroke;
          const transparentColor = currentColor.replace(/[\d.]+\)$/g, "0.8)");
          shape.stroke = transparentColor;
          shape.strokeWidth = 2;
        }
      },
    },
    // 主线条
    $(go.Shape, {
      name: "SHAPE",
      strokeWidth: 2,
      stroke: theme.linkStroke, // 使用半透明的蓝色
      strokeDashArray: [0, 0], // 实线
    }),
    // 箭头
    $(go.Shape, {
      name: "ARROW",
      toArrow: "Triangle",
      fill: theme.linkStroke,
      stroke: null,
      scale: 1.2, // 箭头稍大一些
    }),
    // 文本块
    $(
      go.TextBlock,
      {
        segmentOffset: new go.Point(0, -16), // 调整文本位置
        font: "bold 12px 微软雅黑",
        stroke: "#666",
        background: "white", // 文本背景
        margin: 4,
        editable: true,
      },
      new go.Binding("text", "shareRatio", (ratio) => ratio + "%").makeTwoWay(
        (text) => parseInt(text.replace("%", "")) || 0
      )
    )
  );

  diagram.addModelChangedListener(function (evt) {
    if (evt.isTransactionFinished) {
      const data = evt.model.toJson();
      console.log("图表数据已更新:", data);
      // 这里可以添加您的数据保存逻辑
    }
  });

  diagram.addDiagramListener("InitialLayoutCompleted", (e) => {
    const diagram = e.diagram;
    diagram.nodes.each((node) => {
      const indexText = node.findObject("INDEX");
      if (indexText) {
        indexText.visible = showIndex;
      }
    });
  });

  return diagram;
}

function App() {
  const [theme, setTheme] = useState({
    nodeStroke: "#1890ff",
    linkStroke: "rgba(24, 144, 255, 0.8)",
    textStroke: "#333",
  });
  // 状态管理
  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 0, text: "控股公司" },
    { key: 1, text: "子\n公\n司\nA" },
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
  const [newNodeText, setNewNodeText] = useState("");
  const [newNodeTextDirection, setNewNodeTextDirection] = useState("");

  // 新增连接的表单状态
  const [newLink, setNewLink] = useState({
    from: "",
    to: "",
    shareRatio: "",
  });

  const [showNodeIndex, setShowNodeIndex] = useState(false);
  const diagramRef = useRef(null);

  // 添加新节点
  const handleAddNode = () => {
    if (!newNodeText || !newNodeTextDirection) return;
    const newKey = Math.max(...nodeDataArray.map((node) => node.key)) + 1;
    const text =
      newNodeTextDirection === "vertical"
        ? newNodeText.split("").join("\n") // 垂直排列时添加换行符
        : newNodeText; // 水平排列时保持原样
    setNodeDataArray([...nodeDataArray, { key: newKey, text: text }]);
    setNewNodeText("");
    setNewNodeTextDirection("");
  };

  const handleAddLink = () => {
    const { from, to, shareRatio } = newLink;
    if (!from || !to || !shareRatio) return;

    const newKey = Math.min(...linkDataArray.map((link) => link.key)) - 1;
    setLinkDataArray([
      ...linkDataArray,
      {
        key: newKey,
        from: parseInt(from),
        to: parseInt(to),
        shareRatio: parseInt(shareRatio),
      },
    ]);

    setNewLink({ from: "", to: "", shareRatio: "" });
  };

  const handleToggleIndex = () => {
    setShowNodeIndex(!showNodeIndex);
    const diagram = diagramRef.current?.getDiagram();
    if (diagram) {
      diagram.nodes.each((node) => {
        const indexText = node.findObject("INDEX");
        if (indexText) {
          indexText.visible = !showNodeIndex;
        }
      });
      diagram.requestUpdate();
    }
  };

  const toggleTheme = () => {
    const themes = {
      blue: {
        nodeStroke: "#1890ff",
        linkStroke: "rgba(24, 144, 255, 0.8)",
        textStroke: "#333",
      },
      green: {
        nodeStroke: "#52c41a",
        linkStroke: "rgba(82, 196, 26, 0.8)",
        textStroke: "#444",
      },
      purple: {
        nodeStroke: "#722ed1",
        linkStroke: "rgba(114, 46, 209, 0.8)",
        textStroke: "#555",
      },
    };

    // 循环切换主题
    const currentTheme = Object.values(themes).findIndex(
      (t) => t.nodeStroke === theme.nodeStroke
    );
    const nextTheme =
      Object.values(themes)[(currentTheme + 1) % Object.values(themes).length];
    setTheme(nextTheme);

    const diagram = diagramRef.current?.getDiagram();
    if (diagram) {
      // 更新节点样式
      diagram.nodes.each((node) => {
        const shape = node.findObject("Shape");
        if (shape) {
          shape.stroke = nextTheme.nodeStroke;
        }
      });

      // 更新连接线样式
      diagram.links.each((link) => {
        const shape = link.findObject("SHAPE");
        const arrow = link.findObject("ARROW");
        if (shape) {
          shape.stroke = nextTheme.linkStroke;
        }
        if (arrow) {
          arrow.fill = nextTheme.linkStroke;
        }
      });
      diagram.requestUpdate();
    }
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
          <Select
            value={newNodeTextDirection}
            onValueChange={setNewNodeTextDirection}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="文字排列方向" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>文字排列方向</SelectLabel>
                <SelectItem value="horizontal">水平</SelectItem>
                <SelectItem value="vertical">垂直</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleAddNode}>添加节点</Button>
        </div>

        <Button variant="outline" onClick={handleToggleIndex}>
          {showNodeIndex ? "隐藏节点序号" : "显示节点序号"}
        </Button>
        <Button variant="outline" onClick={toggleTheme}>
          切换主题颜色
        </Button>

        <div className="flex gap-2">
          <Input
            placeholder="从节点(key)"
            value={newLink.from}
            onChange={(e) => setNewLink({ ...newLink, from: e.target.value })}
          />
          <Input
            placeholder="到节点(key)"
            value={newLink.to}
            onChange={(e) => setNewLink({ ...newLink, to: e.target.value })}
          />
          <Input
            placeholder="股权比例"
            value={newLink.shareRatio}
            onChange={(e) =>
              setNewLink({ ...newLink, shareRatio: e.target.value })
            }
          />
          <Button onClick={handleAddLink}>添加连接</Button>
        </div>
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
    </main>
  );
}

export default App;
