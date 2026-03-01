import { it } from "node:test";
import { FileSystemItem } from "./FileSystemItem";

class FolderItem extends FileSystemItem {
  children: FileSystemItem[] = [];

  constructor(
    id: string,
    name: string,
    ownerId: string,
    parentId: string | null,
  ) {
    super(id, name, ownerId, parentId);
  }

  addChild(item : FileSystemItem){
     this.children.push(item)
  }
}
