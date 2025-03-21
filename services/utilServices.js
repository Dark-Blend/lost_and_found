export const createAvatar = (username)=>{
    const initials = username.split(' ').map(name => name[0]).join('');
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    return `https://ui-avatars.com/api/?name=${initials}&background=${randomColor}&color=fff`;
}