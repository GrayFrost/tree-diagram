import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export function useDiagram() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState({
    nodeStroke: "#1890ff",
    linkStroke: "rgba(24, 144, 255, 0.8)",
    textStroke: "#333",
  });
  // 状态管理
  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 0, text: "控股公司" },
  ]);

  const [linkDataArray, setLinkDataArray] = useState([]);

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
    const newKey = Math.max(...nodeDataArray.map((node) => node.key)) + 1;
    const text =
      newNodeTextDirection === "vertical"
        ? newNodeText.split("").join("\n") // 垂直排列时添加换行符
        : newNodeText; // 水平排列时保持原样
    setNodeDataArray([...nodeDataArray, { key: newKey, text: text }]);
    setNewNodeText("");
    setNewNodeTextDirection("horizontal");

    setTimeout(() => {
      const diagram = diagramRef.current?.getDiagram();
      if (diagram) {
        diagram.nodes.each((node) => {
          // 同步 index 显示
          const indexText = node.findObject("INDEX");
          if (indexText) {
            indexText.visible = showNodeIndex;
          }
          // 同步主题颜色
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
        shareRatio: parseInt(shareRatio),
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
    toggleTheme,
    isLoading,
    setIsLoading,
  };
}