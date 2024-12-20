import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LinkForm({ newLink, setNewLink, handleAddLink }) {
  return (
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
        onChange={(e) => setNewLink({ ...newLink, shareRatio: e.target.value })}
      />
      <Button onClick={handleAddLink}>添加连接</Button>
    </div>
  );
}