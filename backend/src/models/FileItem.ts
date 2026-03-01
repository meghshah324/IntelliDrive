import { FileSystemItem } from "./FileSystemItem";

export class FileItem extends FileSystemItem{
     mimeType : string
     size:number
     storageURL : string

     constructor(
         id : string,
         name : string,
         ownerId : string,
         parentId  : string | null,
         mimeType : string,
         size : number,
         storageURL : string
     ){
         super(id,name,ownerId,parentId)
         this.mimeType = mimeType,
         this.size = size,
         this.storageURL = storageURL
     }
}