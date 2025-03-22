export const createAvatar = (username)=>{
    const initials = username.split(' ').map(name => name[0]).join('');
    return `https://ui-avatars.com/api/?name=${initials}&background=random&format=png`;
}