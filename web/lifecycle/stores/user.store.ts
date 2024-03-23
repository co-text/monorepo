import { Cell } from "@cmmn/cell";

export class UserStore {

    public user = new Cell(localStorage.getItem('me'), {
        onExternal: v => localStorage.setItem('me', v)
    });
}