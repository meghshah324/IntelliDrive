export abstract class FileSystemItem {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;

  constructor(
    id: string,
    name: string,
    ownerId: string,
    parentId: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.ownerId = ownerId;
    this.parentId = parentId;
  }
}
