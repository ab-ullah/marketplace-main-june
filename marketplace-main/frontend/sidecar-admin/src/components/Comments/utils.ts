import each from "lodash/each";
import includes from "lodash/includes";


export interface IUser {
  id: number;
  display: string;
}

export const formatContent = (value: string, users: any) => {
    let content: string = value;
    let inputContent: string = value;
    let selectedUsers: any = [];
    each(users, (user: any) => {
      const userString = `@[${user.display}](${user.id})`;
      const inputUserString = `@[userID:${user.id}]`;
      if(includes(inputContent, userString)){
        inputContent = inputContent.split(userString).join(`@[userID:${user.id}]`);
        selectedUsers.push(user.id);
      }
      if(includes(content, inputUserString)){
        content = content.split(inputUserString).join(`<b>${user.display}</b>`);
      }
    });
    return {content, inputContent, selectedUsers}
  }