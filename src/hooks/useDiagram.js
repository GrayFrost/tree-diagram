import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// 添加主题配置对象
const themes = {
  gray: {
    nodeStroke: "#666666",
    linkStroke: "rgba(102, 102, 102, 0.8)",
    textStroke: "#333",
  },
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

export function useDiagram() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(themes.gray); // 设置默认灰色主题
  // 从 SessionStorage 恢复数据
  const savedData = JSON.parse(sessionStorage.getItem('diagramData') || '{}');
  
  // 修改初始状态
  const [nodeDataArray, setNodeDataArray] = useState(
    savedData.nodes || []
  );
  const [linkDataArray, setLinkDataArray] = useState(
    savedData.links || []
  );

  // 新增节点的表单状态
  const [newNodeText, setNewNodeText] = useState("");
  const [newNodeTextDirection, setNewNodeTextDirection] = useState("horizontal");

  // 新增连接的表单状态
  const [newLink, setNewLink] = useState({
    from: "",
    to: "",
    shareRatio: "",
  });

  const [showNodeIndex, setShowNodeIndex] = useState(false);
  const diagramRef = useRef(null);

  useEffect(() => {
    // 添加删除节点的事件监听
    const handleNodeDeleted = (event) => {
      const { deletedNodes, deletedLinks } = event.detail;
      
      // 更新节点数组
      setNodeDataArray(prevNodes => 
        prevNodes.filter(node => !deletedNodes.includes(node.key))
      );
      
      // 更新连接线数组
      setLinkDataArray(prevLinks => 
        prevLinks.filter(link => !deletedLinks.includes(link.key))
      );
    };

    window.addEventListener('nodeDeleted', handleNodeDeleted);
    
    // 清理函数
    return () => {
      window.removeEventListener('nodeDeleted', handleNodeDeleted);
    };
  }, []);

  useEffect(() => {
    const handleNodeDoubleClicked = (event) => {
      const { nodeKey } = event.detail;
      handleToggleTextDirection(nodeKey);
    };

    window.addEventListener('nodeDoubleClicked', handleNodeDoubleClicked);
    
    return () => {
      window.removeEventListener('nodeDoubleClicked', handleNodeDoubleClicked);
    };
  }, []);

  // 添加新节点
  const handleAddNode = () => {
    if (!newNodeText) {
      toast({
        description: "请输入节点内容",
        variant: "destructive",
      });
      return;
    }
    if (!newNodeTextDirection) {
      toast({
        description: "请选择内容排列方向",
        variant: "destructive",
      });
      return;
    }
    const newKey = nodeDataArray.length === 0 
      ? 0 
      : Math.max(...nodeDataArray.map((node) => node.key)) + 1;
    
    const text =
      newNodeTextDirection === "vertical"
        ? newNodeText.split("").join("\n").replace("（", "︵").replace("）", "︶")
        : newNodeText;
    setNodeDataArray([...nodeDataArray, { key: newKey, text: text }]);
    setNewNodeText("");
    setNewNodeTextDirection("horizontal");

    setTimeout(() => {
      const diagram = diagramRef.current?.getDiagram();
      if (diagram) {
        diagram.nodes.each((node) => {
          const indexText = node.findObject("INDEX");
          if (indexText) {
            indexText.visible = showNodeIndex;
          }
          const shape = node.findObject("Shape");
          if (shape) {
            shape.stroke = theme.nodeStroke;
          }
        });
        diagram.requestUpdate();
      }
    }, 0)
  };

  const handleAddLink = () => {
    const { from, to, shareRatio } = newLink;
    // if (!from || !to || !shareRatio) return;
    if (['', null, undefined].includes(from) || from < 0) {
      toast({
        description: "请选择开始连接的节点",
        variant: "destructive",
      });
      return;
    }
    if (['', null, undefined].includes(to) || to < 0) {
      toast({
        description: "请选择结束连接的节点",
        variant: "destructive",
      });
      return;
    }

    if (!shareRatio) {
      toast({
        description: "请输入股权比例",
        variant: "destructive",
      });
      return;
    }

    const newKey = new Date().getTime();
    setLinkDataArray([
      ...linkDataArray,
      {
        key: newKey,
        from: parseInt(from),
        to: parseInt(to),
        shareRatio: parseFloat(shareRatio),
      },
    ]);

    setNewLink({ from: "", to: "", shareRatio: "" });

    setTimeout(() => {
      const diagram = diagramRef.current?.getDiagram();
      if (diagram) {
        diagram.links.each((link) => {
          const shape = link.findObject("SHAPE");
          const arrow = link.findObject("ARROW");
          if (shape) {
            shape.stroke = theme.linkStroke;
          }
          if (arrow) {
            arrow.fill = theme.linkStroke;
          }
        });
        diagram.requestUpdate();
      }
    }, 0)
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

  const handleThemeChange = (value) => {
    const nextTheme = themes[value];
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

  // 添加清除数据的方法（可选）
  const handleClearData = () => {
    sessionStorage.removeItem('diagramData');
    setNodeDataArray([]);
    setLinkDataArray([]);
    toast({
      description: "数据已清除",
    });
  };

  const handleToggleTextDirection = (nodeKey) => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) return;

    // 从图表中获取当前节点的最新文本
    const node = diagram.findNodeForKey(nodeKey);
    if (!node) return;
    
    const currentText = node.data.text;
    
    setNodeDataArray(prevNodes => 
      prevNodes.map(node => {
        if (node.key === nodeKey) {
          const isVertical = currentText.includes('\n');
          const text = isVertical
            ? currentText.replace(/\n/g, '').replace('︵', '（').replace('︶', '）')
            : currentText.split('').join('\n').replace('（', '︵').replace('）', '︶');
          
          return { ...node, text };
        }
        return node;
      })
    );
  };

  return {
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
    handleThemeChange,
    isLoading,
    setIsLoading,
    handleClearData,
    handleToggleTextDirection,
  };
}