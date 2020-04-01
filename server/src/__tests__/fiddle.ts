import onChange from "on-change";

let i = 0;
const arr = [1, 2, 3, 4];
const watchedArr = onChange(arr, function(path, value, prev) {
  console.log("Object changed:", ++i);
  console.log("this:", this);
  console.log("path:", path);
  console.log("value:", value);
  console.log("previousValue:", prev);
});

// watchedArr[0] = 3;
setInterval(() => {
  watchedArr[1] = i;
}, 1000);
