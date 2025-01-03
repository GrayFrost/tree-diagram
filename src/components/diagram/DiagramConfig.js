import { 
  Diagram,
  GraphObject,
  Point,
  Spot,
  TreeLayout,
  Shape,
  Panel,
  TextBlock,
  Node,
  Link,
  Binding,
  Adornment,
  GraphLinksModel,
  Placeholder,
  Margin,
} from 'gojs';

export function initDiagram(showIndex, theme) {
  const $ = GraphObject.make;
  const diagram = new Diagram({
    "undoManager.isEnabled": true,
    initialContentAlignment: Spot.Center,
    layout: $(TreeLayout, {
      angle: 90,
      layerSpacing: 80, // 增加层间距
      nodeSpacing: 50, // 增加同层节点间距
      alignment: TreeLayout.AlignmentStart,
      arrangement: TreeLayout.ArrangementHorizontal,
    }),
    model: new GraphLinksModel({
      linkKeyProperty: "key",
      // 添加股权比例属性
      linkFromPortIdProperty: "fromPort",
      linkToPortIdProperty: "toPort",
    }),
  });

  // 节点模板
  diagram.nodeTemplate = $(
    Node,
    "Auto",
    {
      selectionAdornmentTemplate: $(
        Adornment,
        "Auto",
        $(Shape, "RoundedRectangle", {
          fill: null,
          stroke: theme.nodeStroke,
          strokeWidth: 3,
        }),
        $(Placeholder)
      )
    },
    $(Shape, "RoundedRectangle", {
      name: "Shape",
      fill: "white",
      stroke: theme.nodeStroke,
      strokeWidth: 2,
    }),
    $(
      Panel,
      "Vertical",
      {
        defaultAlignment: Spot.Center,
      },
      $(TextBlock, {
        margin: 8,
        font: "bold 14px 微软雅黑",
        stroke: "#333",
        editable: true,
        textAlign: "center",
        isMultiline: true,
      }).bind(new Binding("text").makeTwoWay()),
      $(TextBlock, {
        name: "INDEX",
        margin: new Margin(0, 0, 4, 0),
        font: "12px 微软雅黑",
        stroke: "#666",
        visible: showIndex, // 根据状态控制显示
      }).bind("text", "key", (key) => `(${key})`)
    )
  );

  // 连接线模板
  diagram.linkTemplate = $(
    Link,
    {
      routing: Link.Orthogonal,
      corner: 10, // 增加圆角
      selectable: true,
      shadowOffset: new Point(0, 0),
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
    $(Shape, {
      name: "SHAPE",
      strokeWidth: 2,
      stroke: theme.linkStroke, // 使用半透明的蓝色
      strokeDashArray: [0, 0], // 实线
    }),
    // 箭头
    $(Shape, {
      name: "ARROW",
      toArrow: "Triangle",
      fill: theme.linkStroke,
      stroke: null,
      scale: 1.2, // 箭头稍大一些
    }),
    // 文本块
    $(
      TextBlock,
      {
        segmentOffset: new Point(0, -16), // 调整文本位置
        font: "bold 12px 微软雅黑",
        stroke: "#666",
        background: "white", // 文本背景
        margin: 4,
        editable: true,
      },
      new Binding("text", "shareRatio", (ratio) => ratio + "%").makeTwoWay(
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
    // 添加延迟以确保图表完全渲染
    setTimeout(() => {
      window.dispatchEvent(new Event('diagramLoaded'));
    }, 100);
  });

  return diagram;
}