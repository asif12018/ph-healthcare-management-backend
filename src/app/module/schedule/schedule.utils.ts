


export const convertDateTime = async(date: Date) =>{
    const offSet = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offSet);
}