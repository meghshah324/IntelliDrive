export class User {
    name : string;
    email : string;
    password : string;
    usedStorage : number;
    storageLimit : number;

    constructor(name: string, email: string, password: string, storageLimit : number = 1024 * 1024 * 1024) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.usedStorage = 0;
        this.storageLimit = storageLimit;
    }
}