import { ROLE } from "./global.enum";

type FileObject = {
    preview?: string,
    filename?: string
}

type UserEntity = {
    sub: any,
    roles: ROLE;
}