import { Role } from "./role";

export class User {
    constructor(
        public username: string,
        public password: string,
        public role: Role
      ) {}
}