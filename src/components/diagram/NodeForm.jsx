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

export function NodeForm({ newNodeText, setNewNodeText, newNodeTextDirection, setNewNodeTextDirection, handleAddNode }) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="输入节点名称"
        value={newNodeText}
        onChange={(e) => setNewNodeText(e.target.value)}
      />
      <Select value={newNodeTextDirection} onValueChange={setNewNodeTextDirection}>
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
  );
}