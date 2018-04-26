export const sleep = (time: number) => {
    return new Promise((reslove) => {
        setTimeout(reslove, time);
    });
}
