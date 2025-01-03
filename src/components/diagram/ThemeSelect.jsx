import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ThemeSelect({ handleThemeChange }) {
  return (
    <Select defaultValue="gray" onValueChange={handleThemeChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="选择主题颜色" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>主题颜色</SelectLabel>
          <SelectItem value="gray">默认灰</SelectItem>
          <SelectItem value="blue">天空蓝</SelectItem>
          <SelectItem value="green">青草绿</SelectItem>
          <SelectItem value="purple">优雅紫</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
