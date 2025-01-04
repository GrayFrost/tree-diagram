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
      layerSpacing: 80,
      nodeSpacing: 50,
      alignment: TreeLayout.AlignmentStart,
      arrangement: TreeLayout.ArrangementHorizontal,
    }),
    model: new GraphLinksModel({
      linkKeyProperty: "key",
      linkFromPortIdProperty: "fromPort",
      linkToPortIdProperty: "toPort",
    })
  });

  // 重写删除命令
  diagram.commandHandler.doKeyDown = function() {
    const e = diagram.lastInput;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selection = diagram.selection.toArray();
      if (selection.length > 0) {
        const deletedNodes = selection
          .filter(part => part instanceof Node)
          .map(node => node.data.key);
        const deletedLinks = selection
          .filter(part => part instanceof Link)
          .map(link => link.data.key);
          
        // 先触发事件
        window.dispatchEvent(new CustomEvent('nodeDeleted', {
          detail: { deletedNodes, deletedLinks }
        }));
        
        // 使用 model 的方法来删除节点和连接线
        diagram.model.startTransaction('delete');
        selection.forEach(part => {
          if (part instanceof Node) {
            diagram.model.removeNodeData(part.data);
          } else if (part instanceof Link) {
            diagram.model.removeLinkData(part.data);
          }
        });
        diagram.model.commitTransaction('delete');
      }
      e.handled = true;
    }
  };

  // 节点模板
  diagram.nodeTemplate = $(
    Node,
    "Auto",
    {
      doubleClick: (e, node) => {
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('nodeDoubleClicked', {
          detail: { nodeKey: node.data.key }
        }));
      },
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
        (text) => parseFloat(text.replace("%", "")) || 0
      )
    )
  );

  diagram.addModelChangedListener(function (evt) {
    if (evt.isTransactionFinished) {
      const data = {
        nodes: diagram.model.nodeDataArray,
        links: diagram.model.linkDataArray,
        timestamp: new Date().getTime()
      };
      sessionStorage.setItem('diagramData', JSON.stringify(data));
      console.log("图表数据已保存到 SessionStorage");
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