export function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

export async function delay(time){
    return new Promise(resolve => {
        setTimeout(resolve,time);
    });
}